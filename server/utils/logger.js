const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  redact: ['req.headers.authorization', 'req.headers.cookie'],
  base: { service: 'sarokar-api' },
  ...(process.env.NODE_ENV === 'production' ? {} : { transport: { target: 'pino-pretty', options: { colorize: true } } }),
});

module.exports = logger;
