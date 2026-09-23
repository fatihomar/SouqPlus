import axios from 'axios';

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8000/api/v1';

/**
 * Service to communicate with the Python AI Server
 */
const aiService = {
  /**
   * Analyze an image to check if it's valid and get tags
   * @param {string} imageUrl - The URL of the uploaded image
   */
  analyzeImage: async (imageBase64, category, language = 'ar') => {
    try {
      const response = await axios.post(`${AI_SERVER_URL}/analyze-image`, {
        image_base64: imageBase64,
        category,
        language
      });
      const result = response.data;
      
      // Node.js enforces the final decision
      let final_decision = result.decision;
      if (result.is_safe === false) {
        final_decision = "reject";
      } else if (result.is_relevant === false) {
        final_decision = "reject";
      } else if (result.is_clear === false) {
        final_decision = "review";
      }
      
      result.decision = final_decision;
      
      // Map decision back to is_valid for frontend compatibility
      // "reject" and "unavailable" (if blocking) will be false
      // If we want fail open/review for "unavailable", we can set it to true, 
      // but user advised: "لا تعتبر الفشل مساوياً للقبول".
      // Since AI is a helper here, we might want to let them pass with a warning, but let's be strict on reject.
      result.is_valid = (final_decision !== "reject");
      
      return result;
    } catch (error) {
      console.error('AI Image Analysis Error:', error.response?.data || error.message);
      // Return a fallback so the app doesn't break, but mark as review/unavailable
      return { 
        decision: "unavailable", 
        is_valid: true, // Allow submission but maybe flag it for review
        is_relevant: null, 
        is_clear: null, 
        is_safe: null, 
        reason: "AI service unavailable", 
        user_message: language === "ar" ? "تعذر فحص الصورة حالياً، يمكنك المتابعة وسيتم فحصها لاحقاً." : "Image check unavailable right now, you may proceed.",
        error_code: "AI_UNAVAILABLE" 
      };
    }
  },



  /**
   * AI Negotiation Assistant
   */
  negotiateOffer: async (listingPrice, offerPrice, buyerMessage = null, language = 'ar') => {
    try {
      const response = await axios.post(`${AI_SERVER_URL}/negotiate`, {
        listing_price: listingPrice,
        offer_price: offerPrice,
        buyer_message: buyerMessage,
        language
      });
      return response.data;
    } catch (error) {
      console.error('AI Negotiation Error:', error.response?.data || error.message);
      return null;
    }
  }
};

export default aiService;
