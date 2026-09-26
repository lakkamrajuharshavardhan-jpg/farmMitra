import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateAndDiagnoseLeaf, generateGeminiCopilotChat } from '../services/geminiService.js';

const router = Router();

router.use(authenticateToken);

/**
 * POST /api/ai/leaf-doctor
 * Standalone dedicated Leaf Doctor AI Vision scanner endpoint
 */
router.post('/leaf-doctor', async (req: Request, res: Response): Promise<void> => {
  const { cropType = 'Chilli', imageBase64 } = req.body;

  if (!imageBase64) {
    res.status(400).json({
      error: "No leaf photo provided. Please upload a clear photo of a plant leaf.",
    });
    return;
  }

  try {
    const result = await validateAndDiagnoseLeaf(imageBase64, cropType);

    if (!result.success) {
      res.status(400).json({
        error: result.error,
        validation: result.validation,
      });
      return;
    }

    res.json({
      diagnosis: result.diagnosis,
      validation: result.validation,
      assistantMessage: { message: result.diagnosis },
      reply: result.diagnosis,
    });
  } catch (err: any) {
    console.error('[AIRoute] Leaf doctor processing failed:', err.message);
    res.status(500).json({
      error: 'Failed to analyze leaf image. Please try again with a clearer photo.',
      details: err.message,
    });
  }
});

/**
 * POST /api/ai/chat
 * General FarmMitra AI Copilot Chat endpoint
 */
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  const { message, imageBase64 } = req.body;

  try {
    const aiReply = await generateGeminiCopilotChat(
      null,
      0,
      null,
      null,
      message || (imageBase64 ? 'Analyze attached leaf image' : 'Hello'),
      imageBase64
    );

    const now = new Date().toISOString();
    res.json({
      userMessage: {
        id: `user_${Date.now()}`,
        role: 'user',
        message: message || (imageBase64 ? 'Leaf Photo Attached' : ''),
        image_url: imageBase64 ? 'attached' : null,
        created_at: now,
      },
      assistantMessage: {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        message: aiReply,
        created_at: now,
      },
    });
  } catch (err: any) {
    console.error('[AIRoute] FarmMitra AI chat error:', err.message);
    res.status(500).json({ error: 'Failed to process chat query' });
  }
});

export default router;

