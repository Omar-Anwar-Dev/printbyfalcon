import axios from 'axios';

// Two URLs:
//   - server-side (SSR, sitemap, etc.): use the internal docker hostname so we
//     bypass nginx entirely (no SSL overhead, no shared rate-limit bucket)
//   - browser/client: must use the public HTTPS URL
const isServer = typeof window === 'undefined';
const API_URL = isServer
  ? (process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://nestjs-api:4000/api/v1')
  : (process.env.NEXT_PUBLIC_API_URL ?? 'https://api.printbyfalcon.com/api/v1');

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

// ── Auth ──────────────────────────────────────────────

export interface AuthResponse {
  user: { id: string; firstName: string; lastName: string; email: string; role: string };
  accessToken: string;
  refreshToken: string;
}

export const authLogin = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data);

export const authRegister = (data: {
  firstName: string; lastName: string; email: string; password: string; phone?: string;
}) => api.post<AuthResponse>('/auth/register', data).then((r) => r.data);

export const authForgotPassword = (email: string) =>
  api.post('/auth/forgot-password', { email }).then((r) => r.data);

export const authProfile = () =>
  api.get('/auth/profile').then((r) => r.data);

// ── Orders ────────────────────────────────────────────

export interface Order {
  id: string;
  invoiceNumber: string;
  status: string;
  paymentMethod: string;
  subtotal: number;
  shippingAmount: number;
  vatAmount: number;
  couponDiscount: number;
  totalAmount: number;
  couponCode?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  address?: Address;
  payment?: any;
  tracking?: OrderTrackingEvent[];
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: any;
}

export interface OrderTrackingEvent {
  id: string;
  status: string;
  note?: string;
  courierName?: string;
  trackingNumber?: string;
  createdAt: string;
}

export const fetchMyOrders = (page = 1, limit = 10) =>
  api.get<{ data: Order[]; total: number; totalPages: number }>('/orders', { params: { page, limit } }).then((r) => r.data);

export const fetchOrder = (id: string) =>
  api.get<Order>(`/orders/${id}`).then((r) => r.data);

export const checkout = (data: {
  addressId: string;
  paymentMethod: 'CARD' | 'FAWRY' | 'COD';
  couponCode?: string;
  notes?: string;
}) => api.post('/orders/checkout', data).then((r) => r.data);

// ── Addresses ─────────────────────────────────────────

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  isDefault?: boolean;
}

export const fetchAddresses = () =>
  api.get<Address[]>('/addresses').then((r) => r.data);

export const createAddress = (data: Omit<Address, 'id'>) =>
  api.post<Address>('/addresses', data).then((r) => r.data);

export const updateAddress = (id: string, data: Partial<Address>) =>
  api.patch<Address>(`/addresses/${id}`, data).then((r) => r.data);

export const deleteAddress = (id: string) =>
  api.delete(`/addresses/${id}`).then((r) => r.data);

// ── Wishlist ──────────────────────────────────────────

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
}

export const fetchWishlist = () =>
  api.get<WishlistItem[]>('/wishlist').then((r) => r.data);

export const addToWishlist = (productId: string) =>
  api.post('/wishlist', { productId }).then((r) => r.data);

export const removeFromWishlist = (productId: string) =>
  api.delete(`/wishlist/${productId}`).then((r) => r.data);

export const moveWishlistToCart = (productId: string) =>
  api.post(`/wishlist/${productId}/move-to-cart`).then((r) => r.data);

// ── Support Tickets ───────────────────────────────────

export interface TicketReply {
  id: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; role: string };
}

export interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  satisfaction?: number;
  createdAt: string;
  updatedAt: string;
  replies: TicketReply[];
}

export const fetchMyTickets = (page = 1, limit = 10) =>
  api.get<{ data: Ticket[]; total: number; totalPages: number }>('/support/tickets', { params: { page, limit } }).then((r) => r.data);

export const fetchTicket = (id: string) =>
  api.get<Ticket>(`/support/tickets/${id}`).then((r) => r.data);

export const createTicket = (data: { subject: string; category: string; priority?: string; message: string }) =>
  api.post<Ticket>('/support/tickets', data).then((r) => r.data);

export const replyTicket = (id: string, message: string) =>
  api.post(`/support/tickets/${id}/reply`, { message }).then((r) => r.data);

// ── Coupons ───────────────────────────────────────────

export const validateCoupon = (code: string, cartTotal: number) =>
  api.post('/coupons/validate', { code, cartTotal }).then((r) => r.data);

// ── Admin ─────────────────────────────────────────────

export const adminDashboard = () =>
  api.get('/admin/analytics/dashboard').then((r) => r.data);

export const adminDailyRevenue = (from?: string, to?: string) =>
  api.get('/admin/analytics/daily-revenue', { params: { from, to } }).then((r) => r.data);

export const adminTopProducts = (limit = 10) =>
  api.get('/admin/analytics/top-products', { params: { limit } }).then((r) => r.data);

export const adminProducts = (params: { page?: number; search?: string } = {}) =>
  api.get('/products', { params: { ...params, limit: 50 } }).then((r) => r.data);

export const adminOrders = (params: {
  status?: string; paymentMethod?: string; dateFrom?: string; dateTo?: string;
  search?: string; page?: number;
} = {}) => api.get('/admin/orders', { params: { ...params, limit: 20 } }).then((r) => r.data);

export const adminUpdateOrderStatus = (id: string, status: string, note?: string, courierName?: string, trackingNumber?: string) =>
  api.patch(`/admin/orders/${id}/status`, { status, note, courierName, trackingNumber }).then((r) => r.data);
