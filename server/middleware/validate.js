export const validateDeal = (req, res, next) => {
  const { title, value, contact } = req.body;
  const errors = [];

  if (!title?.trim()) errors.push('Title is required');
  if (value === undefined || value === null || isNaN(value) || value < 0) errors.push('Value must be a positive number');
  if (!contact) errors.push('Contact is required');

  if (errors.length) return res.status(400).json({ message: errors.join(', ') });
  next();
};

export const validateContact = (req, res, next) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
  next();
};

export const validateAuth = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email?.trim()) errors.push('Email is required');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters');

  if (errors.length) return res.status(400).json({ message: errors.join(', ') });
  next();
};
