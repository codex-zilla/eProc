import type { PurchaseOrder, PurchaseOrderItem, RequestDetail, RequestMaterial } from '@/types/models';

/**
 * Compute aggregate stats for the PO list page.
 */
export function computePOListStats(purchaseOrders: Pick<PurchaseOrder, 'status' | 'totalValue'>[]) {
  const total = purchaseOrders.length;
  const open = purchaseOrders.filter(po => po.status === 'OPEN').length;
  const closed = purchaseOrders.filter(po => po.status === 'CLOSED').length;
  const totalValue = purchaseOrders.reduce((sum, po) => sum + po.totalValue, 0);
  const openValue = purchaseOrders
    .filter(po => po.status === 'OPEN')
    .reduce((sum, po) => sum + po.totalValue, 0);

  return { total, open, closed, totalValue, openValue };
}

/**
 * Compute summary stats for a single PO details page.
 */
export function computePODetailStats(items: PurchaseOrderItem[]) {
  const totalRequestedQty = items.reduce((sum, item) => sum + item.requestedQty, 0);
  const totalDeliveredQty = items.reduce((sum, item) => sum + item.totalDelivered, 0);
  const totalPendingDelivery = items.reduce(
    (sum, item) => sum + (item.orderedQty - item.totalDelivered),
    0
  );
  const deliveryPercentage =
    totalRequestedQty > 0
      ? Math.round((totalDeliveredQty / totalRequestedQty) * 100)
      : 0;
  const pendingItemsCount = items.filter(
    item => item.totalDelivered < item.orderedQty
  ).length;

  return {
    totalRequestedQty,
    totalDeliveredQty,
    totalPendingDelivery,
    deliveryPercentage,
    pendingItemsCount,
  };
}

/**
 * Get progress bar color class based on delivery percentage.
 */
export function getProgressColor(percent: number): string {
  if (percent < 30) return 'bg-red-500';
  if (percent < 70) return 'bg-orange-500';
  return 'bg-green-500';
}

/**
 * Derive a human-readable delivery status from delivery vs ordered quantities.
 */
export function getDeliveryStatus(totalDelivered: number, orderedQty: number) {
  if (totalDelivered >= orderedQty)
    return { label: 'DELIVERED', color: 'bg-green-50 text-green-600' } as const;
  if (totalDelivered > 0)
    return { label: 'PARTIAL', color: 'bg-orange-50 text-orange-600' } as const;
  return { label: 'ORDERED', color: 'bg-blue-50 text-blue-600' } as const;
}

/**
 * Check if a request has been fully ordered (all materials have orderedQty >= requestedQty).
 */
export function isRequestFullyOrdered(request: RequestDetail | undefined | null): boolean {
    if (!request || !request.materials) return false;
    return request.materials.every(m => (m.orderedQuantity || 0) >= m.quantity);
}

/**
 * Calculate assignable stats for a material item in PO form.
 */
export function calculateItemAssignableStats(
    material: RequestMaterial,
    existingPO: { items: any[] } | null | undefined,
    isUpdateMode: boolean
) {
    // If UpdateMode: We need to subtract OUR existing contribution to find 'Others'
    let totalDelivered = 0;

    if (isUpdateMode && existingPO) {
        const poItem = existingPO.items.find((i: any) => i.materialDisplayName === material.name);
        if (poItem) {
            if (Array.isArray(poItem.deliveryItems)) {
                totalDelivered = poItem.deliveryItems.reduce((sum: number, d: any) => sum + d.quantityDelivered, 0);
            } else if ('totalDelivered' in poItem) {
                totalDelivered = poItem.totalDelivered;
            }
        }
    }

    // Backend Total Ordered (from Request) - My Existing Contribution = Ordered By Others
    // If creating new: myExistingQty = 0.
    const backendTotal = material.orderedQuantity || 0;

    // Phase 2 Logic:
    // Creation Mode: Limit = Requested Qty (Ignore others).
    // Update Mode: Limit = Requested - Others (maxAssignable).
    let maxAssignable = 0;

    if (isUpdateMode) {
        // The maximum I can theoretically order right now
        maxAssignable = Math.max(0, material.quantity - backendTotal);
    } else {
        // Creation Mode: Limit is strictly Requested Qty (User requirement)
        maxAssignable = material.quantity;
    }

    return { totalDelivered, maxAssignable };
}
