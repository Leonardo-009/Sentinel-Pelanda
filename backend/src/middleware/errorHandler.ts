import type { NextFunction, Request, Response } from "express"

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  console.error("Error:", err)

  // Default error
  const error = {
    message: err.message || "Internal Server Error",
    status: err.status || 500,
  }

  // Validation errors
  if (err.name === "ValidationError") {
    error.status = 400
    error.message = "Validation Error"
  }

  // Rate limit errors
  if (err.status === 429) {
    error.message = "Too Many Requests"
  }

  // AI API errors
  if (err.message.includes("API")) {
    error.status = 503
    error.message = "External API Error"
  }

  res.status(error.status).json({
    error: error.message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}
