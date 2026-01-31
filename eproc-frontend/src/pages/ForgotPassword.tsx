import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Loader2, User, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // TODO: Implement password reset API call
      // await authService.forgotPassword(email);

      // For now, simulate success
      setTimeout(() => {
        setSuccess(true);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full min-h-screen md:min-h-0 md:max-w-md shadow-2xl border-0 bg-white md:bg-white/95 md:backdrop-blur-sm px-6 py-8 md:rounded-2xl rounded-none flex flex-col justify-center">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">eProc</h1>
          </div>
          <h2 className="text-lg text-slate-700 font-normal">Check your email</h2>
        </CardHeader>

        <CardContent>
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Mail className="h-16 w-16 text-green-500" />
            </div>
            <p className="text-slate-600">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-slate-500">
              If you don't see the email, check your spam folder.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2 pb-4">
          <Link
            to="/login"
            className="text-sm text-slate-800 hover:text-slate-950 transition-colors font-medium"
          >
            ← Back to login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full min-h-screen md:min-h-0 md:max-w-md shadow-2xl border-0 bg-white md:bg-white/95 md:backdrop-blur-sm px-6 py-8 md:rounded-2xl rounded-none flex flex-col justify-center">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="flex justify-center mb-2">
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">eProc</h1>
        </div>
        <h2 className="text-lg text-slate-700 font-normal">Reset your password</h2>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-black-900 font-medium">Email Address</Label>
            <div className="relative group">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500 group-focus-within:text-slate-700 transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 border-slate-300 bg-slate-50 focus:bg-white transition-colors text-slate-900"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base text-white font-semibold bg-[#2a3455] hover:bg-[#1e253e] transition-all shadow-md mt-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-2 pb-4">
        <Link
          to="/login"
          className="text-sm text-slate-800 hover:text-slate-950 transition-colors"
        >
          ← Back to login
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ForgotPassword;