import { useQuery } from '@tanstack/react-query';

// Mock data interfaces (copied from component)
export interface OrderedVsDelivered {
    materialName: string;
    unit: string;
    orderedQty: number;
    deliveredQty: number;
    remainingQty: number;
    totalValue: number;
}

export interface UnderOrderedRequest {
    requestId: number;
    materialName: string;
    requestedQty: number;
    orderedQty: number;
    unit: string;
    projectName: string;
    difference: number;
}

export interface DamagedDelivery {
    deliveryId: number;
    poNumber: string;
    materialName: string;
    quantity: number;
    unit: string;
    condition: string;
    deliveryDate: string;
    notes?: string;
}

interface ReportsData {
    orderedVsDelivered: OrderedVsDelivered[];
    underOrdered: UnderOrderedRequest[];
    damagedDeliveries: DamagedDelivery[];
}

// Mock data service
const fetchReports = async (): Promise<ReportsData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
        orderedVsDelivered: [
            {
                materialName: 'Cement (50kg bags)',
                unit: 'BAG',
                orderedQty: 500,
                deliveredQty: 450,
                remainingQty: 50,
                totalValue: 25000000
            },
            {
                materialName: 'Steel Reinforcement Bars (12mm)',
                unit: 'PCS',
                orderedQty: 300,
                deliveredQty: 300,
                remainingQty: 0,
                totalValue: 18000000
            },
            {
                materialName: 'Aggregate (20mm)',
                unit: 'TRIP',
                orderedQty: 25,
                deliveredQty: 20,
                remainingQty: 5,
                totalValue: 7500000
            }
        ],
        underOrdered: [
            {
                requestId: 145,
                materialName: 'Cement (50kg bags)',
                requestedQty: 600,
                orderedQty: 500,
                unit: 'BAG',
                projectName: 'Residential Complex A',
                difference: -100
            },
            {
                requestId: 167,
                materialName: 'Paint (Interior)',
                requestedQty: 50,
                orderedQty: 40,
                unit: 'LITER',
                projectName: 'Commercial Building',
                difference: -10
            }
        ],
        damagedDeliveries: [
            {
                deliveryId: 23,
                poNumber: 'PO-2026-001',
                materialName: 'Cement (50kg bags)',
                quantity: 10,
                unit: 'BAG',
                condition: 'DAMAGED',
                deliveryDate: '2026-02-09T14:30:00',
                notes: 'Water damage during transport'
            },
            {
                deliveryId: 28,
                poNumber: 'PO-2025-089',
                materialName: 'Ceramic Tiles',
                quantity: 5,
                unit: 'BOX',
                condition: 'PARTIAL_DAMAGE',
                deliveryDate: '2026-02-08T11:15:00',
                notes: 'Some boxes cracked'
            }
        ]
    };
};

export const useAccountantReports = () => {
    return useQuery({
        queryKey: ['accountant-reports'],
        queryFn: fetchReports,
    });
};
