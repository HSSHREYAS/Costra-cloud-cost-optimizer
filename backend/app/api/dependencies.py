import logging
import os

from fastapi import Depends, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.firebase import FirebaseTokenVerifier
from app.auth.models import UserContext
from app.core.config import Settings, get_settings
from app.core.exceptions import AuthenticationError
from app.engines.estimation.calculators import CostEstimationEngine
from app.engines.recommendation.rules import RecommendationEngine
from app.integrations.aws.gateway import AwsPricingGateway
from app.services.estimation_service import CloudEstimationService
from app.services.recommendation_service import CloudRecommendationService

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer(auto_error=False)


def _firebase_credentials_available(settings: Settings) -> bool:
    """Check if a real Firebase Admin SDK credential file is configured and exists."""
    path = settings.firebase_credentials_path
    if not path or path.startswith("path/to"):
        return False
    return os.path.isfile(path)


def get_token_verifier(
    settings: Settings = Depends(get_settings),
) -> FirebaseTokenVerifier:
    return FirebaseTokenVerifier(settings)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
    verifier: FirebaseTokenVerifier = Depends(get_token_verifier),
    settings: Settings = Depends(get_settings),
) -> UserContext:
    # DEV-MODE BYPASS: skip Firebase verification when no valid credentials file exists
    if settings.environment == "development" and not _firebase_credentials_available(settings):
        logger.warning("DEV MODE: Firebase Admin credentials not configured — skipping token verification")
        return UserContext(uid="dev-user", email="dev@localhost")

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise AuthenticationError(
            code="UNAUTHORIZED",
            message="Invalid or missing authentication token",
        )
    return verifier.verify_token(credentials.credentials)


def get_pricing_gateway(
    settings: Settings = Depends(get_settings),
) -> AwsPricingGateway:
    return AwsPricingGateway(settings)


def get_estimation_engine() -> CostEstimationEngine:
    return CostEstimationEngine()


def get_recommendation_engine() -> RecommendationEngine:
    return RecommendationEngine()


def get_estimation_service(
    pricing_gateway: AwsPricingGateway = Depends(get_pricing_gateway),
    estimation_engine: CostEstimationEngine = Depends(get_estimation_engine),
) -> CloudEstimationService:
    return CloudEstimationService(
        pricing_gateway=pricing_gateway,
        estimation_engine=estimation_engine,
    )


def get_recommendation_service(
    settings: Settings = Depends(get_settings),
    pricing_gateway: AwsPricingGateway = Depends(get_pricing_gateway),
    estimation_engine: CostEstimationEngine = Depends(get_estimation_engine),
    recommendation_engine: RecommendationEngine = Depends(get_recommendation_engine),
) -> CloudRecommendationService:
    return CloudRecommendationService(
        settings=settings,
        pricing_gateway=pricing_gateway,
        estimation_engine=estimation_engine,
        recommendation_engine=recommendation_engine,
    )

