from django.conf import settings
from django.db.models import Avg, Count
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .compare_utils import rating_distribution
from .models import ChatMembership, Review, University
from .serializers import ReviewSerializer, UniversitySerializer


def _public_university_payload(university):
    stats = Review.objects.filter(university=university).aggregate(
        average_rating=Avg("rating"),
        review_count=Count("id"),
    )
    average = stats["average_rating"]
    member_count = ChatMembership.objects.filter(university=university).count()
    return {
        **UniversitySerializer(university).data,
        "average_rating": round(average, 1) if average is not None else None,
        "review_count": stats["review_count"] or 0,
        "member_count": member_count,
        "rating_distribution": rating_distribution(university.id),
    }


class PublicTopUniversitiesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = (
            University.objects.annotate(
                review_count=Count("reviews", distinct=True),
                average_rating=Avg("reviews__rating"),
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
        queryset = University.objects.order_by("name").values(
            "id", "name", "short_name", "slug", "location"
        )
        return Response(list(queryset))


class PublicUniversityDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        university = get_object_or_404(University, slug=slug)
        payload = _public_university_payload(university)
        reviews = (
            Review.objects.filter(university=university, status=Review.Status.APPROVED)
            .select_related("university", "user", "user__profile")
            .order_by("-created_at")[:30]
        )
        payload["reviews"] = ReviewSerializer(
            reviews, many=True, context={"request": request}
        ).data
        return Response(payload)


class PublicRecentReviewsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = (
            Review.objects.filter(status=Review.Status.APPROVED)
            .select_related("university", "user", "user__profile")
            .order_by("-created_at")[:6]
        )
        return Response(ReviewSerializer(queryset, many=True, context={"request": request}).data)


class PublicSitemapView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        base = (getattr(settings, "FRONTEND_URL", None) or "https://myuni.uz").rstrip("/")
        static_paths = [
            "",
            "login",
            "signup",
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

        xml = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + "\n".join(urls)
            + "\n</urlset>"
        )
        return HttpResponse(xml, content_type="application/xml; charset=utf-8")
