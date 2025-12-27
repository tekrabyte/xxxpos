import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useActor } from '../hooks/useActor';
import { UserRole } from '../backend';

export default function WelcomerPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { actor } = useActor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Silakan masukkan username');
      return;
    }

    if (!password.trim()) {
      toast.error('Silakan masukkan password');
      return;
    }

    if (!actor) {
      toast.error('Backend tidak tersedia');
      return;
    }

    setIsProcessing(true);

    try {
      // STEP 1: Complete session cleanup before authentication
      sessionStorage.clear();
      localStorage.clear();
      
      // STEP 2: Authenticate with username and password
      const isAuthenticated = await actor.authenticateOwner(username.trim(), password.trim());
      
      if (!isAuthenticated) {
        toast.error('Username atau password tidak valid');
        setIsProcessing(false);
        return;
      }

      // STEP 3: Fetch user role to determine auth type
      const userRole = await actor.getCallerUserRole();
      
      // STEP 4: Determine auth type based on role
      let authType: string;
      
      if (userRole === UserRole.admin) {
        authType = 'owner';
      } else if (userRole === UserRole.user) {
        authType = 'staff';
      } else if (userRole === UserRole.guest) {
        authType = 'customer';
      } else {
        // Unknown role, clear session and show error
        sessionStorage.clear();
        localStorage.clear();
        toast.error('Role pengguna tidak valid');
        setIsProcessing(false);
        return;
      }
      
      // STEP 5: Set 1-month session with consistent auth_type
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      
      sessionStorage.setItem('auth_type', authType);
      sessionStorage.setItem('auth_username', username.trim());
      sessionStorage.setItem('auth_expiry', expiryDate.toISOString());
      
      // STEP 6: Force reload to trigger role-based redirection
      // App.tsx will handle routing: owner → dashboard, staff → dashboard (then POS), customer → kiosk
      window.location.reload();
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      // Clear any partial session data on error
      sessionStorage.clear();
      localStorage.clear();
      toast.error('Terjadi kesalahan saat login. Silakan coba lagi.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold text-foreground">KasirKu</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Sistem Point of Sale Modern untuk Bisnis Anda
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Masukkan username dan password untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-base">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 text-base"
                  disabled={isProcessing}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base"
                  disabled={isProcessing}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                    Memproses...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            {/* Info Section */}
            <div className="mt-6 pt-6 border-t">
              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2">Sistem login terpadu untuk semua pengguna</p>
                <p className="text-xs">Owner • Manager • Cashier • Customer</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 KasirKu. Sistem POS Modern untuk Bisnis Anda
        </p>
      </div>
    </div>
  );
}
