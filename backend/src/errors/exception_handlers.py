"""Single mapping from domain/persistence exceptions to HTTP responses.

This is the ONLY place an HTTP status code is attached to a domain or
persistence error. Routers never catch these exceptions themselves.
"""

from __future__ import annotations

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from domain.errors import DocumentRequired, InvalidTransition
from errors.app_errors import ObligationNotFound, VersionConflict


def configure_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(InvalidTransition)
    async def handle_invalid_transition(
        request: Request, exc: InvalidTransition
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": str(exc)},
        )

    @app.exception_handler(DocumentRequired)
    async def handle_document_required(
        request: Request, exc: DocumentRequired
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": str(exc)},
        )

    @app.exception_handler(VersionConflict)
    async def handle_version_conflict(
        request: Request, exc: VersionConflict
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": str(exc)},
        )

    @app.exception_handler(ObligationNotFound)
    async def handle_obligation_not_found(
        request: Request, exc: ObligationNotFound
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": str(exc)},
        )
