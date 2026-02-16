import React from 'react';
import { DeliveryList } from '../../components/domain/deliveries/DeliveryList';

/**
 * Deliveries page for Engineers.
 * Shows incoming purchase orders that need verification.
 */
const Deliveries: React.FC = () => {
    return <DeliveryList role="ENGINEER" />;
};

export default Deliveries;

