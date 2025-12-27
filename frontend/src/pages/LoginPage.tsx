import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, TrendingUp, Package, Receipt, Store, BarChart, Shield } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left side - Branding & Features */}
        <div className="space-y-8 text-center lg:text-left">
          {/* Logo & Title */}
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                <ShoppingBag className="h-9 w-9 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <h1 className="text-4xl font-bold text-gray-900">TekraERPOS</h1>
                <p className="text-sm text-primary font-medium">Smart Business Solution</p>
              </div>
            </div>
            <p className="text-xl text-gray-600 max-w-md mx-auto lg:mx-0">
              Platform lengkap untuk mengelola toko fisik dan online Anda dalam satu sistem
            </p>
          </div>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="group p-5 rounded-xl bg-white border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 hover-lift">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Multi Outlet</h3>
              <p className="text-sm text-gray-600">Kelola beberapa toko dalam satu dashboard</p>
            </div>

            <div className="group p-5 rounded-xl bg-white border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 hover-lift">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Manajemen Produk</h3>
              <p className="text-sm text-gray-600">Stok, kategori, dan bundle produk</p>
            </div>

            <div className="group p-5 rounded-xl bg-white border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 hover-lift">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                <Receipt className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">POS & E-commerce</h3>
              <p className="text-sm text-gray-600">Kasir cepat + toko online terintegrasi</p>
            </div>

            <div className="group p-5 rounded-xl bg-white border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 hover-lift">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                <BarChart className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Laporan Real-time</h3>
              <p className="text-sm text-gray-600">Analisis penjualan mendalam</p>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4 text-primary" />
            <span>Aman & terpercaya dengan Internet Identity</span>
          </div>
        </div>

        {/* Right side - Login Card */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-blue-600 p-8 text-white">
            <CardHeader className="p-0 space-y-2">
              <CardTitle className="text-3xl font-bold">Selamat Datang! 👋</CardTitle>
              <CardDescription className="text-blue-100">
                Masuk untuk mengakses dashboard TekraERPOS Anda
              </CardDescription>
            </CardHeader>
          </div>
          
          <CardContent className="p-8 space-y-6">
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Memproses...
                </>
              ) : (
                'Masuk dengan Internet Identity'
              )}
            </Button>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span>Autentikasi aman tanpa password</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span>Akses multi-device yang mudah</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span>Data terenkripsi & privasi terjaga</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-center text-gray-500">
                Belum punya akun? Sistem akan otomatis membuatkan akun baru saat login pertama kali
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
