'use client';

import { useState, useEffect } from 'react';
import { getVettingRequestByReference, VettingRequestDetails } from '@/lib/api';

interface WelcomeScreenProps {
  requesterName: string | null;
  onContinue: () => void;
}

function VettingRefBanner({ vettingRef }: { vettingRef?: string | null }) {
  if (!vettingRef) return null;

  return (
    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 text-center">
      <span className="text-sm font-medium">Vetting Reference: {vettingRef}</span>
    </div>
  );
}

export default function WelcomeScreen({ requesterName, onContinue, vettingRef }: WelcomeScreenProps & { vettingRef: string | null }) {
  const [loading, setLoading] = useState(true);
  const [vettingDetails, setVettingDetails] = useState<VettingRequestDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkVettingStatus() {
      if (!vettingRef) {
        setLoading(false);
        return;
      }

      try {
        const details = await getVettingRequestByReference(vettingRef);
        setVettingDetails(details);
      } catch (err) {
        setError('Failed to load vetting request details');
        console.error('Error fetching vetting details:', err);
      } finally {
        setLoading(false);
      }
    }

    checkVettingStatus();
  }, [vettingRef]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 md:p-10 text-center">
        <div className="text-6xl mb-6">⏳</div>
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  // Show already submitted message if status is not Pending
  if (vettingDetails && vettingDetails.status !== 'Pending') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 md:p-10 text-center">
        <VettingRefBanner vettingRef={vettingRef} />
        <div className="mb-8">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Already Submitted
          </h1>
          <p className="text-lg text-gray-700 mb-3">
            Your vetting request has already been submitted.
          </p>
          <p className="text-gray-600 mb-6">
            Current status: <span className="font-semibold text-blue-600">{vettingDetails.status}</span>
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h2>
          <p className="text-sm text-gray-700 mb-4">
            If you believe this is an error or need to update your information, please contact your landlord:
          </p>
          <div className="bg-white border border-amber-300 rounded-lg p-4">
            <p className="font-medium text-gray-900">{vettingDetails.landlordName}</p>
            <a
              href={`mailto:${vettingDetails.landlordEmail}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {vettingDetails.landlordEmail}
            </a>
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/'}
          className="bg-gray-600 text-white py-3 px-8 rounded-md hover:bg-gray-700 transition-colors font-medium"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-10 text-center">
      <VettingRefBanner vettingRef={vettingRef} />
      <div className="mb-8">
        <div className="text-6xl mb-6">👋</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Welcome!
        </h1>
        {requesterName ? (
          <>
            <p className="text-lg md:text-xl text-gray-700 mb-3">
              <span className="font-semibold text-blue-600">{requesterName}</span> has requested you to be submitted for vetting.
            </p>
            <p className="text-gray-600">
              Please complete the next steps to start your journey with us! 🏠
            </p>
          </>
        ) : (
          <>
            <p className="text-lg md:text-xl text-gray-700 mb-3">
              Let's get you started on your tenant application!
            </p>
            <p className="text-gray-600">
              Complete the next steps to begin your journey with us 🏠
            </p>
          </>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">What to expect:</h2>
        <div className="space-y-3 text-left">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-medium text-gray-900">Step 1: Your Details</p>
              <p className="text-sm text-gray-600">Share your basic information with us</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <p className="font-medium text-gray-900">Step 2: Documents</p>
              <p className="text-sm text-gray-600">Upload required documents for verification</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-medium text-gray-900">Step 3: Review</p>
              <p className="text-sm text-gray-600">We'll review and get back to you within 2-3 days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-green-800 flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Your information is secure and confidential
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full md:w-auto bg-blue-600 text-white py-3 px-12 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-lg"
      >
        Let's Get Started! 🚀
      </button>
    </div>
  );
}
