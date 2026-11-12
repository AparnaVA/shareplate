
from fastapi import FastAPI, Request
from sqlalchemy import text
from app.exceptions.handlers import global_exception_handler
from app.database import engine
from app.routers.auth import router as auth_router
from app.routers.donations import router as donations_router
from app.utils.logger import configure_logging
from fastapi.middleware.cors import CORSMiddleware

configure_logging()

app = FastAPI(
    title="SharePlate API",
    description="Food redistribution platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(
    Exception,
    global_exception_handler
)

app.include_router(auth_router)
app.include_router(donations_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to SharePlate API"
    }

@app.get("/db-check")
def check_database():

    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "message": "PostgreSQL connected successfully!"
    }
