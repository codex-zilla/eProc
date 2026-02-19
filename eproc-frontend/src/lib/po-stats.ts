/**
 * Pure helper functions for computing Purchase Order statistics.
 * Extracted from PurchaseOrders.tsx and PurchaseOrderDetails.tsx
 * to keep components thin and make logic testable in isolation.
 */

interface PurchaseOrderBase {
  status: string;
  totalValue: number;
}

interface PurchaseOrderItem {
  requestedQty: number;
  orderedQty: number;
  totalDelivered: number;
}

/**
 * Compute aggregate stats for the PO list page.
 */
export function computePOListStats(purchaseOrders: PurchaseOrderBase[]) {
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

interface RequestMaterial {
    quantity: number;
    orderedQuantity?: number;
}

interface RequestDetail {
    materials: RequestMaterial[];
}

/**
 * Check if a request has been fully ordered (all materials have orderedQty >= requestedQty).
 */
export function isRequestFullyOrdered(request: RequestDetail | undefined | null): boolean {
    if (!request || !request.materials) return false;
    return request.materials.every(m => (m.orderedQuantity || 0) >= m.quantity);
}
