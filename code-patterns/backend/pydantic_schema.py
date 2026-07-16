"""
Strict Pydantic v2 Schema Pattern
---------------------------------
Demonstrates data contract enforcement for domain entities (e.g., Projects).
Guarantees runtime schema validation, clean OpenAPI generation, and proper type coercion.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ProjectModel(BaseModel):
    """
    Pydantic schema representing a showcase project in the database and API responses.
    """
    title: str = Field(..., description="The public title of the project")
    slug: str = Field(..., description="URL-friendly identifier unique across projects")

    # Rich content & presentation fields
    description: Optional[str] = Field(default="", description="Short summary card text")
    content: Optional[str] = Field(default="", description="Comprehensive markdown/HTML project write-up")
    media: List[str] = Field(default_factory=list, description="Array of image/video asset URLs")
    links: List[Dict[str, Any]] = Field(default_factory=list, description="External links (GitHub, Live Demo, Whitepaper)")

    # Metadata & Categorization
    tech: List[str] = Field(..., description="List of technical skills and framework tags")
    status: str = Field(..., description="Status flag (e.g., 'Completed', 'In Progress', 'Archived')")
    icon: str = Field(..., description="React Icon key string (e.g., 'FaReact', 'SiFastapi')")

    # Access & Display Control
    isRestricted: bool = Field(default=False, description="Flag indicating if code is closed-source/proprietary")
    isShow: bool = Field(default=True, description="Visibility toggle controlling public dashboard display")
    order: int = Field(..., description="Sort order weight used for custom drag-and-drop ordering")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Enterprise Document Intelligence Engine",
                "slug": "enterprise-doc-intelligence",
                "description": "AI-powered extraction pipeline using LLMs and vector search.",
                "tech": ["Python", "FastAPI", "MongoDB", "PyTorch"],
                "status": "Completed",
                "icon": "FaBrain",
                "isRestricted": True,
                "isShow": True,
                "order": 10
            }
        }
