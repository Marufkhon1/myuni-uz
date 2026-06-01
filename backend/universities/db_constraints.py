import django
from django.db import models


def check_constraint(name, expression):
    """Django 4.2 (check=) va 5.1+ (condition=) bilan mos."""
    if django.VERSION >= (5, 1):
        return models.CheckConstraint(condition=expression, name=name)
    return models.CheckConstraint(check=expression, name=name)
