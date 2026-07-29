/**
  * Higher-order function to catch async errors and pass them to the express error handler.
  * @param {Function} fn - Async controller handler
  */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
