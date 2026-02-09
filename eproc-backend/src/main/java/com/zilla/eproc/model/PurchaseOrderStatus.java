package com.zilla.eproc.model;

/**
 * Status of a Purchase Order.
 */
public enum PurchaseOrderStatus {
    OPEN, // PO created, deliveries pending
    CLOSED // All items fully delivered
}
