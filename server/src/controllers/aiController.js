import { generateProjectIdeaAnalysis } from '../services/aiService.js';

export const analyzeIdea = async (req, res) => {
  try {
    const { title, description, domain, targetAudience } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required for AI analysis' });
    }

    const analysis = await generateProjectIdeaAnalysis({ title, description, domain, targetAudience });
    return res.json({
      success: true,
      analysis,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
