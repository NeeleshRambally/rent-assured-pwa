'use client';

import { useState } from 'react';
import { OccupationType, IdType } from '@/lib/api';

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
    idType: (initialData?.idType as IdType) || 'sa_id' as IdType,
    idNumber: tenantId || initialData?.idNumber || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    contactNumber: initialData?.contactNumber || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    occupation: (initialData?.occupation as OccupationType) || '' as OccupationType | '',
    employer: initialData?.employer || '',
  });
  const [dobAutoFilled, setDobAutoFilled] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Extract date of birth from a 13-digit SA ID (first 6 digits = YYMMDD). */
  const extractDobFromSaId = (id: string): string | null => {
    if (id.length !== 13 || !/^\d{13}$/.test(id)) return null;
    const yy = parseInt(id.substring(0, 2), 10);
    const mm = id.substring(2, 4);
    const dd = id.substring(4, 6);
    const currentTwoDigitYear = new Date().getFullYear() % 100;
    const fullYear = yy <= currentTwoDigitYear ? 2000 + yy : 1900 + yy;
    // Validate the date
    const date = new Date(`${fullYear}-${mm}-${dd}T00:00:00`);
    if (isNaN(date.getTime())) return null;
    return `${fullYear}-${mm}-${dd}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // When switching ID type, clear DOB auto-fill
    if (name === 'idType') {
      setDobAutoFilled(false);
      // If switching to passport, clear the auto-filled DOB so user enters it manually
      if (value === 'passport' && dobAutoFilled) {
        setFormData(prev => ({ ...prev, [name]: value, dateOfBirth: '' }));
      }
    }

    // Auto-fill date of birth from SA ID number (only if using SA ID)
    if (name === 'idNumber' && formData.idType === 'sa_id') {
      const dob = extractDobFromSaId(value);
      if (dob) {
        setFormData(prev => ({ ...prev, [name]: value, dateOfBirth: dob }));
        setDobAutoFilled(true);
      } else {
        setDobAutoFilled(false);
      }
    }

    // If user manually edits DOB, clear the auto-fill flag
    if (name === 'dateOfBirth') {
      setDobAutoFilled(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.idNumber.trim()) newErrors.idNumber = 'ID Number is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Cell number is required';
    if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.occupation) newErrors.occupation = 'Please select your employment status';
    if (formData.occupation === 'Employed' && !formData.employer.trim()) {
      newErrors.employer = 'Employer name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submitData: any = {
        idType: formData.idType,
        idNumber: formData.idNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        dateOfBirth: formData.dateOfBirth,
        occupation: formData.occupation,
      };

      if (formData.occupation === 'Employed' && formData.employer.trim()) {
        submitData.employer = formData.employer.trim();
      }

      onComplete(submitData);
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
              <label htmlFor="idType" className="block text-sm font-medium text-gray-700 mb-1">
                Identification Type *
              </label>
              <select
                id="idType"
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
              >
                <option value="sa_id">South African ID</option>
                <option value="passport">Passport</option>
              </select>
            </div>

            <div>
              <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
                {formData.idType === 'passport' ? 'Passport Number' : 'ID Number'} *
              </label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder={formData.idType === 'passport' ? 'Enter your passport number' : 'Enter your 13-digit SA ID number'}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.idNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.idNumber && <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {dobAutoFilled && (
                <p className="text-green-600 text-xs mt-1">Auto-filled from ID number</p>
              )}
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
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
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Cell Number *
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contactNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Employment Information</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                Employment Status *
              </label>
              <select
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                  errors.occupation ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select your employment status</option>
                <option value="Employed">Employed</option>
                <option value="SelfEmployed">Self-Employed</option>
                <option value="Unemployed">Unemployed</option>
              </select>
              {errors.occupation && <p className="text-red-500 text-xs mt-1">{errors.occupation}</p>}
            </div>

            {formData.occupation === 'Employed' && (
              <div>
                <label htmlFor="employer" className="block text-sm font-medium text-gray-700 mb-1">
                  Employer Name *
                </label>
                <input
                  type="text"
                  id="employer"
                  name="employer"
                  value={formData.employer}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corporation"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.employer ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.employer && <p className="text-red-500 text-xs mt-1">{errors.employer}</p>}
              </div>
            )}

            {formData.occupation === 'SelfEmployed' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  As a self-employed applicant, please ensure you upload <strong>6 months</strong> of bank statements
                  in the next step.
                </p>
              </div>
            )}

            {formData.occupation === 'Unemployed' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Please upload your bank statements showing any income sources (e.g. grants, support payments, savings)
                  in the next step.
                </p>
              </div>
            )}
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
