import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, UserRole, ProductRequest, MenuAccessConfig, MenuAccessInput, MenuAccess } from '../backend';
import type { Product, Category, Brand, ProductPackage, PackageComponent, Bundle, BundleItem } from '../types/backend';
import type { Transaction, TransactionItem, PaymentMethod, PaymentCategory, PaymentSubCategory, Outlet, StockLog, DailySummary } from '../types';
import { toast } from 'sonner';
import { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profil berhasil disimpan');
    },
    onError: (error: Error) => {
      toast.error('Gagal menyimpan profil: ' + error.message);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

// Staff Management Queries (Owner Only)
export function useListAllUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, profile }: { userId: Principal; profile: UserProfile }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserProfile(userId, profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('Profil staf berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui profil staf: ' + error.message);
    },
  });
}

export function useRemoveUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not available yet
      throw new Error('Remove user functionality not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('Staf berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus staf: ' + error.message);
    },
  });
}

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('Role berhasil ditetapkan');
    },
    onError: (error: Error) => {
      toast.error('Gagal menetapkan role: ' + error.message);
    },
  });
}

// Menu Access Configuration Queries (Owner Only)
export function useGetMenuAccessConfig() {
  const { actor, isFetching } = useActor();

  return useQuery<MenuAccessConfig>({
    queryKey: ['menuAccessConfig'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMenuAccessConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRoleMenuAccess() {
  const { actor, isFetching } = useActor();

  return useQuery<MenuAccess[]>({
    queryKey: ['roleMenuAccess'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRoleMenuAccess();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveMenuAccessConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: MenuAccessInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveMenuAccessConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuAccessConfig'] });
      queryClient.invalidateQueries({ queryKey: ['roleMenuAccess'] });
      toast.success('Konfigurasi akses menu berhasil disimpan');
    },
    onError: (error: Error) => {
      toast.error('Gagal menyimpan konfigurasi: ' + error.message);
    },
  });
}

export function useIsMenuAccessible(menu: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['menuAccessible', menu],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isMenuAccessible(menu);
    },
    enabled: !!actor && !isFetching,
  });
}

// Outlet Queries
export function useListOutlets() {
  const { actor, isFetching } = useActor();

  return useQuery<Outlet[]>({
    queryKey: ['outlets'],
    queryFn: async () => {
      if (!actor) return [];
      const outlets = await actor.getOutlets();
      return outlets.map(o => ({
        id: o.id,
        name: o.name,
        address: o.address,
        createdAt: o.createdAt,
        isActive: o.isActive,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOutlet(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Outlet | null>({
    queryKey: ['outlet', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      const outlets = await actor.getOutlets();
      const outlet = outlets.find(o => o.id === id);
      if (!outlet) return null;
      return {
        id: outlet.id,
        name: outlet.name,
        address: outlet.address,
        createdAt: outlet.createdAt,
        isActive: outlet.isActive,
      };
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAddOutlet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, address }: { name: string; address: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOutlet(name, address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
      toast.success('Outlet berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error('Gagal menambahkan outlet: ' + error.message);
    },
  });
}

export function useUpdateOutlet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, address, isActive }: { id: bigint; name: string; address: string; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOutlet(id, name, address, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
      toast.success('Outlet berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui outlet: ' + error.message);
    },
  });
}

// Category Queries
export function useGetAllCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      const categories = await actor.getCategories();
      return categories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        createdAt: c.createdAt,
        isActive: c.isActive,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCategory(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Category | null>({
    queryKey: ['category', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      const categories = await actor.getCategories();
      const category = categories.find(c => c.id === id);
      if (!category) return null;
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        createdAt: category.createdAt,
        isActive: category.isActive,
      };
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCategory(name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategori berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error('Gagal menambahkan kategori: ' + error.message);
    },
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, description, isActive }: { id: bigint; name: string; description: string; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCategory(id, name, description, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategori berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui kategori: ' + error.message);
    },
  });
}

// Brand Queries
export function useGetAllBrands() {
  const { actor, isFetching } = useActor();

  return useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      if (!actor) return [];
      const brands = await actor.getBrands();
      return brands.map(b => ({
        id: b.id,
        name: b.name,
        description: b.description,
        createdAt: b.createdAt,
        isActive: b.isActive,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBrand(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Brand | null>({
    queryKey: ['brand', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      const brands = await actor.getBrands();
      const brand = brands.find(b => b.id === id);
      if (!brand) return null;
      return {
        id: brand.id,
        name: brand.name,
        description: brand.description,
        createdAt: brand.createdAt,
        isActive: brand.isActive,
      };
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateBrand() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBrand(name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error('Gagal menambahkan brand: ' + error.message);
    },
  });
}

export function useUpdateBrand() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, description, isActive }: { id: bigint; name: string; description: string; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBrand(id, name, description, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui brand: ' + error.message);
    },
  });
}

export function useDeleteBrand() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBrand(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Brand berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus brand: ' + error.message);
    },
  });
}

// Product Queries
export function useListProductsByOutlet(outletId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', outletId?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const products = await actor.getProducts();
      const filtered = outletId 
        ? products.filter(p => p.outletId === outletId && !p.isDeleted)
        : products.filter(p => !p.isDeleted);
      return filtered.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        outletId: p.outletId,
        createdAt: p.createdAt,
        categoryId: p.categoryId,
        brandId: p.brandId,
        isDeleted: p.isDeleted,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchProducts(search: string, outletId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'search', search, outletId?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const products = await actor.searchProducts(search, outletId, null, null);
      return products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        outletId: p.outletId,
        createdAt: p.createdAt,
        categoryId: p.categoryId,
        brandId: p.brandId,
        isDeleted: p.isDeleted,
      }));
    },
    enabled: !!actor && !isFetching && search.length > 0,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, price, stock, outletId, categoryId, brandId }: { name: string; price: bigint; stock: bigint; outletId: bigint | null; categoryId: bigint | null; brandId: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      if (!outletId) throw new Error('Outlet harus dipilih');
      
      const productRequest: ProductRequest = {
        id: undefined,
        name,
        price,
        stock,
        outletId,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
      };
      
      return actor.createOrUpdateProduct(productRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Produk berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error('Gagal menambahkan produk: ' + error.message);
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, price, stock, outletId, categoryId, brandId }: { id: bigint; name: string; price: bigint; stock: bigint; outletId: bigint | null; categoryId: bigint | null; brandId: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      if (!outletId) throw new Error('Outlet harus dipilih');
      
      const productRequest: ProductRequest = {
        id,
        name,
        price,
        stock,
        outletId,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
      };
      
      return actor.createOrUpdateProduct(productRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Produk berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui produk: ' + error.message);
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Produk berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error('Gagal menghapus produk: ' + error.message);
    },
  });
}

// Package Queries
export function useListActivePackages(outletId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ProductPackage[]>({
    queryKey: ['packages', outletId?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const packages = await actor.getProductPackages();
      const filtered = outletId 
        ? packages.filter(p => p.outletId === outletId && p.isActive)
        : packages.filter(p => p.isActive);
      return filtered.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        components: p.components.map(c => ({
          productId: c.productId,
          quantity: c.quantity,
        })),
        outletId: p.outletId,
        createdAt: p.createdAt,
        isActive: p.isActive,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPackage(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ProductPackage | null>({
    queryKey: ['package', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      const packages = await actor.getProductPackages();
      const pkg = packages.find(p => p.id === id);
      if (!pkg) return null;
      return {
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        components: pkg.components.map(c => ({
          productId: c.productId,
          quantity: c.quantity,
        })),
        outletId: pkg.outletId,
        createdAt: pkg.createdAt,
        isActive: pkg.isActive,
      };
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreatePackage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, price, outletId, components }: { name: string; price: bigint; outletId: bigint; components: PackageComponent[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProductPackage(name, price, components, outletId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Paket berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error('Gagal menambahkan paket: ' + error.message);
    },
  });
}

export function useUpdatePackage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, price, components }: { id: bigint; name: string; price: bigint; components: PackageComponent[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProductPackage(id, name, price, components);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Paket berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui paket: ' + error.message);
    },
  });
}

export function useMarkPackageInactive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProductPackage(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Paket berhasil dinonaktifkan');
    },
    onError: (error: Error) => {
      toast.error('Gagal menonaktifkan paket: ' + error.message);
    },
  });
}

// Bundle Queries
export function useListActiveBundles(outletId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Bundle[]>({
    queryKey: ['bundles', outletId?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const bundles = await actor.getBundles();
      const filtered = outletId 
        ? bundles.filter(b => b.outletId === outletId && b.isActive)
        : bundles.filter(b => b.isActive);
      return filtered.map(b => ({
        id: b.id,
        name: b.name,
        price: b.price,
        items: b.items.map(i => ({
          productId: i.productId,
          packageId: i.packageId || null,
          quantity: i.quantity,
          isPackage: i.isPackage,
        })),
        outletId: b.outletId,
        createdAt: b.createdAt,
        isActive: b.isActive,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBundle(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Bundle | null>({
    queryKey: ['bundle', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      const bundles = await actor.getBundles();
      const bundle = bundles.find(b => b.id === id);
      if (!bundle) return null;
      return {
        id: bundle.id,
        name: bundle.name,
        price: bundle.price,
        items: bundle.items.map(i => ({
          productId: i.productId,
          packageId: i.packageId || null,
          quantity: i.quantity,
          isPackage: i.isPackage,
        })),
        outletId: bundle.outletId,
        createdAt: bundle.createdAt,
        isActive: bundle.isActive,
      };
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateBundle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, price, outletId, items }: { name: string; price: bigint; outletId: bigint; items: BundleItem[] }) => {
      if (!actor) throw new Error('Actor not available');
      // Convert BundleItem[] to match backend interface
      const backendItems = items.map(item => ({
        productId: item.productId,
        packageId: item.packageId || undefined,
        quantity: item.quantity,
        isPackage: item.isPackage,
      }));
      return actor.addBundle(name, price, backendItems, outletId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Bundle berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error('Gagal menambahkan bundle: ' + error.message);
    },
  });
}

export function useUpdateBundle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, price, items }: { id: bigint; name: string; price: bigint; items: BundleItem[] }) => {
      if (!actor) throw new Error('Actor not available');
      // Convert BundleItem[] to match backend interface
      const backendItems = items.map(item => ({
        productId: item.productId,
        packageId: item.packageId || undefined,
        quantity: item.quantity,
        isPackage: item.isPackage,
      }));
      return actor.updateBundle(id, name, price, backendItems);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Bundle berhasil diperbarui');
    },
    onError: (error: Error) => {
      toast.error('Gagal memperbarui bundle: ' + error.message);
    },
  });
}

export function useMarkBundleInactive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBundle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Bundle berhasil dinonaktifkan');
    },
    onError: (error: Error) => {
      toast.error('Gagal menonaktifkan bundle: ' + error.message);
    },
  });
}

