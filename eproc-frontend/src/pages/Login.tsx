import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDefaultRoute } from '../components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Loader2, Lock, User, Eye, EyeOff } from 'lucide-react';

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
    <Card className="w-full min-h-screen md:min-h-0 md:max-w-md shadow-2xl border-0 bg-white md:bg-white/95 md:backdrop-blur-sm px-6 py-8 md:rounded-2xl rounded-none flex flex-col justify-center">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
             <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">eProc</h1>
          </div>
          <h2 className="text-lg text-slate-700 font-normal">Welcome back to eProc</h2>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-black-900 font-medium">Username</Label>
              <div className="relative group">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500 group-focus-within:text-slate-700 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 border-slate-300 bg-slate-50 focus:bg-white transition-colors text-slate-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-black-900 font-medium">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500 group-focus-within:text-slate-700 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 border-slate-300 bg-slate-50 focus:bg-white transition-colors text-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700 focus:outline-none"
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
              className="w-full h-12 text-base text-white font-semibold bg-[#2a3455] hover:bg-[#1e253e] transition-all shadow-md mt-4" 
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
        
        <CardFooter className="flex flex-col gap-4 pt-2 pb-4">
          <Link 
            to="/forgot-password" 
            className="text-sm text-slate-800 hover:text-slate-950 transition-colors"
          >
            Forgot password?
          </Link>
          
          <div className="text-sm text-slate-800">
            Don't have an account?{' '}
            <Link to="/register" className="text-black-950 font-semibold hover:underline">
              Sign up.
            </Link>
          </div>
        </CardFooter>
      </Card>
  );
};

export default Login;
