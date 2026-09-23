from fastapi import APIRouter, HTTPException
from models.schemas import (
    ImageAnalysisRequest, ImageAnalysisResult,
    NegotiationRequest, NegotiationResponse,
    SearchFilterRequest, SearchFilterResponse
)
from services import ai_service

router = APIRouter()

@router.post("/analyze-image", response_model=ImageAnalysisResult)
async def analyze_image(req: ImageAnalysisRequest):
    try:
        result = ai_service.analyze_image(req.image_base64, req.category, req.language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/negotiate", response_model=NegotiationResponse)
async def negotiate_offer(req: NegotiationRequest):
    try:
        result = ai_service.negotiate_offer(
            req.listing_price, req.offer_price, req.buyer_message, req.language
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-search-filters", response_model=SearchFilterResponse)
async def extract_search_filters(req: SearchFilterRequest):
    try:
        filters = ai_service.extract_search_filters(req.query)
        return filters
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
