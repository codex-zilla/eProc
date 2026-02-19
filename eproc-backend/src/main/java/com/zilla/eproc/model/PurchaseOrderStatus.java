package com.zilla.eproc.model;

/**
 * Status of a Purchase Order.
 */
public enum PurchaseOrderStatus {
    OPEN, // PO created, deliveries pending
    PARTIALLY_DELIVERED,
    DELIVERED,
    CLOSED // All items fully delivered
}
