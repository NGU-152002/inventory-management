import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { apiFetch } from "../../shared/api/client";
import { enqueueOfflineAction } from "../../shared/offline/queue";
export function PurchasesPage() {
    const [message, setMessage] = useState(null);
    async function createSampleReceipt() {
        const payload = {
            branchId: "main-branch",
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
        }
        catch {
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
    return (_jsxs("div", { className: "panel", children: [_jsx("h2", { children: "Purchases" }), _jsx("button", { onClick: createSampleReceipt, children: "Post sample goods receipt" }), message ? _jsx("p", { children: message }) : null] }));
}
