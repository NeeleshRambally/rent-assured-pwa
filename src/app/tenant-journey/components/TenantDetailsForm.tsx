'use client';

import { useState } from 'react';

interface TenantDetailsFormProps {
  onComplete: (data: any) => void;
  initialData?: any;
  tenantId?: string | null;
  vettingRef?: string | null;
}

function VettingRefBanner({ vettingRef }: { vettingRef?: string | null }) {
  if (!vettingRef) return null;

  return (
    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 text-center">
      <span className="text-sm font-medium">Vetting Reference: {vettingRef}</span>
    </div>
  );
}

export default function TenantDetailsForm({ onComplete, initialData, tenantId, vettingRef }: TenantDetailsFormProps) {
  const [formData, setFormData] = useState({
    idNumber: tenantId || initialData?.idNumber || '',
    name: initialData?.name || '',
    surname: initialData?.surname || '',
    email: initialData?.email || '',
    cellNumber: initialData?.cellNumber || '',
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.idNumber.trim()) newErrors.idNumber = 'ID Number is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.cellNumber.trim()) newErrors.cellNumber = 'Cell number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onComplete(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      <VettingRefBanner vettingRef={vettingRef} />
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Tenant Details</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
                ID Number *
              </label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.idNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.idNumber && <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                  Surname *
                </label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.surname ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.surname && <p className="text-red-500 text-xs mt-1">{errors.surname}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Contact Information</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="cellNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Cell Number *
              </label>
              <input
                type="tel"
                id="cellNumber"
                name="cellNumber"
                value={formData.cellNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cellNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cellNumber && <p className="text-red-500 text-xs mt-1">{errors.cellNumber}</p>}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Continue to Document Upload
          </button>
        </div>
      </form>
    </div>
  );
}
