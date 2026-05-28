from django.test import TestCase
from rest_framework import serializers

from universities.review_validation import REVIEW_TEXT_MAX_LENGTH, REVIEW_TEXT_MIN_LENGTH, validate_review_text


class ReviewTextValidationTests(TestCase):
    def test_accepts_valid_text(self):
        text = "Andijon davlat universiteti haqida yaxshi tajribam bor edi."
        result = validate_review_text(text)
        self.assertGreaterEqual(len(result), REVIEW_TEXT_MIN_LENGTH)

    def test_rejects_short_text(self):
        with self.assertRaises(serializers.ValidationError):
            validate_review_text("qisqa")

    def test_rejects_long_text(self):
        with self.assertRaises(serializers.ValidationError):
            validate_review_text("a" * (REVIEW_TEXT_MAX_LENGTH + 1))

    def test_rejects_repetitive_characters(self):
        with self.assertRaises(serializers.ValidationError):
            validate_review_text("a" * 40)
