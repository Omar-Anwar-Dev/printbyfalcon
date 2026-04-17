'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addToCart, fetchCart, removeCartItem, updateCartItem } from '../lib/api';
import { useCartStore } from '../stores/cart.store';
import { useEffect } from 'react';

export function useCart() {
  const { setCart, openDrawer } = useCartStore();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (cartQuery.data) {
      setCart(cartQuery.data.items, cartQuery.data.subtotal);
    }
  }, [cartQuery.data, setCart]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['cart'] });

  const addItem = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      addToCart(productId, quantity),
    onSuccess: () => {
      invalidate();
      openDrawer();
    },
  });

  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: invalidate,
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: invalidate,
  });

  return { cartQuery, addItem, updateItem, removeItem };
}
