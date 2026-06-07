import { Router } from 'express';
import Deal from '../models/Deal.js';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/auth.js';
import { validateDeal } from '../middleware/validate.js';

const router = Router();

// GET /api/deals
router.get('/', protect, async (req, res) => {
  try {
    const { stage, assignedTo } = req.query;
    const filter = {};
    if (stage) filter.stage = stage;
    if (assignedTo) filter.assignedTo = assignedTo;

    const deals = await Deal.find(filter)
      .populate('contact', 'name company')
      .populate('assignedTo', 'name')
      .sort({ order: 1, createdAt: -1 });

    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/deals/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const pipeline = await Deal.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 }, totalValue: { $sum: '$value' } } },
    ]);

    const totalDeals = await Deal.countDocuments();
    const wonDeals = await Deal.countDocuments({ stage: 'closed_won' });
    const totalRevenue = await Deal.aggregate([
      { $match: { stage: 'closed_won' } },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]);

    const winRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;

    res.json({
      byStage: pipeline,
      totalDeals,
      wonDeals,
      winRate,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/deals/revenue-over-time
router.get('/revenue-over-time', protect, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const data = await Deal.aggregate([
      { $match: { stage: 'closed_won', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$value' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/deals/leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const data = await Deal.aggregate([
      { $match: { stage: 'closed_won' } },
      {
        $group: {
          _id: '$assignedTo',
          totalRevenue: { $sum: '$value' },
          dealsWon: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          totalRevenue: 1,
          dealsWon: 1,
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/deals
router.post('/', protect, validateDeal, async (req, res) => {
  try {
    const deal = await Deal.create({ ...req.body, assignedTo: req.body.assignedTo || req.user._id });
    const populated = await deal.populate([
      { path: 'contact', select: 'name company' },
      { path: 'assignedTo', select: 'name' },
    ]);

    await Activity.create({
      type: 'deal_created',
      description: `Created deal "${deal.title}" ($${deal.value.toLocaleString()})`,
      deal: deal._id,
      contact: deal.contact,
      user: req.user._id,
    });

    req.app.get('io')?.emit('deal:created', populated);
    req.app.get('io')?.emit('activity:new');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/deals/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const oldDeal = await Deal.findById(req.params.id);
    if (!oldDeal) return res.status(404).json({ message: 'Deal not found' });

    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('contact', 'name company')
      .populate('assignedTo', 'name');

    if (oldDeal.stage !== deal.stage) {
      await Activity.create({
        type: 'deal_stage_changed',
        description: `Moved "${deal.title}" from ${oldDeal.stage} to ${deal.stage}`,
        deal: deal._id,
        user: req.user._id,
      });
    } else {
      await Activity.create({
        type: 'deal_updated',
        description: `Updated deal "${deal.title}"`,
        deal: deal._id,
        user: req.user._id,
      });
    }

    req.app.get('io')?.emit('deal:updated', deal);
    req.app.get('io')?.emit('activity:new');

    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/deals/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    await Activity.create({
      type: 'deal_deleted',
      description: `Deleted deal "${deal.title}"`,
      user: req.user._id,
    });

    req.app.get('io')?.emit('deal:deleted', { id: req.params.id });
    req.app.get('io')?.emit('activity:new');

    res.json({ message: 'Deal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
