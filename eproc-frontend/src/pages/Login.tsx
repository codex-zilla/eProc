import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDefaultRoute } from '../components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Loader2, Lock, User, Eye, EyeOff } from 'lucide-react';
import loginBg from '@/assets/login-bg.png';

/**
 * Login page with modernized design matching the concept.
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const redirectPath = getRoleDefaultRoute(user.role);
        navigate(redirectPath, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px]" /> {/* Subtle overlay if needed */}
      
      <Card className="z-10 w-full max-w-[420px] shadow-2xl border-0 bg-white/95 backdrop-blur-sm px-4 py-6 rounded-2xl">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="flex justify-center mb-2">
             <h1 className="text-4xl font-serif font-bold text-[#1e293b] tracking-tight">eProc</h1>
          </div>
          <h2 className="text-xl text-slate-600 font-normal">eProcurement Login</h2>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Username</Label>
              <div className="relative group">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                <Input
                  id="email"
                  type="email"
                   // Using type email for validation, though label says Username as per design
                  placeholder="" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-[#2a3455] hover:bg-[#1e253e] transition-all shadow-md mt-4" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-6 pt-2 pb-6">
          <Link 
            to="/forgot-password" 
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            Forgot password?
          </Link>
          
          <div className="text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-slate-700 font-semibold hover:underline">
              Sign up.
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
