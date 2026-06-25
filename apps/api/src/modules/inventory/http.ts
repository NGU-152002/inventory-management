import { InsufficientStockError } from "../../core/domain/inventory/index.js";

export function mapInventoryError(error: unknown) {
  if (error instanceof InsufficientStockError) {
    return {
      statusCode: 409,
      body: { message: error.message }
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      body: { message: error.message }
    };
  }

  return {
    statusCode: 500,
    body: { message: "Unexpected inventory error" }
  };
}
