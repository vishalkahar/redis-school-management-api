const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = {
    createRateLimiter: (options) => {
        const limiter = new RateLimiterMemory({
            points: options.points || 5, // Number of points
            duration: options.duration || 60, // Per second(s)
        });

        return async (req, res, next) => {
            try {
                await limiter.consume(req.ip);
                next();
            } catch (error) {
                res.status(429).json({
                    message: 'Too many requests, please try again later.'
                });
            }
        };
    }
};

module.exports = rateLimiter;