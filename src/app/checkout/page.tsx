'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Truck,
  CreditCard,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Check,
  Wallet,
  Banknote,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/context/toast-context';
import { getAddresses } from '@/lib/api/addresses';
import { getCartItems, getCartSummary } from '@/lib/api/cart';
import {
  getDeliveryInfo,
  getPaymentTypes,
  updateAddressInCart,
  placeOrder,
  payCod,
  payWallet,
} from '@/lib/api/checkout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { Address, CartItem, CartSummary as CartSummaryType } from '@/lib/types';

const STEPS = [
  { key: 'shipping', label: 'Shipping', icon: MapPin },
  { key: 'delivery', label: 'Delivery', icon: Truck },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'review', label: 'Review', icon: ClipboardCheck },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

interface DeliveryOption {
  name: string;
  value: string;
  id?: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { tempUserId, refreshCart } = useCart();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummaryType | null>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Selections
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');

  // New address form
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address: '',
    postal_code: '',
    phone: '',
    country_id: '',
    state_id: '',
    city_id: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load initial data
  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoadingData(true);
    try {
      const [addrRes, itemsRes, summaryRes, payRes] = await Promise.all([
        getAddresses(),
        getCartItems(user.id),
        getCartSummary(user.id),
        getPaymentTypes(),
      ]);

      if (addrRes.success) {
        setAddresses(addrRes.data);
        const defaultAddr = addrRes.data.find((a) => a.set_default === 1);
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
        else if (addrRes.data.length > 0) setSelectedAddress(addrRes.data[0].id);
      }

      if (itemsRes.success) setCartItems(itemsRes.data);

      if (summaryRes.success && summaryRes.data) {
        const d = summaryRes.data;
        setCartSummary({
          sub_total: String(d.sub_total ?? '$ 0.00'),
          tax: String(d.tax ?? '$ 0.00'),
          shipping_cost: String(d.shipping_cost ?? '$ 0.00'),
          discount: String(d.discount ?? '$ 0.00'),
          grand_total: String(d.grand_total ?? '$ 0.00'),
          grand_total_value: Number(d.grand_total_value ?? 0),
          coupon_applied: Boolean(d.coupon_applied),
          coupon_code: d.coupon_code ? String(d.coupon_code) : null,
        });
      }

      if (Array.isArray(payRes) && payRes.length > 0) {
        const types = payRes.map((p) => p.payment_type_key || p.payment_type);
        setPaymentTypes(types);
        if (types.length > 0) setSelectedPayment(types[0]);
      }
    } catch {
      showToast('Failed to load checkout data', 'error');
    } finally {
      setLoadingData(false);
    }
  }, [user?.id, showToast]);

  useEffect(() => {
    if (isAuthenticated && user?.id) loadData();
  }, [isAuthenticated, user?.id, loadData]);

  // Fetch delivery options when address changes
  useEffect(() => {
    if (!selectedAddress || !user?.id) return;
    const addr = addresses.find((a) => a.id === selectedAddress);
    if (!addr) return;

    getDeliveryInfo({
      user_id: user.id,
      address_id: selectedAddress,
      city_id: addr.city_id,
      country_id: addr.country_id,
    })
      .then((res) => {
        const shops = Array.isArray(res) ? res : (res as { data?: unknown[] }).data ?? [];
        if (shops.length > 0) {
          const options: DeliveryOption[] = [];
          for (const shop of shops) {
            const s = shop as Record<string, unknown>;
            // Each shop has carriers and/or home delivery option
            options.push({
              name: String(s.name ?? 'Standard Shipping'),
              value: `home_delivery_${s.owner_id}`,
              id: Number(s.owner_id ?? 0),
            });
          }
          setDeliveryOptions(options);
          if (options.length > 0) setSelectedDelivery(options[0].value);
        } else {
          setDeliveryOptions([]);
          setSelectedDelivery('');
        }
      })
      .catch(() => {
        setDeliveryOptions([
          { name: 'Standard Shipping', value: 'standard' },
        ]);
        setSelectedDelivery('standard');
      });
  }, [selectedAddress, addresses, user?.id]);

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: return selectedAddress !== null;
      case 1: return selectedDelivery !== '';
      case 2: return selectedPayment !== '';
      case 3: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1 && canProceed()) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handlePlaceOrder = async () => {
    if (!user?.id || !selectedAddress) return;
    setIsSubmitting(true);
    try {
      // Set the address on cart items before placing the order
      const addrUpdate = await updateAddressInCart({
        user_id: user.id,
        address_id: selectedAddress,
      });
      if (!addrUpdate.result) {
        showToast(addrUpdate.message || 'Failed to set shipping address', 'error');
        setIsSubmitting(false);
        return;
      }

      const orderData = {
        user_id: user.id,
        address_id: selectedAddress,
        payment_type: selectedPayment,
        delivery_option: selectedDelivery,
      };

      const orderRes = await placeOrder(orderData);

      if (orderRes.result) {
        // Process payment
        if (selectedPayment === 'cash_on_delivery') {
          await payCod({ user_id: user.id, combined_order_id: (orderRes as unknown as Record<string, unknown>).combined_order_id });
        } else if (selectedPayment === 'wallet') {
          await payWallet({ user_id: user.id, combined_order_id: (orderRes as unknown as Record<string, unknown>).combined_order_id });
        }

        await refreshCart();
        showToast('Order placed successfully!', 'success');
        router.push('/account/orders');
      } else {
        showToast(orderRes.message || 'Failed to place order', 'error');
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentIcons: Record<string, React.ReactNode> = {
    cash_on_delivery: <Banknote size={20} />,
    wallet: <Wallet size={20} />,
    online_payment: <Globe size={20} />,
  };

  const paymentLabels: Record<string, string> = {
    cash_on_delivery: 'Cash on Delivery',
    wallet: 'Wallet',
    online_payment: 'Online Payment',
  };

  if (authLoading || loadingData) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <Skeleton className="w-full mb-8" height={48} />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-full" height={60} />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const currentStepData = STEPS[currentStep];

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;

            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                      isCompleted
                        ? 'bg-accent text-white'
                        : isActive
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                    )}
                  >
                    {isCompleted ? <Check size={18} /> : <StepIcon size={18} />}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium hidden sm:block',
                      isActive || isCompleted
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2 transition-colors duration-300',
                      idx < currentStep
                        ? 'bg-accent'
                        : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step title */}
      <h1 className="font-display text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {currentStepData.label}
      </h1>

      {/* Step 1: Shipping Address */}
      {currentStep === 0 && (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <button
              key={addr.id}
              onClick={() => setSelectedAddress(addr.id)}
              className={cn(
                'w-full text-left p-4 rounded-card border-2 transition-all duration-300',
                selectedAddress === addr.id
                  ? 'border-accent bg-accent-50 dark:bg-accent-900/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {addr.address}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {[addr.city_name, addr.state_name, addr.country_name]
                      .filter(Boolean)
                      .join(', ')}
                    {addr.postal_code ? ` - ${addr.postal_code}` : ''}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {addr.phone}
                  </p>
                </div>
                {addr.set_default === 1 && (
                  <span className="text-[10px] font-medium uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>
            </button>
          ))}

          {/* Add new address inline */}
          {!showNewAddress ? (
            <button
              onClick={() => setShowNewAddress(true)}
              className="w-full p-4 rounded-card border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400 hover:border-accent hover:text-accent transition-all duration-300"
            >
              + Add new address
            </button>
          ) : (
            <div className="p-4 rounded-card border border-gray-200 dark:border-gray-700 space-y-3">
              <Input
                label="Street Address"
                value={newAddress.address}
                onChange={(e) => setNewAddress((p) => ({ ...p, address: e.target.value }))}
                placeholder="123 Main St"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Postal Code"
                  value={newAddress.postal_code}
                  onChange={(e) => setNewAddress((p) => ({ ...p, postal_code: e.target.value }))}
                  placeholder="12345"
                />
                <Input
                  label="Phone"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                For a complete address form with country/state/city selectors, visit{' '}
                <a href="/account/addresses" className="text-accent underline">
                  Manage Addresses
                </a>
                .
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewAddress(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Delivery Method */}
      {currentStep === 1 && (
        <div className="space-y-4">
          {deliveryOptions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
              No delivery options available for this address. Please select a different address.
            </p>
          ) : (
            deliveryOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedDelivery(option.value)}
                className={cn(
                  'w-full text-left p-4 rounded-card border-2 transition-all duration-300 flex items-center gap-4',
                  selectedDelivery === option.value
                    ? 'border-accent bg-accent-50 dark:bg-accent-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <Truck
                  size={20}
                  className={cn(
                    selectedDelivery === option.value
                      ? 'text-accent'
                      : 'text-gray-400'
                  )}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.name}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Step 3: Payment Method */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {paymentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedPayment(type)}
              className={cn(
                'w-full text-left p-4 rounded-card border-2 transition-all duration-300 flex items-center gap-4',
                selectedPayment === type
                  ? 'border-accent bg-accent-50 dark:bg-accent-900/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <span
                className={cn(
                  selectedPayment === type
                    ? 'text-accent'
                    : 'text-gray-400'
                )}
              >
                {paymentIcons[type] || <CreditCard size={20} />}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {paymentLabels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Step 4: Review */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Address summary */}
          <div className="p-4 rounded-card bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Shipping To
            </h3>
            {(() => {
              const addr = addresses.find((a) => a.id === selectedAddress);
              if (!addr) return <p className="text-sm text-gray-400">No address selected</p>;
              return (
                <p className="text-sm text-gray-900 dark:text-white">
                  {addr.address}, {addr.city_name}
                  {addr.state_name ? `, ${addr.state_name}` : ''}, {addr.country_name}
                  {addr.postal_code ? ` - ${addr.postal_code}` : ''}
                </p>
              );
            })()}
          </div>

          {/* Payment summary */}
          <div className="p-4 rounded-card bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Payment Method
            </h3>
            <p className="text-sm text-gray-900 dark:text-white">
              {paymentLabels[selectedPayment] || selectedPayment}
            </p>
          </div>

          {/* Items summary */}
          <div className="p-4 rounded-card bg-white dark:bg-neutral-900 shadow-sm border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Order Items
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your bag
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[64px_1fr_auto] gap-4 items-center"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.product.name}
                    </p>
                    {item.variation && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {item.variation}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Qty: <span className="font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                      {item.product.unit ? ` ${item.product.unit}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order total */}
          {cartSummary && (
            <div className="p-4 rounded-card border-2 border-gray-900 dark:border-white">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{cartSummary.sub_total}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>{cartSummary.shipping_cost}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>{cartSummary.tax}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{cartSummary.grand_total}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="md"
          onClick={handleBack}
          disabled={currentStep === 0}
          icon={<ChevronLeft size={18} />}
        >
          Back
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            disabled={!canProceed()}
            icon={<ChevronRight size={18} />}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="accent"
            size="lg"
            onClick={handlePlaceOrder}
            isLoading={isSubmitting}
            disabled={!canProceed()}
          >
            Place Order
          </Button>
        )}
      </div>
    </div>
  );
}
