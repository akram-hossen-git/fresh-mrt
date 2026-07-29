'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  makeDefault,
  getCountries,
  getStatesByCountry,
  getCitiesByState,
} from '@/lib/api/addresses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import type { Address, Country, State, City } from '@/lib/types';

interface AddressFormData {
  id?: number;
  address: string;
  country_id: string;
  state_id: string;
  city_id: string;
  postal_code: string;
  phone: string;
}

const emptyForm: AddressFormData = {
  address: '',
  country_id: '',
  state_id: '',
  city_id: '',
  postal_code: '',
  phone: '',
};

export default function AddressesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<AddressFormData>(emptyForm);
  const [isEditMode, setIsEditMode] = useState(false);

  // Location data
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await getAddresses();
      if (res.success && res.data) {
        setAddresses(res.data);
      }
    } catch {
      showToast('Failed to load addresses', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const fetchCountries = useCallback(async () => {
    try {
      const res = await getCountries();
      if (res.success && res.data) {
        setCountries(res.data);
      }
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
    fetchCountries();
  }, [fetchAddresses, fetchCountries]);

  // Fetch states when country changes
  useEffect(() => {
    if (!formData.country_id) {
      setStates([]);
      setCities([]);
      return;
    }
    setLoadingStates(true);
    setStates([]);
    setCities([]);
    setFormData((p) => ({ ...p, state_id: '', city_id: '' }));
    getStatesByCountry(Number(formData.country_id))
      .then((res) => {
        if (res.success && res.data) setStates(res.data);
      })
      .catch(() => {})
      .finally(() => setLoadingStates(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.country_id]);

  // Fetch cities when state changes
  useEffect(() => {
    if (!formData.state_id) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    setCities([]);
    setFormData((p) => ({ ...p, city_id: '' }));
    getCitiesByState(Number(formData.state_id))
      .then((res) => {
        if (res.success && res.data) setCities(res.data);
      })
      .catch(() => {})
      .finally(() => setLoadingCities(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.state_id]);

  const openAddModal = () => {
    setFormData(emptyForm);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setFormData({
      id: addr.id,
      address: addr.address,
      country_id: String(addr.country_id),
      state_id: String(addr.state_id),
      city_id: String(addr.city_id),
      postal_code: addr.postal_code,
      phone: addr.phone,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.address.trim()) {
      showToast('Address is required', 'error');
      return;
    }
    if (!formData.phone.trim()) {
      showToast('Phone number is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        user_id: user?.id,
        address: formData.address,
        country_id: Number(formData.country_id) || undefined,
        state_id: Number(formData.state_id) || undefined,
        city_id: Number(formData.city_id) || undefined,
        postal_code: formData.postal_code,
        phone: formData.phone,
      };

      let res;
      if (isEditMode && formData.id) {
        res = await updateAddress({ ...payload, id: formData.id });
      } else {
        res = await createAddress(payload);
      }

      if (res.result) {
        showToast(isEditMode ? 'Address updated' : 'Address added', 'success');
        setIsModalOpen(false);
        await fetchAddresses();
      } else {
        showToast(res.message || 'Failed to save address', 'error');
      }
    } catch {
      showToast('Failed to save address', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await deleteAddress(id);
      if (res.result) {
        showToast('Address deleted', 'success');
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      } else {
        showToast(res.message || 'Failed to delete address', 'error');
      }
    } catch {
      showToast('Failed to delete address', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    setSettingDefaultId(id);
    try {
      const res = await makeDefault(id);
      if (res.result) {
        showToast('Default address updated', 'success');
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            set_default: a.id === id ? 1 : 0,
          }))
        );
      }
    } catch {
      showToast('Failed to set default', 'error');
    } finally {
      setSettingDefaultId(null);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-6">
          My Addresses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
          My Addresses
        </h2>
        <Button
          variant="primary"
          size="sm"
          onClick={openAddModal}
          icon={<Plus size={16} />}
        >
          Add New
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16 rounded-card bg-white dark:bg-gray-900 shadow-subtle">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <MapPin size={28} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No addresses saved yet
          </p>
          <Button variant="primary" size="md" onClick={openAddModal}>
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                'relative p-5 rounded-card bg-white dark:bg-gray-900 shadow-subtle hover:shadow-card transition-all duration-300',
                addr.set_default === 1 && 'ring-2 ring-accent',
                deletingId === addr.id && 'opacity-40 pointer-events-none'
              )}
            >
              {/* Default badge */}
              {addr.set_default === 1 && (
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                  <Star size={12} fill="currentColor" />
                  Default
                </span>
              )}

              <p className="text-sm font-medium text-gray-900 dark:text-white pr-16">
                {addr.address}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {[addr.city_name, addr.state_name, addr.country_name]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              {addr.postal_code && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Postal: {addr.postal_code}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Phone size={12} />
                {addr.phone}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => openEditModal(addr)}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-accent transition-colors"
                >
                  <Pencil size={13} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
                {addr.set_default !== 1 && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={settingDefaultId === addr.id}
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-accent transition-colors ml-auto"
                  >
                    <Star size={13} />
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit Address' : 'Add New Address'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Street Address"
            value={formData.address}
            onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
            placeholder="123 Main St, Apt 4B"
          />

          {/* Country */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Country
            </label>
            <select
              value={formData.country_id}
              onChange={(e) => setFormData((p) => ({ ...p, country_id: e.target.value }))}
              className="w-full h-11 px-4 rounded-[8px] border border-gray-300 bg-white text-black text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent dark:bg-gray-900 dark:text-white dark:border-gray-600"
            >
              <option value="">Select country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* State */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              State / Province
            </label>
            <select
              value={formData.state_id}
              onChange={(e) => setFormData((p) => ({ ...p, state_id: e.target.value }))}
              disabled={states.length === 0 && !loadingStates}
              className="w-full h-11 px-4 rounded-[8px] border border-gray-300 bg-white text-black text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 dark:bg-gray-900 dark:text-white dark:border-gray-600"
            >
              <option value="">
                {loadingStates ? 'Loading...' : 'Select state'}
              </option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              City
            </label>
            <select
              value={formData.city_id}
              onChange={(e) => setFormData((p) => ({ ...p, city_id: e.target.value }))}
              disabled={cities.length === 0 && !loadingCities}
              className="w-full h-11 px-4 rounded-[8px] border border-gray-300 bg-white text-black text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 dark:bg-gray-900 dark:text-white dark:border-gray-600"
            >
              <option value="">
                {loadingCities ? 'Loading...' : 'Select city'}
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Postal Code"
              value={formData.postal_code}
              onChange={(e) => setFormData((p) => ({ ...p, postal_code: e.target.value }))}
              placeholder="12345"
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              isLoading={isSaving}
            >
              {isEditMode ? 'Update Address' : 'Save Address'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
