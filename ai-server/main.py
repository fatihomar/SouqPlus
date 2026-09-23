from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import ai_routes
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Souq+ AI Server",
    description="Python AI Microservice for Souq+ Platform",
    version="1.0.0",
)

# Allow CORS for Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include AI Routes
app.include_router(ai_routes.router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Souq+ AI Server"}
