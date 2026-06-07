import { Router } from 'express';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// GET /api/activities
router.get('/', protect, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const activities = await Activity.find()
      .populate('user', 'name')
      .populate('deal', 'title')
      .populate('contact', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
