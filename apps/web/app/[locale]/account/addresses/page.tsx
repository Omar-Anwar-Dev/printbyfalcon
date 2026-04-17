'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Address, createAddress, deleteAddress, fetchAddresses, updateAddress } from '../../../../lib/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const emptyForm = {
  fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', isDefault: false,
};

export default function AddressesPage() {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Address | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: addresses = [] } = useQuery({ queryKey: ['addresses'], queryFn: fetchAddresses });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['addresses'] });

  const createMut = useMutation({
    mutationFn: (data: typeof emptyForm) => createAddress(data as Omit<Address, 'id'>),
    onSuccess: () => { invalidate(); setAdding(false); setForm(emptyForm); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Address> }) => updateAddress(id, data),
    onSuccess: () => { invalidate(); setEditing(null); setForm(emptyForm); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: invalidate,
  });

  const openEdit = (addr: Address) => {
    setEditing(addr);
    setForm({
      fullName: addr.fullName, phone: addr.phone, street: addr.street,
      city: addr.city, state: addr.state, postalCode: addr.postalCode ?? '',
      isDefault: addr.isDefault ?? false,
    });
    setAdding(false);
  };
  const openAdd = () => { setAdding(true); setEditing(null); setForm(emptyForm); };
  const cancel = () => { setAdding(false); setEditing(null); setForm(emptyForm); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMut.mutate({ id: editing.id, data: form });
    else createMut.mutate(form);
  };

  return (
    <div>
      <header className="mb-8 flex items-end justify-between border-b border-ink/10 pb-4">
        <div>
          <p className="eyebrow text-gold-deep mb-2">№ 03</p>
          <h2 className="text-display text-3xl md:text-4xl tracking-tightest">
            {locale === 'ar' ? 'العناوين' : 'Addresses'}
          </h2>
        </div>
        {!adding && !editing && (
          <button onClick={openAdd} className="btn-ghost">
            <PlusIcon className="h-4 w-4" />
            {locale === 'ar' ? 'إضافة' : 'Add address'}
          </button>
        )}
      </header>

      {(adding || editing) && (
        <form onSubmit={submit} className="border border-ink/10 bg-paper-white p-6 mb-8 space-y-5">
          <p className="eyebrow text-gold-deep">
            {editing
              ? (locale === 'ar' ? 'تعديل العنوان' : 'Edit address')
              : (locale === 'ar' ? 'عنوان جديد' : 'New address')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'الاسم الكامل' : 'Full name'}</label>
              <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-atelier" />
            </div>
            <div>
              <label className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'الهاتف' : 'Phone'}</label>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-atelier" />
            </div>
            <div className="md:col-span-2">
              <label className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'الشارع' : 'Street'}</label>
              <input required value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="input-atelier" />
            </div>
            <div>
              <label className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'المدينة' : 'City'}</label>
              <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-atelier" />
            </div>
            <div>
              <label className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'المحافظة' : 'Governorate'}</label>
              <input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-atelier" />
            </div>
            <div>
              <label className="eyebrow block mb-2 text-ink-soft">{locale === 'ar' ? 'الرمز البريدي' : 'Postal code'}</label>
              <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="input-atelier" />
            </div>
            <label className="flex items-center gap-2 text-sm mt-6">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="accent-gold-deep" />
              {locale === 'ar' ? 'جعله العنوان الافتراضي' : 'Set as default address'}
            </label>
          </div>
          <div className="flex gap-3 pt-3">
            <button type="submit" className="btn-ink" disabled={createMut.isPending || updateMut.isPending}>
              {editing ? (locale === 'ar' ? 'حفظ' : 'Save') : (locale === 'ar' ? 'إضافة' : 'Add')}
            </button>
            <button type="button" onClick={cancel} className="btn-ghost">
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !adding ? (
        <div className="border border-dashed border-ink/20 py-16 text-center">
          <p className="text-ink-soft mb-4">
            {locale === 'ar' ? 'لم تضف أي عنوان بعد' : 'No addresses yet'}
          </p>
          <button onClick={openAdd} className="btn-ink">
            <PlusIcon className="h-4 w-4" />
            {locale === 'ar' ? 'أضف أول عنوان' : 'Add your first address'}
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <li key={a.id} className="border border-ink/10 bg-paper-white p-5 relative">
              {a.isDefault && (
                <span className="stamp text-gold-deep border border-gold/50 bg-gold/10 px-2 py-0.5 absolute top-5 right-5">
                  {locale === 'ar' ? 'افتراضي' : 'Default'}
                </span>
              )}
              <p className="font-medium text-sm">{a.fullName}</p>
              <address className="not-italic text-sm text-ink-soft mt-2 leading-relaxed">
                <p>{a.street}</p>
                <p>{a.city}, {a.state}</p>
                {a.postalCode && <p>{a.postalCode}</p>}
                <p className="font-mono text-xs mt-2">{a.phone}</p>
              </address>
              <div className="flex gap-2 mt-4 pt-4 border-t border-ink/10">
                <button onClick={() => openEdit(a)} className="text-xs stamp text-ink-soft hover:text-ink flex items-center gap-1">
                  <PencilIcon className="h-3 w-3" /> {locale === 'ar' ? 'تعديل' : 'Edit'}
                </button>
                <button onClick={() => deleteMut.mutate(a.id)} className="text-xs stamp text-ink-soft hover:text-seal flex items-center gap-1 ml-auto">
                  <TrashIcon className="h-3 w-3" /> {locale === 'ar' ? 'حذف' : 'Remove'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
