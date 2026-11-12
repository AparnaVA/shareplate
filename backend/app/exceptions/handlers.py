import logging

from fastapi import Request
from fastapi.responses import JSONResponse


logger = logging.getLogger(__name__)


async def global_exception_handler(
    request: Request,
    exc: Exception
) -> JSONResponse:
    """
    Handle unexpected application errors.

    Expected errors, such as validation or authentication errors,
    are handled separately by FastAPI.
    """

    logger.exception(
        "Unexpected error: method=%s path=%s",
        request.method,
        request.url.path
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred. Please try again later."
        }
    )