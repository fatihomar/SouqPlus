import aiService from '../services/ai.service.js';
import prisma from '../config/prisma.js';

class AIController {
  logUsage = async (userId, feature, status, tokens, cost) => {
    if (!userId) return;
    try {
      await prisma.aiUsageLog.create({
        data: {
          userId,
          feature,
          status,
          tokensUsed: tokens,
          estimatedCost: cost
        }
      });
    } catch (e) {
      console.error('Failed to log AI usage:', e);
    }
  }



  analyzeImage = async (req, res, next) => {
    try {
      const { image_base64, category, language } = req.body;
      const userId = req.user?.id;

      const result = await aiService.analyzeImage(image_base64, category, language || 'ar');
      
      // Estimate: 1000 tokens, $0.005 cost for image analysis
      await this.logUsage(userId, 'Image Analyzer', 'SUCCESS', 1000, 0.005);
      
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      await this.logUsage(req.user?.id, 'Image Analyzer', 'ERROR', 0, 0);
      next(error);
    }
  }

  negotiateOffer = async (req, res, next) => {
    try {
      const { listing_price, offer_price, buyer_message, language } = req.body;
      const userId = req.user?.id;

      const result = await aiService.negotiateOffer(listing_price, offer_price, buyer_message, language || 'ar');
      
      if (result) {
        // Estimate: 300 tokens, $0.0005 cost for negotiation
        await this.logUsage(userId, 'Offer Negotiator', 'SUCCESS', 300, 0.0005);
        return res.status(200).json({ success: true, data: result });
      } else {
        await this.logUsage(userId, 'Offer Negotiator', 'FAILED', 0, 0);
        return res.status(500).json({ success: false, message: 'AI negotiation failed' });
      }
    } catch (error) {
      await this.logUsage(req.user?.id, 'Offer Negotiator', 'ERROR', 0, 0);
      next(error);
    }
  }
}

export default new AIController();
