import { useGetCallerUserProfile, useIsCallerAdmin, useListOutlets, useGetDailySummaryOutlet, useGetOverallSummaryOutlet, useGetBestSellers, useListProductsByOutlet, useGetTopOutlets, useGetOutlet } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, ShoppingCart, Package, Store, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: outlets } = useListOutlets();

  const isOwner = isAdmin;
  const userOutletId = userProfile?.outletId;

  // Owner sees all outlets aggregated
  // Manager/Cashier sees their assigned outlet
  const targetOutletId = isOwner ? null : userOutletId;

  if (isOwner) {
    return <OwnerDashboard outlets={outlets || []} />;
  } else if (userOutletId) {
    return <OutletDashboard outletId={userOutletId} />;
  } else {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Anda belum ditugaskan ke outlet manapun</p>
        </div>
      </div>
    );
  }
}

function OwnerDashboard({ outlets }: { outlets: any[] }) {
  const { data: topOutlets, isLoading: topOutletsLoading } = useGetTopOutlets();

  const formatCurrency = (amount: bigint) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  // Calculate aggregated stats
  const totalRevenue = topOutlets?.reduce((sum, [_, revenue]) => sum + Number(revenue), 0) || 0;
  const activeOutlets = outlets.filter(o => o.isActive).length;

  const getOutletName = (outletId: bigint) => {
    const outlet = outlets.find(o => o.id === outletId);
    return outlet?.name || `Outlet #${outletId}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Selamat Datang, Owner! 👋</h1>
        <p className="text-blue-100">Berikut ringkasan performa semua outlet Anda</p>
      </div>

      {/* Stats Cards - Shopee Style */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md hover-lift bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Outlet</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Store className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{outlets.length}</p>
            <div className="flex items-center gap-1 mt-2">
              <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-0">
                {activeOutlets} aktif
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover-lift bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pendapatan</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            {topOutletsLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(BigInt(totalRevenue))}</p>
            )}
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Semua outlet</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover-lift bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Outlet Terbaik</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            {topOutletsLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : topOutlets && topOutlets.length > 0 ? (
              <>
                <p className="text-2xl font-bold text-gray-900 truncate">{getOutletName(topOutlets[0][0])}</p>
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  {formatCurrency(topOutlets[0][1])}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Belum ada data</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover-lift bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Status Sistem</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">✓</p>
            <div className="flex items-center gap-1 mt-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-600 font-medium">Operasional Normal</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Outlets - Shopee Style */}
      <Card className="border-0 shadow-md bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">🏆 Performa Outlet</CardTitle>
              <CardDescription className="text-gray-600">Outlet dengan pendapatan tertinggi</CardDescription>
            </div>
            <Badge className="bg-primary/10 text-primary border-0">Top 5</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {topOutletsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : !topOutlets || topOutlets.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Store className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Belum ada data penjualan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topOutlets
                .sort((a, b) => Number(b[1] - a[1]))
                .slice(0, 5)
                .map(([outletId, revenue], index) => (
                  <div key={outletId.toString()} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{getOutletName(outletId)}</p>
                        <p className="text-xs text-gray-500">Outlet #{outletId.toString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(revenue)}</p>
                      <p className="text-xs text-gray-500">Total Pendapatan</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outlets List - Shopee Style */}
      <Card className="border-0 shadow-md bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">📍 Daftar Outlet</CardTitle>
              <CardDescription className="text-gray-600">Semua outlet yang terdaftar di sistem</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {outlets.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Store className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-2">Belum ada outlet terdaftar</p>
              <p className="text-xs text-gray-400">Tambahkan outlet pertama Anda untuk memulai</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {outlets.map((outlet) => (
                <Card key={outlet.id.toString()} className="border border-gray-200 hover:border-primary hover:shadow-md transition-all hover-lift">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Store className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-gray-900">{outlet.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">{outlet.address}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Badge variant={outlet.isActive ? 'default' : 'secondary'} className={outlet.isActive ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                      {outlet.isActive ? '✓ Aktif' : 'Nonaktif'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OutletDashboard({ outletId }: { outletId: bigint }) {
  const { data: outlet } = useGetOutlet(outletId);
  const { data: dailySummary, isLoading: dailyLoading } = useGetDailySummaryOutlet(outletId);
  const { data: overallSummary, isLoading: overallLoading } = useGetOverallSummaryOutlet(outletId);
  const { data: bestSellers, isLoading: bestSellersLoading } = useGetBestSellers(outletId);
  const { data: products } = useListProductsByOutlet(outletId);

  const formatCurrency = (amount: bigint) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const getProductName = (productId: bigint) => {
    const product = products?.find(p => p.id === productId);
    return product?.name || `Produk #${productId}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Dashboard {outlet?.name || 'Outlet'} 📊</h1>
        <p className="text-blue-100">
          {outlet ? outlet.address : 'Ringkasan performa outlet Anda'}
        </p>
      </div>

      {/* Stats Cards - Shopee Style */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md hover-lift bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Transaksi Hari Ini</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {dailyLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{dailySummary?.transactionCount.toString() || '0'}</p>
            )}
            <p className="text-xs text-gray-600 mt-2 font-medium">24 jam terakhir</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover-lift bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pendapatan Hari Ini</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            {dailyLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(dailySummary?.totalRevenue || BigInt(0))}</p>
            )}
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Penjualan hari ini</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover-lift bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Transaksi</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            {overallLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{overallSummary?.[0].toString() || '0'}</p>
            )}
            <p className="text-xs text-gray-600 mt-2 font-medium">Semua waktu</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover-lift bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pendapatan</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            {overallLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(overallSummary?.[1] || BigInt(0))}</p>
            )}
            <p className="text-xs text-gray-600 mt-2 font-medium">Semua waktu</p>
          </CardContent>
        </Card>
      </div>

      {/* Best Sellers */}
      <Card>
        <CardHeader>
          <CardTitle>Produk Terlaris</CardTitle>
          <CardDescription>Produk dengan penjualan tertinggi di outlet ini</CardDescription>
        </CardHeader>
        <CardContent>
          {bestSellersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : !bestSellers || bestSellers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada data penjualan produk
            </p>
          ) : (
            <div className="space-y-3">
              {bestSellers
                .sort((a, b) => Number(b[1] - a[1]))
                .slice(0, 5)
                .map(([productId, quantity]) => (
                  <div key={productId.toString()} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{getProductName(productId)}</p>
                        <p className="text-sm text-muted-foreground">Produk #{productId.toString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{quantity.toString()}</p>
                      <p className="text-xs text-muted-foreground">Terjual</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
