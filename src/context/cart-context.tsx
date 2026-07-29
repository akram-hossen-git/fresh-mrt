'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useAuth } from '@/context/auth-context';
import {
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  changeQuantity as apiChangeQuantity,
  getCartCount as apiGetCartCount,
  getCartSummary as apiGetCartSummary,
  getCartItems as apiGetCartItems,
} from '@/lib/api/cart';
import { generateTempUserId } from '@/lib/utils';

const TEMP_USER_KEY = 'temp_user_id';

/** One cart line, keyed by product id so cards can find themselves. */
export interface CartLine {
  cartId: number;
  quantity: number;
  variation: string;
  stock?: number;
}

interface CartContextValue {
  cartCount: number;
  cartSubtotal: string;
  tempUserId: string | null;
  /** productId -> cart line. Lets product cards render an inline stepper. */
  lines: Record<number, CartLine>;
  /** Look up the line for a product, if it's already in the cart. */
  getLine: (productId: number) => CartLine | undefined;
  addToCart: (productId: number, variant: string, quantity: number) => Promise<void>;
  removeFromCart: (cartId: number) => Promise<void>;
  updateQuantity: (cartId: number, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function getOrCreateTempUserId(): string {
  if (typeof window === 'undefined') return '';
  let tempId = localStorage.getItem(TEMP_USER_KEY);
  if (!tempId) {
    tempId = generateTempUserId();
    localStorage.setItem(TEMP_USER_KEY, tempId);
  }
  return tempId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState('');
  const [lines, setLines] = useState<Record<number, CartLine>>({});
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const prevUserRef = useRef<number | null>(null);

  // Initialize or clear temp user ID based on auth state
  useEffect(() => {
    if (!isAuthenticated) {
      const storedId = getOrCreateTempUserId();
      setTempUserId(storedId);
    } else {
      setTempUserId(null);
    }
  }, [isAuthenticated]);

  // Fetch cart count + subtotal + line map using correct identifiers
  const refreshCart = useCallback(async () => {
    try {
      const tid = !isAuthenticated ? (tempUserId ?? undefined) : undefined;
      const [countRes, summaryRes, itemsRes] = await Promise.allSettled([
        apiGetCartCount(user?.id, tid),
        apiGetCartSummary(user?.id, tid),
        apiGetCartItems(user?.id, tid),
      ]);
      if (countRes.status === 'fulfilled' && typeof countRes.value.count === 'number') {
        setCartCount(countRes.value.count);
      }
      if (summaryRes.status === 'fulfilled' && summaryRes.value?.data?.sub_total) {
        setCartSubtotal(String(summaryRes.value.data.sub_total));
      }
      if (itemsRes.status === 'fulfilled' && Array.isArray(itemsRes.value?.data)) {
        const map: Record<number, CartLine> = {};
        for (const item of itemsRes.value.data) {
          // If a product sits in the cart under several variants, the first
          // line wins — cards without a chosen variant just need *a* handle.
          if (item.product_id && !map[item.product_id]) {
            map[item.product_id] = {
              cartId: item.id,
              quantity: item.quantity,
              variation: item.variation,
              stock: item.stock,
            };
          }
        }
        setLines(map);
      }
    } catch {
      // Cart summary is non-critical; fail silently
    }
  }, [user?.id, isAuthenticated, tempUserId]);

  const getLine = useCallback(
    (productId: number) => lines[productId],
    [lines],
  );

  // Refresh cart whenever auth state or temp user changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // When user logs in, pass temp_user_id so backend can merge guest cart
  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const previousUserId = prevUserRef.current;

    // Detect transition from guest (null) to authenticated (has id)
    if (previousUserId === null && currentUserId !== null) {
      const guestTempId = localStorage.getItem(TEMP_USER_KEY);
      if (guestTempId) {
        // Trigger a cart count fetch with both IDs so backend merges
        apiGetCartCount(currentUserId, guestTempId)
          .then((response) => {
            if (typeof response.count === 'number') {
              setCartCount(response.count);
            }
          })
          .catch(() => {
            // Merge attempt failed; regular refresh will follow
          });

        // Clean up guest temp ID after merge
        localStorage.removeItem(TEMP_USER_KEY);
      }
    }

    prevUserRef.current = currentUserId;
  }, [user?.id]);

  const addToCart = useCallback(
    async (productId: number, variant: string, quantity: number) => {
      await apiAddToCart({
        id: productId,
        variant: variant || undefined,
        quantity,
        user_id: user?.id,
        temp_user_id: !isAuthenticated ? (tempUserId ?? undefined) : undefined,
      });
      await refreshCart();
    },
    [user?.id, isAuthenticated, tempUserId, refreshCart]
  );

  const removeFromCart = useCallback(
    async (cartId: number) => {
      await apiRemoveFromCart(cartId);
      // Drop the line optimistically so steppers collapse back to ADD,
      // then reconcile counts/subtotal with the server.
      setLines((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (next[Number(key)].cartId === cartId) delete next[Number(key)];
        }
        return next;
      });
      setCartCount((prev) => Math.max(0, prev - 1));
      await refreshCart();
    },
    [refreshCart]
  );

  const updateQuantity = useCallback(
    async (cartId: number, quantity: number) => {
      // Optimistic: the stepper should respond on tap, not after a round trip.
      setLines((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          const id = Number(key);
          if (next[id].cartId === cartId) {
            next[id] = { ...next[id], quantity };
          }
        }
        return next;
      });
      await apiChangeQuantity(cartId, quantity);
      await refreshCart();
    },
    [refreshCart]
  );

  return (
    <CartContext.Provider
      value={{
        cartCount,
        cartSubtotal,
        tempUserId,
        lines,
        getLine,
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
