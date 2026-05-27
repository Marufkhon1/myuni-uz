from django.db.models import Avg, Count
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Review, University
from .serializers import ReviewSerializer, UniversitySerializer


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
            "id", "name", "short_name", "location"
        )
        return Response(list(queryset))


class PublicRecentReviewsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = (
            Review.objects.select_related("university", "user", "user__profile")
            .order_by("-created_at")[:6]
        )
        return Response(ReviewSerializer(queryset, many=True, context={"request": request}).data)
