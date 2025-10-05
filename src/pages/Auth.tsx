import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou password incorretos');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Por favor, verifique o email antes de fazer login');
        } else {
          toast.error('Erro ao fazer login: ' + error.message);
        }
      } else {
        toast.success('Login realizado com sucesso!');
        navigate('/');
      }
    } catch (error) {
      toast.error('Erro inesperado ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Por favor, insira o seu email primeiro');
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast.error('Erro ao enviar email de recuperação: ' + error.message);
      } else {
        toast.success('Email de recuperação enviado! Verifique a sua caixa de entrada.');
      }
    } catch (error) {
      toast.error('Erro inesperado ao enviar email de recuperação');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Arrow to go back home */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          size="sm"
          className="text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Voltar para a página inicial</span>
          <span className="sm:hidden">← Voltar</span>
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-primary-hover flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <img src="/logo-text.png" alt="VotoMarista Logo" className="h-[15vh] w-auto" />
          </div>
          <CardTitle>Acesso</CardTitle>
          <CardDescription>
            Entre com os seus dados da conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@exemplo.pt"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'A carregar...' : 'Entrar'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              className="w-full" 
              disabled={resetLoading}
              onClick={handleResetPassword}
            >
              {resetLoading ? 'Enviando...' : 'Esqueci a password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}