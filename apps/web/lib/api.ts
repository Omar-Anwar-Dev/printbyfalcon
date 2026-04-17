import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.printbyfalcon.com';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Types ──────────────────────────────────────────────

export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price: number;
  salePrice?: number;
  stock: number;
  sku: string;
  soldCount: number;
  averageRating: number;
  images: { url: string; altText?: string }[];
  category?: { id: string; nameEn: string; nameAr: string; slug: string };
  brand?: { id: string; nameEn: string; nameAr: string };
}

export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  imageUrl?: string;
  productCount?: number;
}

export interface Brand {
  id: string;
  nameEn: string;
  nameAr: string;
  logoUrl?: string;
}

export interface Banner {
  id: string;
  titleEn?: string;
  titleAr?: string;
  subtitleEn?: string;
  subtitleAr?: string;
  imageUrl: string;
  link?: string;
  position: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
}

// ── API helpers ────────────────────────────────────────

export const fetchProducts = (params?: Record<string, string | number | undefined>) =>
  api.get<{ data: Product[]; total: number; page: number; totalPages: number }>('/products', { params }).then((r) => r.data);

export const fetchProduct = (slug: string) =>
  api.get<Product>(`/products/${slug}`).then((r) => r.data);

export const fetchFeaturedProducts = () =>
  api.get<Product[]>('/products/featured').then((r) => r.data);

export const fetchRelatedProducts = (slug: string, limit = 8) =>
  api.get<Product[]>(`/products/${slug}/related`, { params: { limit } }).then((r) => r.data);

export const fetchCategories = () =>
  api.get<Category[]>('/categories').then((r) => r.data);

export const fetchBrands = () =>
  api.get<Brand[]>('/brands').then((r) => r.data);

export const fetchBanners = () =>
  api.get<Banner[]>('/banners').then((r) => r.data);

export const fetchCart = () =>
  api.get<Cart>('/cart').then((r) => r.data);

export const addToCart = (productId: string, quantity: number) =>
  api.post('/cart/items', { productId, quantity }).then((r) => r.data);

export const updateCartItem = (itemId: string, quantity: number) =>
  api.patch(`/cart/items/${itemId}`, { quantity }).then((r) => r.data);

export const removeCartItem = (itemId: string) =>
  api.delete(`/cart/items/${itemId}`).then((r) => r.data);
