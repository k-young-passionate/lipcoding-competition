from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.database import engine, Base
from app.routes import router
import uvicorn

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Mentor-Mentee Matching API",
    description="API for matching mentors and mentees in a mentoring platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include API routes
app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    """Redirect to Swagger UI"""
    return RedirectResponse(url="/docs")


@app.get("/swagger-ui")
async def swagger_ui():
    """Redirect to Swagger UI"""
    return RedirectResponse(url="/docs")


@app.get("/openapi.json")
async def get_openapi():
    """Get OpenAPI specification"""
    return app.openapi()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
