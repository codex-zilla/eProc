import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDefaultRoute } from '../components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Loader2, Lock, User, Mail, Eye, EyeOff, Users } from 'lucide-react';


const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('PROJECT_OWNER');
  const [erbNumber, setErbNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register({
        name,
        email,
        password,
        role,
        erbNumber: erbNumber || undefined,
      });

      const redirectPath = getRoleDefaultRoute(role as any);
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      // Error is already set in context, but we can also set local error if needed
      // context error might be cleared on next navigation, so local state is good
      const msg = err.message || 'Registration failed';
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full min-h-screen md:min-h-0 md:max-w-md shadow-2xl border-0 bg-white md:bg-white/95 md:backdrop-blur-sm px-5 py-6 md:rounded-2xl rounded-none flex flex-col justify-center">
      <CardHeader className="space-y-1 text-center pb-4">
        <div className="flex justify-center mb-1">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">eProc</h1>
        </div>
        <h2 className="text-lg text-slate-700 font-normal">Create your account</h2>
      </CardHeader>

      <CardContent className="py-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="name" className="text-black-900 font-medium text-sm">Full Name</Label>
            <div className="relative group">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-slate-700 transition-colors" />
              <Input
                id="name"
                type="text"
                placeholder=""
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9 h-10 border-slate-300 bg-slate-50 focus:bg-white focus:outline-none transition-colors text-slate-900"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-black-900 font-medium text-sm">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-slate-700 transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-10 border-slate-300 bg-slate-50 focus:bg-white focus:outline-none transition-colors text-slate-900"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-black-900 font-medium text-sm">Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-slate-700 transition-colors" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9 h-10 border-slate-300 bg-slate-50 focus:bg-white focus:outline-none transition-colors text-slate-900"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="role" className="text-black-900 font-medium text-sm">Role</Label>
            <div className="relative group">
              <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-slate-700 transition-colors" />
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-9 pr-4 h-10 border border-slate-300 bg-slate-50 rounded-md text-sm text-slate-900 focus:bg-white focus:outline-none transition-colors appearance-none"
              >
                <option value="ENGINEER">Engineer</option>
                <option value="PROJECT_OWNER">Project Owner</option>
              </select>
            </div>
          </div>

          {role === 'ENGINEER' && (
            <div className="space-y-1">
              <Label htmlFor="erbNumber" className="text-black-900 font-medium text-sm">
                ERB Number <span className="text-slate-500 text-xs">(Engineers Registration Board)</span>
              </Label>
              <div className="relative group">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-slate-700 transition-colors" />
                <Input
                  id="erbNumber"
                  type="text"
                  placeholder="ERB/XXXX/XXXX"
                  value={erbNumber}
                  onChange={(e) => setErbNumber(e.target.value)}
                  className="pl-9 h-10 border-slate-300 bg-slate-50 focus:bg-white focus:outline-none transition-colors text-slate-900"
                />
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 text-base text-white font-semibold bg-[#2a3455] hover:bg-[#1e253e] transition-all shadow-md mt-2" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-4 pb-2">
        <div className="text-sm text-slate-800">
          Already have an account?{' '}
          <Link to="/login" className="text-black-950 font-semibold hover:underline">
            Sign in.
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Register;