// Stock Management Queries
export function useAddStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: bigint; quantity: bigint; outletId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addStock(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockLogs'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Stok berhasil ditambahkan');
    },
    onError: (error: Error) => {
      toast.error('Gagal menambahkan stok: ' + error.message);
    },
  });
}

export function useReduceStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: bigint; quantity: bigint; outletId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reduceStock(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockLogs'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Stok berhasil dikurangi');
    },
    onError: (error: Error) => {
      toast.error('Gagal mengurangi stok: ' + error.message);
    },
  });
}

export function useTransferStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, toOutletId, quantity }: { productId: bigint; fromOutletId: bigint; toOutletId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.transferStock(productId, toOutletId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockLogs'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      toast.success('Stok berhasil dipindahkan');
    },
    onError: (error: Error) => {
      toast.error('Gagal memindahkan stok: ' + error.message);
    },
  });
}

export function useGetStockLogs(outletId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<StockLog[]>({
    queryKey: ['stockLogs', outletId?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const logs = await actor.getStockLogs();
      return logs.map(l => ({
        id: l.id,
        productId: l.productId,
        outletId: l.outletId,
        operation: l.operation,
        quantity: l.quantity,
        fromOutletId: l.fromOutletId,
        toOutletId: l.toOutletId,
        userId: l.userId.toString(),
        timestamp: l.timestamp,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

// Transaction Queries
export function useListTransactions(outletId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions', outletId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const transactions = await actor.getTransactions();
      return transactions
        .filter(t => t.outletId === outletId)
        .map(t => ({
          id: t.id,
          userId: t.userId.toString(),
          outletId: t.outletId,
          items: t.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            isPackage: i.isPackage,
            isBundle: i.isBundle,
          })),
          total: t.total,
          timestamp: t.timestamp,
          paymentMethods: t.paymentMethods,
        }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListMyTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['myTransactions'],
    queryFn: async () => {
      if (!actor) return [];
      const transactions = await actor.getTransactions();
      return transactions.map(t => ({
        id: t.id,
        userId: t.userId.toString(),
        outletId: t.outletId,
        items: t.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          isPackage: i.isPackage,
          isBundle: i.isBundle,
        })),
        total: t.total,
        timestamp: t.timestamp,
        paymentMethods: t.paymentMethods,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListAllTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['allTransactions'],
    queryFn: async () => {
      if (!actor) return [];
      const transactions = await actor.getTransactions();
      return transactions.map(t => ({
        id: t.id,
        userId: t.userId.toString(),
        outletId: t.outletId,
        items: t.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          isPackage: i.isPackage,
          isBundle: i.isBundle,
        })),
        total: t.total,
        timestamp: t.timestamp,
        paymentMethods: t.paymentMethods,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ items, outletId, paymentMethods }: { items: TransactionItem[]; outletId: bigint; paymentMethods: PaymentMethod[] }) => {
      if (!actor) throw new Error('Actor not available');
      // Convert TransactionItem[] to match backend interface
      const backendItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        isPackage: item.isPackage,
        isBundle: item.isBundle,
      }));
      return actor.createTransaction(outletId, backendItems, paymentMethods);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['myTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['bundles'] });
      queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
      queryClient.invalidateQueries({ queryKey: ['overallSummary'] });
      queryClient.invalidateQueries({ queryKey: ['bestSellers'] });
      queryClient.invalidateQueries({ queryKey: ['topOutlets'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRevenue'] });
      toast.success('Transaksi berhasil disimpan');
    },
    onError: (error: Error) => {
      toast.error('Gagal menyimpan transaksi: ' + error.message);
    },
  });
}

// Dashboard Queries (Placeholder - backend methods not available)
export function useGetDailySummaryOutlet(outletId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<DailySummary>({
    queryKey: ['dailySummary', outletId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return {
        totalRevenue: BigInt(0),
        transactionCount: BigInt(0),
        date: BigInt(Date.now()),
      };
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetOverallSummaryOutlet(outletId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<[bigint, bigint]>({
    queryKey: ['overallSummary', outletId.toString()],
    queryFn: async () => {
      if (!actor) return [BigInt(0), BigInt(0)];
      return [BigInt(0), BigInt(0)];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBestSellers(outletId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[bigint, bigint]>>({
    queryKey: ['bestSellers', outletId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTopOutlets() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[bigint, bigint]>>({
    queryKey: ['topOutlets'],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBestSellersByOutlet() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[bigint, Array<[bigint, bigint]>]>>({
    queryKey: ['bestSellersByOutlet'],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

// Payment Category Analytics Queries (Placeholder - backend methods not available)
export function useGetTotalRevenuePerPaymentCategory(outletId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, bigint]>>({
    queryKey: ['paymentRevenue', outletId?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRevenueByPaymentCategory(category: PaymentCategory, outletId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['paymentCategoryRevenue', category, outletId?.toString()],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return BigInt(0);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRevenueByPaymentSubCategory(subCategory: PaymentSubCategory, outletId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['paymentSubCategoryRevenue', subCategory, outletId?.toString()],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return BigInt(0);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTransactionsByPaymentCategory(category: PaymentCategory, outletId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactionsByPaymentCategory', category, outletId?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}
