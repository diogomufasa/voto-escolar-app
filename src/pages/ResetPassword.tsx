import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the auth state change and check for recovery session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is in password recovery mode, we can proceed
        console.log('Password recovery session detected');
      } else if (event === 'SIGNED_IN' && session) {
        // User successfully reset password and is now signed in
        toast.success('Password redefinida com sucesso!');
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Check URL parameters for recovery tokens
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    
    if (!accessToken && !tokenHash && type !== 'recovery') {
      toast.error('Link de recuperação inválido ou expirado');
      navigate('/auth');
    }
  }, [searchParams, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('As passwords não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A password deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        toast.error('Erro ao redefinir password: ' + error.message);
      } else {
        // Password updated successfully, user will be automatically signed in
        toast.success('Password redefinida com sucesso!');
        navigate('/');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Erro inesperado ao redefinir password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-primary-hover flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <img src="/logo-text.png" alt="VotoEscolar Logo" className="h-[15vh] w-auto" />
          </div>
          <CardTitle>Mudar Password</CardTitle>
          <CardDescription>
            Introduza a sua nova password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'A carregar' : 'Mudar password'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              className="w-full" 
              onClick={() => navigate('/auth')}
            >
              Voltar ao Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}