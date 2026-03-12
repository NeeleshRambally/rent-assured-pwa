'use client';

import { useState, useMemo } from 'react';
import { createTenant, uploadDocument, submitVettingRequest, DocumentType, OccupationType, IdType } from '@/lib/api';

interface DocumentUploadProps {
  tenantData: any;
  onBack: () => void;
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

interface UploadedDocument {
  id: string;
  type: string;
  file: File;
  preview?: string;
}

interface DocTypeOption {
  value: DocumentType;
  label: string;
}

function getDocumentTypes(occupation: OccupationType | undefined, idType: IdType | undefined): DocTypeOption[] {
  // Show only the relevant ID document type based on what the tenant selected
  const idDoc: DocTypeOption = idType === 'passport'
    ? { value: 'PASSPORT', label: 'Passport' }
    : { value: 'ID_DOCUMENT', label: 'ID Document' };

  const common: DocTypeOption[] = [
    idDoc,
    { value: 'PROOF_OF_BANK_ACCOUNT', label: 'Proof of Bank Account' },
  ];

  if (occupation === 'SelfEmployed') {
    return [
      ...common,
      { value: 'BANK_STATEMENTS_6MONTHS', label: 'Bank Statements (Last 6 months)' },
      { value: 'PROOF_OF_EMPLOYMENT', label: 'Business Registration / Proof of Business' },
    ];
  }

  if (occupation === 'Unemployed') {
    return [
      ...common,
      { value: 'BANK_STATEMENTS', label: 'Bank Statements (Last 3 months)' },
    ];
  }

  // Employed (default)
  return [
    ...common,
    { value: 'BANK_STATEMENTS', label: 'Bank Statements (Last 3 months)' },
    { value: 'PAYSLIP', label: 'Payslip (Latest)' },
    { value: 'PROOF_OF_EMPLOYMENT', label: 'Proof of Employment / Employment Letter' },
  ];
}

export default function DocumentUpload({ tenantData, onBack, vettingRef }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const occupation = tenantData?.occupation as OccupationType | undefined;
  const idType = tenantData?.idType as IdType | undefined;
  const documentTypes = useMemo(() => getDocumentTypes(occupation, idType), [occupation, idType]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const newDoc: UploadedDocument = {
        id: Math.random().toString(36).substr(2, 9),
        type: docType,
        file,
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocuments(prev => prev.map(doc =>
            doc.id === newDoc.id ? { ...doc, preview: reader.result as string } : doc
          ));
        };
        reader.readAsDataURL(file);
      }

      setDocuments(prev => [...prev, newDoc]);
    });

    // Reset input
    e.target.value = '';
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (documents.length === 0) {
      alert('Please upload at least one document');
      return;
    }

    if (!consentGranted) {
      alert('You must agree to the consent terms before submitting.');
      return;
    }

    setUploading(true);

    try {
      // Step 1: Create/update tenant with correct field names
      await createTenant({
        idNumber: tenantData.idNumber,
        firstName: tenantData.firstName,
        lastName: tenantData.lastName,
        email: tenantData.email,
        contactNumber: tenantData.contactNumber,
        occupation: tenantData.occupation || undefined,
        employer: tenantData.employer || undefined,
        idType: tenantData.idType || 'sa_id',
      });

      // Step 2: Upload all documents
      const uploadPromises = documents.map((doc) =>
        uploadDocument(tenantData.idNumber, doc.type as DocumentType, doc.file)
      );

      await Promise.all(uploadPromises);

      // Step 3: Submit vetting request with consent (marks as completed)
      if (vettingRef) {
        try {
          await submitVettingRequest(vettingRef, {
            consentGranted: true,
            consentVersion: '1.0',
          });
        } catch (statusError) {
          console.error('Failed to submit vetting request:', statusError);
          // Don't fail the whole submission if status update fails
        }
      }

      setUploading(false);
      setSubmitted(true);
    } catch (error) {
      setUploading(false);
      alert(`Error submitting application: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Submission error:', error);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-lg text-gray-700 mb-2">
            Thank you for submitting your details.
          </p>
          <p className="text-gray-600">
            We will be in touch with the next steps.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-sm text-blue-800 mb-2">
            We've received your application and will review it shortly.
          </p>
          <p className="text-sm text-blue-900 font-medium">
            A confirmation has been sent to <strong>{tenantData?.email}</strong>
          </p>
        </div>

        <div className="space-y-4 text-sm text-gray-600 mb-8">
          <div className="flex items-start justify-center gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-left">Your details have been securely saved</p>
          </div>
          <div className="flex items-start justify-center gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-left">All documents have been uploaded successfully</p>
          </div>
          <div className="flex items-start justify-center gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-left">Our team will contact you within 2-3 business days</p>
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/'}
          className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 transition-colors font-medium text-lg"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Submitting Your Application</h2>
            <p className="text-gray-600">Please wait while we process your documents...</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <VettingRefBanner vettingRef={vettingRef} />
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Upload Documents</h1>
        <p className="text-gray-600 mb-6">
          Please upload the required documents to complete your application.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Upload Sections */}
        {documentTypes.map((docType) => (
          <div key={docType.value} className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {docType.label}
            </label>

            <div className="relative">
              <input
                type="file"
                id={`file-${docType.value}`}
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => handleFileSelect(e, docType.value)}
                className="hidden"
              />
              <label
                htmlFor={`file-${docType.value}`}
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
              >
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </span>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, or Images (Max 10MB)</p>
                </div>
              </label>
            </div>

            {/* Uploaded files for this type */}
            {documents.filter(doc => doc.type === docType.value).length > 0 && (
              <div className="mt-3 space-y-2">
                {documents.filter(doc => doc.type === docType.value).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {doc.preview ? (
                        <img src={doc.preview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(doc.file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="ml-3 text-red-600 hover:text-red-800 flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Consent */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={consentGranted}
              onChange={(e) => setConsentGranted(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="consent" className="text-sm text-gray-700 flex-1">
              I consent to RentAssured processing my personal information, including identity verification, credit checks, criminal record checks, and document analysis for the purpose of tenant screening.
              <button
                type="button"
                onClick={() => setShowConsentModal(true)}
                className="inline-flex items-center ml-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View full terms
              </button>
            </label>
          </div>
          {!consentGranted && documents.length > 0 && (
            <p className="text-amber-600 text-xs mt-2 ml-7">You must agree to the consent terms to submit your application.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="sm:flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={uploading || documents.length === 0 || !consentGranted}
            className="sm:flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>

        {/* Document count indicator */}
        {documents.length > 0 && (
          <div className="text-center text-sm text-gray-600">
            {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
          </div>
        )}
      </form>
      </div>

      {/* Consent Terms Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-lg font-bold text-gray-900">Consent Terms & Conditions</h2>
              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 text-sm text-gray-700 leading-relaxed">
              <p className="font-semibold text-gray-900">
                By submitting your application, you consent to the following:
              </p>

              <div>
                <h3 className="font-semibold text-gray-800 mb-1">1. Identity Verification</h3>
                <p>
                  Your identity documents (SA ID or Passport) will be verified through third-party
                  identity verification services to confirm your identity and detect potential fraud.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-1">2. Credit Check</h3>
                <p>
                  A consumer credit report will be obtained from a registered credit bureau to assess
                  your creditworthiness. This is a soft enquiry and will not affect your credit score.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-1">3. Criminal Record Check</h3>
                <p>
                  A criminal record check will be performed using your identity information to assess
                  any background risks.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-1">4. Employment Confirmation</h3>
                <p>
                  If applicable, your employment status may be verified with your employer to confirm
                  your income and employment details.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-1">5. Document Analysis</h3>
                <p>
                  Your uploaded documents (bank statements, payslips, employment letters) will be
                  analysed using AI-powered tools to extract financial information for the purpose
                  of affordability assessment.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-1">6. Data Protection (POPIA)</h3>
                <p>
                  Your personal information will be processed in accordance with the Protection of
                  Personal Information Act (POPIA). Your data will only be used for the purpose of
                  tenant screening and will not be shared with third parties except as necessary to
                  complete the verification process. You may request access to, correction of, or
                  deletion of your personal information at any time.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-1">7. Data Retention</h3>
                <p>
                  Verification results are retained for up to 3 months and may be reused if another
                  landlord requests a screening during that period, without requiring a new
                  verification. You will be asked to consent again for each new screening request.
                </p>
              </div>

              <p className="text-xs text-gray-500 pt-2">
                Consent Version 1.0 — Last updated March 2026
              </p>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
              <button
                type="button"
                onClick={() => {
                  setConsentGranted(true);
                  setShowConsentModal(false);
                }}
                className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
