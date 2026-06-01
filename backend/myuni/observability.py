import logging
import os

logger = logging.getLogger(__name__)


def init_sentry(*, debug: bool) -> None:
    dsn = os.getenv("SENTRY_DSN", "").strip()
    if not dsn:
        return

    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration

    traces_sample_rate = float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1"))
    environment = os.getenv("SENTRY_ENVIRONMENT", "development" if debug else "production")

    sentry_sdk.init(
        dsn=dsn,
        integrations=[DjangoIntegration()],
        traces_sample_rate=traces_sample_rate,
        send_default_pii=False,
        environment=environment,
    )
    logger.info("Sentry initialized (%s)", environment)
