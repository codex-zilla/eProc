interface UrgencyBadgeProps {
  isUrgent: boolean;
}

/**
 * Urgency badge showing emergency/normal status.
 */
const UrgencyBadge = ({ isUrgent }: UrgencyBadgeProps) => {
  if (!isUrgent) return null;
  
  return (
    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
      🚨 URGENT
    </span>
  );
};

export default UrgencyBadge;
