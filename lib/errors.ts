export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 500, code || "DATABASE_ERROR");
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export function handlePrismaError(error: any): AppError {
  if (error.code === "P2002") {
    return new DatabaseError("Duplicate entry found", "DUPLICATE_ENTRY");
  }
  if (error.code === "P2025") {
    return new DatabaseError("Record not found", "NOT_FOUND");
  }
  return new DatabaseError(error.message, error.code);
}