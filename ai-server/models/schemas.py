from pydantic import BaseModel, Field
from typing import List, Optional

class ImageAnalysisRequest(BaseModel):
    image_base64: str = Field(..., min_length=10)
    category: str = Field(..., min_length=2, max_length=50)
    language: str = Field(default="ar", pattern="^(ar|en)$")

class ImageAnalysisResult(BaseModel):
    decision: str  # Literal["accept", "review", "reject", "unavailable"]
    is_relevant: Optional[bool] = None
    is_clear: Optional[bool] = None
    is_safe: Optional[bool] = None
    detected_items: List[str] = []
    visual_attributes: dict = {}
    tags: List[str] = []
    reason: str
    user_message: str
    error_code: Optional[str] = None



class NegotiationRequest(BaseModel):
    listing_price: float = Field(..., gt=0, le=1000000000)
    offer_price: float = Field(..., gt=0, le=1000000000)
    buyer_message: Optional[str] = Field(None, max_length=1000)
    language: str = Field(default="ar", pattern="^(ar|en)$")

class NegotiationResponse(BaseModel):
    recommended_action: str  # "ACCEPT", "REJECT", "COUNTER"
    suggested_reply: str
    reasoning: str

class SearchFilterRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=200)

class SearchFilterResponse(BaseModel):
    category: Optional[str] = None
    city: Optional[str] = None
    minPrice: Optional[float] = Field(None, ge=0)
    maxPrice: Optional[float] = Field(None, ge=0)
    propertyType: Optional[str] = None
    amenities: Optional[List[str]] = None

