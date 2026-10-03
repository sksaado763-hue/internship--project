import mongoose from 'mongoose';

export default function requireDatabase(_request, _response, next) {
  if (mongoose.connection.readyState === 1) return next();
  const error = new Error('The catalog is unavailable until MongoDB is connected.');
  error.status = 503;
  return next(error);
}
