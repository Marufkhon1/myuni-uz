from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from universities.public_views import (
    PublicCompareByIdsView,
    PublicCompareShareView,
    PublicArticleDetailView,
    PublicArticleListView,
    PublicFAQDetailView,
    PublicFAQListView,
    PublicFeaturedUniversitiesView,
    PublicLandingPreviewView,
    PublicPlatformStatsView,
    PublicRecentReviewsView,
    PublicReviewFiltersView,
    PublicTopUniversityReviewsView,
    PublicSharePreviewView,
    PublicSitemapView,
    PublicTopUniversitiesView,
    PublicUniversityCatalogFiltersView,
    PublicUniversityDetailView,
    PublicUniversityListView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/universities/", include("universities.urls")),
    path(
        "api/public/universities/",
        PublicUniversityListView.as_view(),
        name="public-university-list",
    ),
    path(
        "api/public/universities/top/",
        PublicTopUniversitiesView.as_view(),
        name="public-top-universities",
    ),
    path(
        "api/public/universities/featured/",
        PublicFeaturedUniversitiesView.as_view(),
        name="public-featured-universities",
    ),
    path(
        "api/public/reviews/filters/",
        PublicReviewFiltersView.as_view(),
        name="public-review-filters",
    ),
    path(
        "api/public/reviews/recent/",
        PublicRecentReviewsView.as_view(),
        name="public-recent-reviews",
    ),
    path(
        "api/public/reviews/top-universities/",
        PublicTopUniversityReviewsView.as_view(),
        name="public-top-university-reviews",
    ),
    path(
        "api/public/universities/filters/",
        PublicUniversityCatalogFiltersView.as_view(),
        name="public-university-filters",
    ),
    path(
        "api/public/universities/<slug:slug>/",
        PublicUniversityDetailView.as_view(),
        name="public-university-detail",
    ),
    path(
        "api/public/landing-preview/",
        PublicLandingPreviewView.as_view(),
        name="public-landing-preview",
    ),
    path(
        "api/public/stats/",
        PublicPlatformStatsView.as_view(),
        name="public-platform-stats",
    ),
    path(
        "api/public/articles/",
        PublicArticleListView.as_view(),
        name="public-article-list",
    ),
    path(
        "api/public/articles/<slug:slug>/",
        PublicArticleDetailView.as_view(),
        name="public-article-detail",
    ),
    path(
        "api/public/faq/",
        PublicFAQListView.as_view(),
        name="public-faq-list",
    ),
    path(
        "api/public/faq/<slug:slug>/",
        PublicFAQDetailView.as_view(),
        name="public-faq-detail",
    ),
    path(
        "api/public/sitemap.xml",
        PublicSitemapView.as_view(),
        name="public-sitemap",
    ),
    path(
        "api/public/compare/",
        PublicCompareByIdsView.as_view(),
        name="public-compare-by-ids",
    ),
    path(
        "api/public/compare/<str:token>/",
        PublicCompareShareView.as_view(),
        name="public-compare-share",
    ),
    path(
        "api/public/share-preview/",
        PublicSharePreviewView.as_view(),
        name="public-share-preview",
    ),
]

if settings.DEBUG or getattr(settings, "ENABLE_API_DOCS", False):
    urlpatterns += [
        path("api/schema/", SpectacularAPIView.as_view(), name="api-schema"),
        path(
            "api/docs/",
            SpectacularSwaggerView.as_view(url_name="api-schema"),
            name="api-docs",
        ),
    ]

if settings.DEBUG or settings.SERVE_MEDIA:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
