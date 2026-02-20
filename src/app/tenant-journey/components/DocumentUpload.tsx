'use client';

import { useState } from 'react';
import { createTenant, uploadDocument, submitVettingRequest, DocumentType } from '@/lib/api';

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

export default function DocumentUpload({ tenantData, onBack, vettingRef }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const documentTypes = [
    { value: 'ID_DOCUMENT', label: 'ID Document' },
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'PROOF_OF_EMPLOYMENT', label: 'Proof of Employment' },
    { value: 'BANK_STATEMENTS', label: 'Bank Statements (Last 3 months)' },
    { value: 'PROOF_OF_BANK_ACCOUNT', label: 'Proof of Bank Account' },
  ];

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

    setUploading(true);

    try {
      // Step 1: Create/update tenant
      await createTenant({
        idNumber: tenantData.idNumber,
        name: tenantData.name,
        surname: tenantData.surname,
        email: tenantData.email,
        cellNumber: tenantData.cellNumber,
      });

      // Step 2: Upload all documents
      const uploadPromises = documents.map((doc) =>
        uploadDocument(tenantData.idNumber, doc.type as DocumentType, doc.file)
      );

      await Promise.all(uploadPromises);

      // Step 3: Submit vetting request (marks as completed)
      if (vettingRef) {
        try {
          await submitVettingRequest(vettingRef);
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
            disabled={uploading || documents.length === 0}
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
  );
}
