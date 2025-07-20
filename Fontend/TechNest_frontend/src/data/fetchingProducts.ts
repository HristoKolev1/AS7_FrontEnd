import axios from 'axios';
import { Product } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,      // if you use cookies/sessions
});
interface WrappedProducts {
  products: Product[];
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await api.get<WrappedProducts>('/products');
  return response.data.products;
}

// …other endpoints

export async function fetchProduct(id: string): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
}
