from django.test import SimpleTestCase

from universities.rating_utils import (
    BAYESIAN_PRIOR_MEAN,
    BAYESIAN_PRIOR_WEIGHT,
    bayesian_rating,
    rating_confidence_label,
)


class BayesianRatingTests(SimpleTestCase):
    def test_priors_match_methodology_copy(self):
        self.assertEqual(BAYESIAN_PRIOR_MEAN, 3.8)
        self.assertEqual(BAYESIAN_PRIOR_WEIGHT, 10)

    def test_bayesian_rating_formula(self):
        # n=10, avg=5 → (10*5 + 10*3.8) / 20 = 4.4
        self.assertEqual(bayesian_rating(5, 10), 4.4)
        self.assertIsNone(bayesian_rating(5, 0))
        self.assertIsNone(bayesian_rating(None, 3))

    def test_confidence_buckets(self):
        self.assertEqual(rating_confidence_label(0), "no_reviews")
        self.assertEqual(rating_confidence_label(2), "low")
        self.assertEqual(rating_confidence_label(3), "medium")
        self.assertEqual(rating_confidence_label(9), "medium")
        self.assertEqual(rating_confidence_label(10), "high")
