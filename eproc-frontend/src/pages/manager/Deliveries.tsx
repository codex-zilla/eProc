import React from 'react';
import { DeliveryList } from '../../components/domain/deliveries/DeliveryList';
import { useAuth } from '../../context/AuthContext';

/**
 * Delivery Tracking page for Project Owners and Accountants.
 * Shows delivery status of all purchase orders.
 */
const ManagerDeliveries: React.FC = () => {
    const { user } = useAuth();
    // Default to MANAGER if not accountant
    const role = user?.role === 'ACCOUNTANT' ? 'ACCOUNTANT' : 'MANAGER';

    return <DeliveryList role={role} />;
};

export default ManagerDeliveries;

