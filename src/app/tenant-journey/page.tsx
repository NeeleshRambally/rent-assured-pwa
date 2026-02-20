'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getVettingRequestByReference, VettingRequestDetails } from '@/lib/api';
import TenantDetailsForm from './components/TenantDetailsForm';
import DocumentUpload from './components/DocumentUpload';
import WelcomeScreen from './components/WelcomeScreen';

function TenantJourneyContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [tenantData, setTenantData] = useState<any>(null);
  const [landlordName, setLandlordName] = useState<string | null>(null);
  const [vettingRef, setVettingRef] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [vettingDetails, setVettingDetails] = useState<VettingRequestDetails | null>(null);
  const [vettingCheckComplete, setVettingCheckComplete] = useState(false);
  const [vettingNotFound, setVettingNotFound] = useState(false);

  useEffect(() => {
    const name = searchParams.get('landlordName');
    const ref = searchParams.get('vettingRef');
    const id = searchParams.get('tenantId');
    setLandlordName(name);
    setVettingRef(ref);
    setTenantId(id);
  }, [searchParams]);

  useEffect(() => {
    async function checkVettingStatus() {
      if (!vettingRef) {
        setVettingCheckComplete(true);
        return;
      }

      try {
        const details = await getVettingRequestByReference(vettingRef);
        setVettingDetails(details);
      } catch (err: any) {
        console.error('Error fetching vetting details:', err);
        if (err.message && (err.message.includes('404') || err.message.includes('not found') || err.message.includes('Not Found'))) {
          setVettingNotFound(true);
        }
      } finally {
        setVettingCheckComplete(true);
      }
    }

    if (vettingRef) {
      checkVettingStatus();
    }
  }, [vettingRef]);

  const handleWelcomeContinue = () => {
    setCurrentStep(1);
  };

  const handleDetailsComplete = (data: any) => {
    setTenantData(data);
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress indicator - only show after welcome */}
        {currentStep > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className={`h-2 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                <p className="text-sm mt-2 font-medium">Tenant Details</p>
              </div>
              <div className="w-8" />
              <div className="flex-1">
                <div className={`h-2 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                <p className="text-sm mt-2 font-medium">Documents</p>
              </div>
            </div>
          </div>
        )}

        {/* Step content */}
        {currentStep === 0 && (
          <WelcomeScreen
            requesterName={landlordName}
            onContinue={handleWelcomeContinue}
            vettingRef={vettingRef}
            vettingDetails={vettingDetails}
            vettingCheckComplete={vettingCheckComplete}
            vettingNotFound={vettingNotFound}
          />
        )}
        {currentStep === 1 && (
          <TenantDetailsForm onComplete={handleDetailsComplete} initialData={tenantData} tenantId={tenantId} vettingRef={vettingRef} />
        )}
        {currentStep === 2 && (
          <DocumentUpload tenantData={tenantData} onBack={handleBack} vettingRef={vettingRef} />
        )}
      </div>
    </div>
  );
}

export default function TenantJourneyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></div>}>
      <TenantJourneyContent />
    </Suspense>
  );
}
