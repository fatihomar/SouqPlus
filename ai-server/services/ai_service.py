import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from models.schemas import ImageAnalysisResult, AdDescription

load_dotenv()

# Check if a real OpenAI API key is provided
api_key = os.environ.get("OPENAI_API_KEY")
IS_MOCK_MODE = not api_key or api_key == "your_openai_api_key_here"

if not IS_MOCK_MODE:
    client = OpenAI(api_key=api_key)
else:
    client = None


def analyze_image(image_base64: str, category: str, language: str = "ar"):
    """
    Real function for Image Analysis using OpenAI Vision API and Structured Outputs.
    """
    if IS_MOCK_MODE:
        return {
            "decision": "accept",
            "is_relevant": True,
            "is_clear": True,
            "is_safe": True,
            "detected_items": ["mock item"],
            "visual_attributes": {"condition": "new"},
            "tags": ["mock", "valid", "test"],
            "reason": "This is a mock accept response.",
            "user_message": "صورة مقبولة (توليد تجريبي من النظام).",
            "error_code": None
        }

    if not image_base64.startswith('data:image'):
        image_base64 = f"data:image/jpeg;base64,{image_base64}"
        
    prompt = (
        f"أنت مشرف محتوى صارم وذكي لموقع إعلانات مبوبة. تحقق مما إذا كانت الصورة المرفقة متوافقة وتمثل إعلان في قسم '{category}'.\n"
        f"القواعد:\n"
        f"- إذا كانت الصورة فارغة، تالفة، غير واضحة أبداً، أو مسيئة، ارفضها (reject).\n"
        f"- إذا كانت الصورة تعرض منتجاً لا علاقة له إطلاقاً بالقسم المذكور، ارفضها (reject).\n"
        f"- إذا كانت الصورة متعلقة بالقسم لكن فيها بعض العيوب (مثل إضاءة ضعيفة)، اطلب مراجعة (review) مع توضيح السبب.\n"
        f"- إذا كانت مقبولة وواضحة، اقبلها (accept).\n"
        f"يرجى الرد باللغة {language} بناءً على الهيكل المطلوب."
    )

    if language == 'en':
        prompt = (
            f"You are a strict and smart content moderator for a classified ads website. Verify if the attached image matches and represents a listing in the '{category}' category.\n"
            f"Rules:\n"
            f"- If the image is empty, corrupted, totally blurry, or unsafe, reject it.\n"
            f"- If the image shows a product completely unrelated to the given category, reject it.\n"
            f"- If it is related but has minor flaws (e.g. poor lighting), choose review and explain.\n"
            f"- If acceptable and clear, choose accept.\n"
            f"Please reply in English following the required schema."
        )

    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_base64
                            }
                        }
                    ]
                }
            ],
            response_format=ImageAnalysisResult
        )
        return response.choices[0].message.parsed.model_dump()
    except Exception as e:
        return {
            "decision": "unavailable",
            "is_relevant": None,
            "is_clear": None,
            "is_safe": None,
            "detected_items": [],
            "visual_attributes": {},
            "tags": [],
            "reason": f"AI Error: {str(e)}",
            "user_message": "تعذر فحص الصورة حالياً، يمكنك المتابعة وسيتم فحصها لاحقاً." if language == "ar" else "Image check unavailable right now, you may proceed.",
            "error_code": "AI_UNAVAILABLE"
        }



