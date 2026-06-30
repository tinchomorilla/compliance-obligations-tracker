"""Assembles the FastAPI application."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI

from database.db import create_all
from errors.exception_handlers import configure_exception_handlers
from router.obligations import router as obligations_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="Compliance Obligations Tracker", lifespan=lifespan)
    configure_exception_handlers(app)
    app.include_router(obligations_router)
    return app


app = create_app()
