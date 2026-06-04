import html
import re
from datetime import timedelta
from urllib.parse import urlparse

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Profile

from .catalog_utils import (
    apply_catalog_filters,
    annotated_universities_queryset,
    catalog_filter_options,
    serialize_university_card,
    serialize_university_detail,
)
from .university_images import build_university_image_url, is_legacy_placeholder_url
from .review_trust_utils import (
    annotate_reviews_with_likes,
    aspect_averages_for_university,
    generate_review_insight_summary,
    public_review_filter_options,
)
from .models import Article, ChatMembership, ChatMessage, CompareShareLink, FAQItem, Review, University
from .serializers import ReviewSerializer, UniversitySerializer, display_name_for_user

User = get_user_model()


def _platform_stats_payload():
    seven_days_ago = timezone.now() - timedelta(days=7)
    university_count = University.objects.count()
    review_count = Review.objects.filter(status=Review.Status.APPROVED).count()
    member_count = Profile.objects.count()
    chat_member_count = ChatMembership.objects.values("user_id").distinct().count()
    message_count = ChatMessage.objects.filter(is_deleted=False).count()
    reviews_last_7_days = Review.objects.filter(
        status=Review.Status.APPROVED,
        created_at__gte=seven_days_ago,
    ).count()
    new_members_last_7_days = User.objects.filter(date_joined__gte=seven_days_ago).count()

    return {
        "university_count": university_count,
        "review_count": review_count,
        "member_count": member_count,
        "chat_member_count": chat_member_count,
        "message_count": message_count,
        "reviews_last_7_days": reviews_last_7_days,
        "new_members_last_7_days": new_members_last_7_days,
    }


def _serialize_top_university(university):
    average = university.average_rating
    return {
        **UniversitySerializer(university).data,
        "review_count": university.review_count or 0,
        "member_count": getattr(university, "member_count", 0) or 0,
        "average_rating": round(average, 1) if average is not None else None,
    }


def _serialize_public_chat_message(message):
    profile = getattr(message.user, "profile", None)
    author_role = getattr(profile, "role", None) or "applicant"
    return {
        "id": message.id,
        "author": display_name_for_user(message.user),
        "author_role": author_role,
        "university": {
            "short_name": message.university.short_name,
            "name": message.university.name,
        },
        "text": message.text.strip(),
        "created_at": message.created_at.isoformat(),
    }


def _landing_demo_chat_thread(limit=12):
    latest_message = (
        ChatMessage.objects.filter(is_deleted=False)
        .select_related("university")
        .order_by("-created_at")
        .first()
    )
    if not latest_message:
        return [], None

    university = latest_message.university
    messages_qs = (
        ChatMessage.objects.filter(is_deleted=False, university=university)
        .select_related("university", "user", "user__profile")
        .order_by("-created_at")[:limit]
    )
    messages = [_serialize_public_chat_message(message) for message in reversed(list(messages_qs))]
    chat_university = {
        "short_name": university.short_name,
        "name": university.name,
    }
    return messages, chat_university


def _top_universities_queryset(limit=6):
    return (
        University.objects.annotate(
            review_count=Count(
                "reviews",
                filter=Q(reviews__status=Review.Status.APPROVED),
                distinct=True,
            ),
            average_rating=Avg(
                "reviews__rating",
                filter=Q(reviews__status=Review.Status.APPROVED),
            ),
            member_count=Count("chat_memberships", distinct=True),
        )
        .order_by("-review_count", "-member_count", "-average_rating", "name")[:limit]
    )


def _public_university_payload(university):
    payload = serialize_university_detail(
        university,
        include_faculties=True,
        include_admission=True,
    )
    member_count = ChatMembership.objects.filter(university=university).count()
    payload["member_count"] = member_count
    payload["aspect_averages"] = aspect_averages_for_university(university.id)
    payload["review_insight_summary"] = generate_review_insight_summary(university.id)
    return payload


class PublicTopUniversitiesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = (
            University.objects.annotate(
                review_count=Count(
                    "reviews",
                    filter=Q(reviews__status=Review.Status.APPROVED),
                    distinct=True,
                ),
                average_rating=Avg(
                    "reviews__rating",
                    filter=Q(reviews__status=Review.Status.APPROVED),
                ),
            )
            .order_by("-review_count", "-average_rating", "name")[:6]
        )
        results = []
        for university in queryset:
            average = university.average_rating
            results.append(
                {
                    **UniversitySerializer(university).data,
                    "review_count": university.review_count or 0,
                    "average_rating": round(average, 1) if average is not None else None,
                }
            )
        return Response(results)


class PublicUniversityListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = apply_catalog_filters(
            annotated_universities_queryset(),
            request.query_params,
        )
        results = [serialize_university_card(university) for university in queryset]
        return Response(
            {
                "count": len(results),
                "filters": catalog_filter_options(),
                "results": results,
            }
        )


class PublicUniversityCatalogFiltersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(catalog_filter_options())


class PublicUniversityDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        university = get_object_or_404(University, slug=slug)
        payload = _public_university_payload(university)
        from .review_trust_utils import annotate_reviews_with_likes

        reviews = annotate_reviews_with_likes(
            Review.objects.filter(university=university, status=Review.Status.APPROVED)
            .select_related(
                "university",
                "user",
                "user__profile",
                "study_direction",
                "official_reply",
                "official_reply__author",
            )
            .prefetch_related("images")
            .order_by("-created_at"),
            request.user,
        )[:30]
        payload["reviews"] = ReviewSerializer(
            reviews, many=True, context={"request": request}
        ).data
        return Response(payload)


def _serialize_public_article(article, *, include_body=False):
    payload = {
        "id": article.id,
        "title": article.title,
        "slug": article.slug,
        "excerpt": article.excerpt,
        "cover_image": article.cover_image,
        "published_at": article.published_at.isoformat() if article.published_at else None,
        "updated_at": article.updated_at.isoformat() if article.updated_at else None,
    }
    if include_body:
        payload["body"] = article.body
    return payload


class PublicArticleListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = Article.objects.filter(status=Article.Status.PUBLISHED).order_by(
            "-published_at", "-created_at"
        )
        return Response([_serialize_public_article(article) for article in queryset])


class PublicArticleDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        article = get_object_or_404(Article, slug=slug, status=Article.Status.PUBLISHED)
        return Response(_serialize_public_article(article, include_body=True))


class PublicRecentReviewsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            limit = int(request.GET.get("limit", 6))
        except (TypeError, ValueError):
            limit = 6
        limit = max(1, min(limit, 20))

        queryset = Review.objects.filter(status=Review.Status.APPROVED).select_related(
            "university",
            "user",
            "user__profile",
            "study_direction",
            "official_reply",
            "official_reply__author",
        ).prefetch_related("images")

        city = (request.GET.get("city") or "").strip()
        if city:
            queryset = queryset.filter(
                Q(university__city__iexact=city) | Q(university__location__iexact=city)
            )

        min_rating = request.GET.get("min_rating")
        if min_rating:
            try:
                queryset = queryset.filter(rating__gte=int(min_rating))
            except (TypeError, ValueError):
                pass

        max_rating = request.GET.get("max_rating")
        if max_rating:
            try:
                queryset = queryset.filter(rating__lte=int(max_rating))
            except (TypeError, ValueError):
                pass

        direction_id = request.GET.get("direction_id")
        if direction_id:
            try:
                queryset = queryset.filter(study_direction_id=int(direction_id))
            except (TypeError, ValueError):
                pass

        sort = (request.GET.get("sort") or "newest").strip()

        queryset = annotate_reviews_with_likes(queryset, request.user)
        if sort == "rating":
            queryset = queryset.order_by("-rating", "-created_at")
        elif sort == "helpful":
            queryset = queryset.order_by("-like_count", "-created_at")
        else:
            queryset = queryset.order_by("-created_at")

        queryset = queryset[:limit]
        return Response(ReviewSerializer(queryset, many=True, context={"request": request}).data)


def _top_university_featured_reviews(limit=3, request=None):
    """Top universitetlar uchun har biridan eng ko'p like olgan sharh."""
    user = getattr(request, "user", None) if request else None
    featured_reviews = []

    for university in _top_universities_queryset(limit=limit):
        review_qs = (
            Review.objects.filter(status=Review.Status.APPROVED, university=university)
            .select_related(
                "university",
                "user",
                "user__profile",
                "study_direction",
                "official_reply",
                "official_reply__author",
            )
            .prefetch_related("images")
        )
        review_qs = annotate_reviews_with_likes(review_qs, user)
        review = review_qs.order_by("-like_count", "-created_at").first()
        if review:
            featured_reviews.append(review)

    featured_reviews.sort(
        key=lambda review: (
            getattr(review, "like_count", 0) or 0,
            review.created_at.timestamp() if review.created_at else 0,
        ),
        reverse=True,
    )
    return featured_reviews