def negotiate_offer(listing_price: float, offer_price: float, buyer_message: str = None, language: str = "ar"):
    """
    Real function for Negotiation Assistant, with Mock fallback.
    """
    if IS_MOCK_MODE:
        return {
            "recommended_action": "COUNTER" if offer_price < listing_price else "ACCEPT",
            "suggested_reply": "رد تجريبي: السعر المعروض جيد ولكن يمكننا التفاوض قليلاً.",
            "reasoning": "هذا رد محاكاة (Mock) للذكاء الاصطناعي."
        }

    prompt = f"أنت مستشار مالي وتفاوض لمشتري وبائع. السعر المطلوب للإعلان هو {listing_price}. المشتري قدم عرضاً بقيمة {offer_price}. رسالة المشتري (إن وجدت): '{buyer_message}'. قم بتحليل هذا العرض واقترح الرد المناسب للبائع.\n\nالرجاء الرد بتنسيق JSON حصراً يحتوي على الحقول التالية:\n1. recommended_action: إما 'ACCEPT' إذا كان العرض ممتازاً، أو 'COUNTER' للتفاوض، أو 'REJECT' إذا كان منخفضاً جداً.\n2. suggested_reply: رسالة مقترحة للبائع ليرد بها على المشتري باللغة {language}.\n3. reasoning: شرح مقتضب لسبب هذه النصيحة باللغة {language}."

    if language == 'en':
        prompt = f"You are a negotiation and financial advisor for buyers and sellers. The listing price is {listing_price}. The buyer offered {offer_price}. Buyer's message (if any): '{buyer_message}'. Analyze this offer and suggest how the seller should respond.\n\nPlease reply in STRICT JSON format containing the following fields:\n1. recommended_action: 'ACCEPT' if excellent, 'COUNTER' to negotiate, or 'REJECT' if too low.\n2. suggested_reply: a suggested reply for the seller to send to the buyer, in {language}.\n3. reasoning: short explanation for this advice, in {language}."

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": prompt}
        ],
        response_format={ "type": "json_object" }
    )
    
    result_str = response.choices[0].message.content
    try:
        return json.loads(result_str)
    except Exception as e:
        return {
            "recommended_action": "REJECT",
            "suggested_reply": "Error generating reply.",
            "reasoning": f"Failed to parse JSON from AI: {str(e)}"
        }

def extract_search_filters(query: str):
    """
    Real function to extract structured search filters from natural language query using OpenAI JSON mode, with Mock fallback.
    """
    if IS_MOCK_MODE:
        # Provide a mock response based on the presence of certain keywords
        query_lower = query.lower()
        mock_response = {}
        if 'فيلا' in query_lower or 'villa' in query_lower:
            mock_response['category'] = 'REAL_ESTATE'
            mock_response['propertyType'] = 'فيلا'
        elif 'سيارة' in query_lower or 'car' in query_lower:
            mock_response['category'] = 'CAR'
        
        if 'اسطنبول' in query_lower or 'istanbul' in query_lower:
            mock_response['city'] = 'اسطنبول'
            
        if '500' in query_lower:
            mock_response['maxPrice'] = 500000
            
        if 'حديقة' in query_lower or 'garden' in query_lower:
            mock_response['amenities'] = ['حديقة']
            
        return mock_response

    prompt = f"أنت مساعد ذكي لاستخراج فلاتر البحث لموقع إعلانات مبوبة. المستخدم أدخل الجملة التالية (قد تكون بالعربية أو بالإنجليزية): '{query}'.\n" \
             f"يرجى استخراج الفلاتر التالية وإعادتها بتنسيق JSON حصراً. لا تضف أي نصوص أخرى.\n" \
             f"المفاتيح المسموحة في كائن الـ JSON هي فقط:\n" \
             f"- category: إما 'REAL_ESTATE' أو 'CAR' (إذا كان يبحث عن عقار أو سيارة).\n" \
             f"- city: اسم المدينة المستهدفة (مثلاً 'اسطنبول' أو 'Istanbul').\n" \
             f"- maxPrice: الحد الأقصى للسعر كرقم.\n" \
             f"- minPrice: الحد الأدنى للسعر كرقم.\n" \
             f"- propertyType: نوع العقار (مثلاً 'فيلا', 'شقة') إن وجد.\n" \
             f"- amenities: مصفوفة نصوص للميزات المطلوبة (مثلاً ['حديقة', 'مسبح']) إن وجدت.\n" \
             f"تجاهل أي مفتاح لا تملك معلومات كافية عنه من الجملة."

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": prompt}
        ],
        response_format={ "type": "json_object" }
    )
    
    result_str = response.choices[0].message.content
    try:
        return json.loads(result_str)
    except Exception as e:
        return {}
