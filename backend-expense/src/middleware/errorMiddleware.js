const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  // Log error in development, but not stack traces in production
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // Hide internal server errors in production
  const message = process.env.NODE_ENV === 'production' && statusCode === 500 
    ? 'Internal Server Error' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    message: message
  });
};

module.exports = { errorHandler };
