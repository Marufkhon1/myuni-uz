from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from universities.public_views import (
    PublicRecentReviewsView,
    PublicTopUniversitiesView,
    PublicUniversityListView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
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
        "api/public/reviews/recent/",
        PublicRecentReviewsView.as_view(),
        name="public-recent-reviews",
    ),
]

if settings.DEBUG or settings.SERVE_MEDIA:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
