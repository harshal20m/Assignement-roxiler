const validateUser = (req, res, next) => {
  const { name, email, password, address } = req.body;
  const errors = [];

  // Name validation
  if (!name || name.length < 20 || name.length > 60) {
    errors.push('Name must be between 20 and 60 characters');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Valid email is required');
  }

  // Password validation (only for registration/password update)
  if (password !== undefined) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(password)) {
      errors.push('Password must be 8-16 characters with at least one uppercase letter and one special character');
    }
  }

  // Address validation
  if (!address || address.length > 400) {
    errors.push('Address is required and must not exceed 400 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateStore = (req, res, next) => {
  const { name, email, address } = req.body;
  const errors = [];

  // Name validation
  if (!name || name.length < 5 || name.length > 60) {
    errors.push('Name must be between 5 and 60 characters');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Valid email is required');
  }

  // Address validation
  if (!address || address.length > 400) {
    errors.push('Address is required and must not exceed 400 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateRating = (req, res, next) => {
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  next();
};

module.exports = { validateUser, validateStore, validateRating };