class PublicTopUniversityReviewsView(APIView):
    """Landing ijtimoiy isbot: top universitetlarning eng foydali sharhlari."""

    permission_classes = [AllowAny]

    def get(self, request):
        try:
            limit = int(request.GET.get("limit", 3))
        except (TypeError, ValueError):
            limit = 3
        limit = max(1, min(limit, 6))

        reviews = _top_university_featured_reviews(limit=limit, request=request)
        return Response(
            ReviewSerializer(reviews, many=True, context={"request": request}).data
        )


class PublicReviewFiltersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(public_review_filter_options())


class PublicPlatformStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(_platform_stats_payload())


class PublicLandingPreviewView(APIView):
    """Landing demo uchun faqat real DB ma'lumotlari."""

    permission_classes = [AllowAny]

    def get(self, request):
        stats = _platform_stats_payload()
        universities = [
            _serialize_top_university(university)
            for university in _top_universities_queryset(limit=3)
        ]
        compare_universities = universities[:2]

        featured_review_qs = (
            Review.objects.filter(status=Review.Status.APPROVED)
            .select_related("university", "user", "user__profile")
            .order_by("-created_at")[:1]
        )
        featured_review = (
            ReviewSerializer(
                featured_review_qs[0],
                context={"request": request},
            ).data
            if featured_review_qs
            else None
        )

        chat_messages, chat_university = _landing_demo_chat_thread(limit=12)

        return Response(
            {
                "stats": stats,
                "universities": universities,
                "compare_universities": compare_universities,
                "featured_review": featured_review,
                "chat_messages": chat_messages,
                "chat_university": chat_university,
            }
        )


class PublicFeaturedUniversitiesView(APIView):
    """Landing hamkorlar/logotiplar uchun — chat yoki sharh faolligi bo'yicha."""

    permission_classes = [AllowAny]

    def get(self, request):
        try:
            limit = int(request.GET.get("limit", 12))
        except (TypeError, ValueError):
            limit = 12
        limit = max(1, min(limit, 24))

        queryset = _top_universities_queryset(limit=limit)
        return Response([_serialize_top_university(university) for university in queryset])


def _serialize_faq_item(item, *, include_body=True):
    payload = {
        "id": item.id,
        "slug": item.slug,
        "question": item.question,
        "category": item.category,
        "sort_order": item.sort_order,
        "updated_at": item.updated_at,
    }
    if include_body:
        payload["answer"] = item.answer
    return payload


class PublicFAQListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        items = FAQItem.objects.filter(is_published=True)
        category = (request.GET.get("category") or "").strip()
        if category:
            items = items.filter(category=category)
        items = items.order_by("sort_order", "id")
        return Response(
            {
                "count": items.count(),
                "items": [_serialize_faq_item(item) for item in items],
            }
        )


class PublicFAQDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        item = get_object_or_404(FAQItem, slug=slug, is_published=True)
        return Response(_serialize_faq_item(item))


class PublicSitemapView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        base = (getattr(settings, "FRONTEND_URL", None) or "https://myuni.uz").rstrip("/")
        static_paths = [
            "",
            "login",
            "signup",
            "universitetlar",
            "savollar-javob",
            "foydalanish-shartlari",
            "maxfiylik-siyosati",
            "sharh-qoidalari",
        ]
        urls = []
        for path in static_paths:
            loc = f"{base}/{path}" if path else f"{base}/"
            urls.append(f"  <url><loc>{loc}</loc><changefreq>weekly</changefreq></url>")

        for slug in University.objects.order_by("name").values_list("slug", flat=True):
            urls.append(
                f"  <url><loc>{base}/universitet/{slug}</loc><changefreq>weekly</changefreq></url>"
            )

        for slug in FAQItem.objects.filter(is_published=True).values_list("slug", flat=True):
            urls.append(
                f"  <url><loc>{base}/savollar-javob/{slug}</loc><changefreq>monthly</changefreq></url>"
            )

        xml = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + "\n".join(urls)
            + "\n</urlset>"
        )
        return HttpResponse(xml, content_type="application/xml; charset=utf-8")


SITE_NAME = "MyUni.uz"
DEFAULT_TITLE = "MyUni.uz | Universitetlar reytingi va talabalar sharhlari"
DEFAULT_DESCRIPTION = (
    "MyUni.uz — O'zbekiston universitetlari haqida talabalar sharhlari, "
    "reyting va tanlov uchun ochiq ma'lumot platformasi."
)
DEFAULT_OG_IMAGE = "/images/universities/_default.jpg"
META_DESCRIPTION_MAX = 160

