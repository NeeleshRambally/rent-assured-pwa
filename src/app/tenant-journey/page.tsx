'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TenantDetailsForm from './components/TenantDetailsForm';
import DocumentUpload from './components/DocumentUpload';
import WelcomeScreen from './components/WelcomeScreen';

function TenantJourneyContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [tenantData, setTenantData] = useState<any>(null);
  const [requesterName, setRequesterName] = useState<string | null>(null);

  useEffect(() => {
    const name = searchParams.get('requesterName');
    setRequesterName(name);
  }, [searchParams]);

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
          <WelcomeScreen requesterName={requesterName} onContinue={handleWelcomeContinue} />
        )}
        {currentStep === 1 && (
          <TenantDetailsForm onComplete={handleDetailsComplete} initialData={tenantData} />
        )}
        {currentStep === 2 && (
          <DocumentUpload tenantData={tenantData} onBack={handleBack} />
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
