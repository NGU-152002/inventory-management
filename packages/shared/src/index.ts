import { z } from "zod";

export const units = ["kg", "gram", "liter", "ml", "piece", "pack"] as const;
export const stockMovementKinds = [
  "purchase_receipt",
  "production_consume",
  "production_output",
  "sale",
  "waste",
  "adjustment",
  "transfer_out",
  "transfer_in"
] as const;

export type Unit = (typeof units)[number];
export type StockMovementKind = (typeof stockMovementKinds)[number];

export const roleSchema = z.enum(["owner", "branch_manager", "inventory_staff", "baker", "cashier"]);

export const branchSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string()
});

export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  role: roleSchema,
  branchIds: z.array(z.string())
});

export const authSessionSchema = z.object({
  token: z.string(),
  user: userSchema,
  branches: z.array(branchSchema),
  activeBranchId: z.string()
});

export const itemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  unit: z.enum(units),
  reorderLevel: z.number().nonnegative(),
  costPerUnit: z.number().nonnegative(),
  supplierId: z.string().optional(),
  perishable: z.boolean().default(false)
});

export const supplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  contactName: z.string().min(1),
  phone: z.string().min(1),
  email: z.email().optional(),
  address: z.string().min(1)
});

export const purchaseReceiptLineSchema = z.object({
  itemId: z.string(),
  quantity: z.number().positive(),
  costPerUnit: z.number().nonnegative(),
  batchNumber: z.string().min(1),
  expiryDate: z.string().optional()
});

export const purchaseReceiptSchema = z.object({
  branchId: z.string(),
  supplierId: z.string(),
  invoiceNumber: z.string().min(1),
  receivedAt: z.string(),
  lines: z.array(purchaseReceiptLineSchema).min(1)
});

export const recipeLineSchema = z.object({
  itemId: z.string(),
  quantity: z.number().positive()
});

export const recipeSchema = z.object({
  productId: z.string(),
  outputQuantity: z.number().positive(),
  ingredients: z.array(recipeLineSchema).min(1)
});

export const productionOrderSchema = z.object({
  branchId: z.string(),
  productId: z.string(),
  quantity: z.number().positive(),
  batchNumber: z.string().min(1),
  expiryDate: z.string().optional(),
  recipe: recipeSchema
});

export const saleLineSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  batchNumber: z.string().optional()
});

export const saleSchema = z.object({
  branchId: z.string(),
  soldAt: z.string(),
  lines: z.array(saleLineSchema).min(1)
});

export const wasteSchema = z.object({
  branchId: z.string(),
  itemId: z.string(),
  quantity: z.number().positive(),
  batchNumber: z.string().optional(),
  reason: z.enum(["expired", "damaged", "spoilage", "production_error", "overproduction", "loss"]),
  stockType: z.enum(["raw_material", "finished_good"])
});

export const stockLedgerEntrySchema = z.object({
  branchId: z.string(),
  itemId: z.string(),
  batchNumber: z.string().optional(),
  quantityDelta: z.number(),
  unitCost: z.number().nonnegative().optional(),
  movementKind: z.enum(stockMovementKinds),
  referenceId: z.string(),
  occurredAt: z.string(),
  userId: z.string()
});

export const inventoryBalanceSchema = z.object({
  branchId: z.string(),
  itemId: z.string(),
  batchNumber: z.string().optional(),
  quantity: z.number(),
  averageCost: z.number().nonnegative(),
  expiryDate: z.string().optional()
});

export const dashboardSummarySchema = z.object({
  branchId: z.string(),
  lowStockCount: z.number().nonnegative(),
  inventoryValue: z.number().nonnegative(),
  todaysSales: z.number().nonnegative(),
  todaysWasteCost: z.number().nonnegative()
});

export type Branch = z.infer<typeof branchSchema>;
export type User = z.infer<typeof userSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
export type ItemInput = z.infer<typeof itemSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type PurchaseReceiptInput = z.infer<typeof purchaseReceiptSchema>;
export type ProductionOrderInput = z.infer<typeof productionOrderSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
export type WasteInput = z.infer<typeof wasteSchema>;
export type StockLedgerEntry = z.infer<typeof stockLedgerEntrySchema>;
export type InventoryBalance = z.infer<typeof inventoryBalanceSchema>;
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