LEGAL_PAGES = {
    "/foydalanish-shartlari": (
        "Foydalanish shartlari | MyUni.uz",
        "MyUni.uz platformasidan foydalanish shartlari va qoidalari.",
    ),
    "/maxfiylik-siyosati": (
        "Maxfiylik siyosati | MyUni.uz",
        "MyUni.uz maxfiylik siyosati — shaxsiy ma'lumotlaringiz qanday himoyalanishi haqida.",
    ),
    "/sharh-qoidalari": (
        "Sharh qoidalari | MyUni.uz",
        "MyUni.uz sharh qoidalari — talabalar sharhlari uchun moderatsiya va sifat standartlari.",
    ),
}


def _frontend_base_url():
    return (getattr(settings, "FRONTEND_URL", None) or "https://myuni.uz").rstrip("/")


def _truncate_description(value):
    text = re.sub(r"\s+", " ", str(value or "")).strip()
    if not text:
        return DEFAULT_DESCRIPTION
    if len(text) <= META_DESCRIPTION_MAX:
        return text
    return f"{text[: META_DESCRIPTION_MAX - 1].rstrip()}…"


def _normalize_share_path(raw_path):
    path = str(raw_path or "/").strip()
    if not path:
        return "/"
    parsed = urlparse(path)
    normalized = parsed.path or "/"
    if not normalized.startswith("/"):
        normalized = f"/{normalized}"
    return normalized.rstrip("/") or "/"


def _absolute_share_url(path_or_url):
    if not path_or_url:
        path_or_url = DEFAULT_OG_IMAGE
    if str(path_or_url).startswith(("http://", "https://")):
        return str(path_or_url)
    base = _frontend_base_url()
    path = path_or_url if str(path_or_url).startswith("/") else f"/{path_or_url}"
    return f"{base}{path}"


def _canonical_share_url(path):
    normalized = _normalize_share_path(path)
    base = _frontend_base_url()
    return f"{base}/" if normalized == "/" else f"{base}{normalized}"



def _is_unreliable_image(url):
    return is_legacy_placeholder_url(url)


def _university_og_image(university):
    image_url = build_university_image_url(university)
    if image_url:
        if image_url.startswith(("http://", "https://")):
            return image_url
        return _absolute_share_url(image_url)
    return _absolute_share_url(DEFAULT_OG_IMAGE)


def _build_share_meta_for_path(path):
    normalized = _normalize_share_path(path)
    canonical = _canonical_share_url(normalized)
    image = _absolute_share_url(DEFAULT_OG_IMAGE)
    image_alt = f"{SITE_NAME} — universitet sharhlari va reyting platformasi"
    robots = "index, follow"
    page_type = "website"

    if normalized == "/":
        return {
            "title": DEFAULT_TITLE,
            "description": _truncate_description(
                "Abituriyent va talabalar uchun universitetlarni real sharh, reyting va "
                "hamjamiyat orqali solishtirish platformasi."
            ),
            "canonical": canonical,
            "image": image,
            "image_alt": image_alt,
            "type": page_type,
            "robots": robots,
        }

    if normalized in LEGAL_PAGES:
        title, description = LEGAL_PAGES[normalized]
        return {
            "title": title,
            "description": _truncate_description(description),
            "canonical": canonical,
            "image": image,
            "image_alt": image_alt,
            "type": page_type,
            "robots": robots,
        }

    if normalized == "/universitetlar":
        return {
            "title": "Universitetlar katalogi | MyUni.uz",
            "description": _truncate_description(
                "O'zbekiston universitetlarini shahar, turi, reyting va sharhlar bo'yicha "
                "filtrlash va qidirish."
            ),
            "canonical": canonical,
            "image": image,
            "image_alt": image_alt,
            "type": page_type,
            "robots": robots,
        }

    if normalized == "/maqolalar":
        return {
            "title": "Maqolalar | MyUni.uz",
            "description": _truncate_description(
                "Universitet tanlash, sharhlar va MyUni.uz platformasidan foydalanish "
                "bo'yicha foydali maqolalar."
            ),
            "canonical": canonical,
            "image": image,
            "image_alt": image_alt,
            "type": page_type,
            "robots": robots,
        }

    if normalized == "/savollar-javob":
        return {
            "title": "Savol-javob (FAQ) | MyUni.uz",
            "description": _truncate_description(
                "MyUni.uz platformasi, sharhlar, chat va ro'yxatdan o'tish bo'yicha "
                "ko'p so'raladigan savollar va javoblar."
            ),
            "canonical": canonical,
            "image": image,
            "image_alt": image_alt,
            "type": page_type,
            "robots": robots,
        }

    faq_match = re.fullmatch(r"/savollar-javob/(?P<slug>[-\w]+)", normalized)
    if faq_match:
        slug = faq_match.group("slug")
        item = get_object_or_404(FAQItem, slug=slug, is_published=True)
        title = f"{item.question} | MyUni.uz FAQ"
        return {
            "title": title,
            "description": _truncate_description(item.answer),
            "canonical": _canonical_share_url(normalized),
            "image": image,
            "image_alt": f"{item.question} — MyUni.uz FAQ",
            "type": page_type,
            "robots": robots,
        }

    article_match = re.fullmatch(r"/maqolalar/(?P<slug>[-\w]+)", normalized)
    if article_match:
        slug = article_match.group("slug")
        article = get_object_or_404(Article, slug=slug, status=Article.Status.PUBLISHED)
        title = f"{article.title} | MyUni.uz"
        description = article.excerpt or _truncate_description(article.body)
        article_image = (article.cover_image or "").strip()
        if article_image:
            article_image = (
                article_image
                if article_image.startswith(("http://", "https://"))
                else _absolute_share_url(article_image)
            )
        else:
            article_image = image
        return {
            "title": title,
            "description": _truncate_description(description),
            "canonical": _canonical_share_url(normalized),
            "image": article_image,
            "image_alt": f"{article.title} — MyUni.uz maqolasi",
            "type": "article",
            "robots": robots,
        }

    university_match = re.fullmatch(r"/universitet/(?P<slug>[-\w]+)", normalized)
    if university_match:
        slug = university_match.group("slug")
        university = get_object_or_404(University, slug=slug)
        stats = Review.objects.filter(university=university, status=Review.Status.APPROVED).aggregate(
            average_rating=Avg("rating"),
            review_count=Count("id"),
        )
        average = stats["average_rating"]
        review_count = stats["review_count"] or 0
        average_label = round(average, 1) if average is not None else "—"
        title = f"{university.name} — sharhlar va reyting | MyUni.uz"
        description = (
            f"{university.name} ({university.location}): {review_count} ta talaba sharhi, "
            f"o'rtacha baho {average_label}. MyUni.uz da o'qing."
        )
        return {
            "title": title,
            "description": _truncate_description(description),
            "canonical": _canonical_share_url(normalized),
            "image": _university_og_image(university),
            "image_alt": f"{university.name} — MyUni.uz universitet sahifasi",
            "type": page_type,
            "robots": robots,
        }

    return {
        "title": DEFAULT_TITLE,
        "description": _truncate_description(DEFAULT_DESCRIPTION),
        "canonical": canonical,
        "image": image,
        "image_alt": image_alt,
        "type": page_type,
        "robots": robots,
    }


