function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error({ err, method: req.method, path: req.originalUrl }, 'Request failed');

  if (err.code === 11000) {
    return res.status(409).json({
      message: 'You have already submitted for this item.',
      field: Object.keys(err.keyValue || {})[0],
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid id: ${err.value}` });
  }

  const status = err.statusCode || 500;
  const message = status >= 500 && process.env.NODE_ENV === 'production'
    ? 'Something went wrong on our end.'
    : (err.message || 'Something went wrong on our end.');
  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
