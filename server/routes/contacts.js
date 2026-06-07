import { Router } from 'express';
import Contact from '../models/Contact.js';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/auth.js';
import { validateContact } from '../middleware/validate.js';

const router = Router();

// GET /api/contacts
router.get('/', protect, async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const contacts = await Contact.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/contacts
router.post('/', protect, validateContact, async (req, res) => {
  try {
    const contact = await Contact.create({ ...req.body, createdBy: req.user._id });

    await Activity.create({
      type: 'contact_created',
      description: `Added contact "${contact.name}"`,
      contact: contact._id,
      user: req.user._id,
    });

    req.app.get('io')?.emit('activity:new');

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/contacts/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