def _render_share_html(meta):
    title = html.escape(meta["title"])
    description = html.escape(meta["description"])
    canonical = html.escape(meta["canonical"])
    image = html.escape(meta["image"])
    image_alt = html.escape(meta["image_alt"])
    robots = html.escape(meta["robots"])
    page_type = html.escape(meta["type"])

    return f"""<!doctype html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="{description}" />
  <meta name="robots" content="{robots}" />
  <meta property="og:site_name" content="{SITE_NAME}" />
  <meta property="og:type" content="{page_type}" />
  <meta property="og:locale" content="uz_UZ" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:url" content="{canonical}" />
  <meta property="og:image" content="{image}" />
  <meta property="og:image:secure_url" content="{image}" />
  <meta property="og:image:alt" content="{image_alt}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{description}" />
  <meta name="twitter:image" content="{image}" />
  <meta name="twitter:image:alt" content="{image_alt}" />
  <link rel="canonical" href="{canonical}" />
  <title>{title}</title>
  <meta http-equiv="refresh" content="0; url={canonical}" />
</head>
<body>
  <p><a href="{canonical}">{title}</a></p>
</body>
</html>"""


class PublicSharePreviewView(APIView):
    """Ijtimoiy tarmoq botlari uchun server-side link preview HTML."""

    permission_classes = [AllowAny]

    def get(self, request):
        path = request.GET.get("path") or "/"
        meta = _build_share_meta_for_path(path)
        return HttpResponse(_render_share_html(meta), content_type="text/html; charset=utf-8")


class PublicCompareShareView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        share = CompareShareLink.objects.filter(token=token).first()
        if not share:
            return Response(
                {"detail": "Havola topilmadi.", "code": "not_found"},
                status=404,
            )
        if share.is_expired:
            return Response(
                {
                    "detail": "Havola muddati tugagan.",
                    "code": "expired",
                    "expires_at": share.expires_at.isoformat(),
                },
                status=410,
            )

        return Response(
            {
                **share.snapshot,
                "expires_at": share.expires_at.isoformat(),
                "created_at": share.created_at.isoformat(),
                "token": share.token,
            }
        )
