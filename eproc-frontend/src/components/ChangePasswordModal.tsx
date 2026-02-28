import { useState, useEffect } from 'react';
import { GenericModal } from '@/components/common/GenericModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle } from 'lucide-react';

const ChangePasswordModal = () => {
  const { user, changePassword } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show modal if user requires password change
    if (user?.requirePasswordChange) {
      setIsOpen(true);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setIsOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Prevent closing the modal if password change is required
  const handleOpenChange = (open: boolean) => {
    if (!user?.requirePasswordChange) {
      setIsOpen(open);
    }
  };

  const modalTitle = (
    <div className="flex items-center gap-2">
      <AlertCircle className="h-5 w-5 text-amber-500" />
      Password Change Required
    </div>
  );

  const modalFooter = (
    <Button
      type="submit"
      disabled={loading}
      className="w-full bg-[#2a3455] hover:bg-[#1e253e]"
      onClick={handleSubmit}
    >
      {loading ? 'Changing Password...' : 'Change Password'}
    </Button>
  );

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={handleOpenChange}
      onInteractOutside={(e: Event) => user?.requirePasswordChange && e.preventDefault()}
      title={modalTitle}
      description="You must change your password before continuing. Your current password is the default password provided to you."
      footer={modalFooter}
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Current Password</Label>
            <Input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              disabled={loading}
            />
          </div>

        </form>
      </div>
    </GenericModal>
  );
};

export default ChangePasswordModal;
