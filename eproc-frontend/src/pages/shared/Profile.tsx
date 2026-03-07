import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { Lock, LogOut, User, Shield } from 'lucide-react';

/**
 * Profile page — view user info and change password.
 * Fully aligned with the design system (shadcn/ui, brand #2a3455).
 */
const Profile = () => {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post(
        '/auth/change-password',
        { currentPassword, newPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#2a3455]" />
            My Profile
          </div>
        }
        description="Manage your account information and security settings."
        actions={
          <Button
            variant="destructive"
            size="sm"
            onClick={logout}
            className="h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-2"
          >
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        }
      />

      {/* Account Info Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-base font-bold text-[#2a3455] flex items-center">
            <Shield className="h-4 w-4 mr-2 text-[#2a3455]" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Full Name</p>
              <p className="text-sm font-semibold text-slate-900">{user?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Email</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Role</p>
              <Badge className="bg-[#2a3455]/10 text-[#2a3455] hover:bg-[#2a3455]/20 text-xs font-semibold border-0">
                {user?.role ?? '—'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-base font-bold text-[#2a3455] flex items-center">
            <Lock className="h-4 w-4 mr-2 text-[#2a3455]" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-password" className="text-slate-700 font-medium text-sm">
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="h-10 border-slate-300 bg-slate-50 focus:bg-white transition-colors text-slate-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-slate-700 font-medium text-sm">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="h-10 border-slate-300 bg-slate-50 focus:bg-white transition-colors text-slate-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-slate-700 font-medium text-sm">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-10 border-slate-300 bg-slate-50 focus:bg-white transition-colors text-slate-900"
              />
            </div>
            <div className="pt-1">
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#2a3455] hover:bg-[#1e253e] text-white font-semibold h-10 px-6 transition-all"
              >
                {loading ? 'Saving...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
