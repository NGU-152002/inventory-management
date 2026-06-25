import { useState } from "react";
import { apiFetch } from "../../shared/api/client";
import { getActiveBranchId } from "../../shared/auth/session";
import { enqueueOfflineAction } from "../../shared/offline/queue";

export function PurchasesPage() {
  const [message, setMessage] = useState<string | null>(null);

  async function createSampleReceipt() {
    const branchId = getActiveBranchId();
    if (!branchId) {
      setMessage("No active branch in session.");
      return;
    }

    const payload = {
      branchId,
      supplierId: "supplier-1",
      invoiceNumber: `INV-${Date.now()}`,
      receivedAt: new Date().toISOString(),
      lines: [
        {
          itemId: "flour",
          quantity: 25,
          costPerUnit: 42,
          batchNumber: `FLR-${Date.now()}`
        }
      ]
    };

    try {
      await apiFetch("/purchases/receipts", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setMessage("Receipt posted to API");
    } catch {
      await enqueueOfflineAction({
        id: crypto.randomUUID(),
        endpoint: "/purchases/receipts",
        method: "POST",
        payload,
        createdAt: new Date().toISOString()
      });
      setMessage("Offline. Receipt queued locally.");
    }
  }

  return (
    <div className="panel">
      <h2>Purchases</h2>
      <button onClick={createSampleReceipt}>Post sample goods receipt</button>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
