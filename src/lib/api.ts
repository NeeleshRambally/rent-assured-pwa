export type OccupationType = 'Employed' | 'SelfEmployed' | 'Unemployed';

export interface TenantDto {
  idNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  dateOfBirth?: string;
  occupation?: OccupationType;
  employer?: string;
}

export type DocumentType =
  | 'ID_DOCUMENT'
  | 'PASSPORT'
  | 'PROOF_OF_EMPLOYMENT'
  | 'PAYSLIP'
  | 'BANK_STATEMENTS'
  | 'BANK_STATEMENTS_6MONTHS'
  | 'PROOF_OF_BANK_ACCOUNT';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function createTenant(tenantData: TenantDto) {
  const response = await fetch(`${API_BASE_URL}/tenants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tenantData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to create tenant');
  }

  return response.json();
}

export async function uploadDocument(
  idNumber: string,
  documentType: DocumentType,
  file: File
) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${API_BASE_URL}/tenants/${encodeURIComponent(idNumber)}/upload?documentType=${documentType}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to upload document');
  }

  return response.json();
}

export async function submitVettingRequest(
  vettingRef: string
) {
  const response = await fetch(
    `${API_BASE_URL}/vetting/reference/${encodeURIComponent(vettingRef)}/submit`,
    {
      method: 'POST',
      headers: {
        'accept': '*/*',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to submit vetting request');
  }

  return response.json();
}

export interface VettingRequestDetails {
  uniqueReference: string;
  status: string;
  landlordName: string;
  landlordEmail: string;
  tenantIdNumber: string;
  createdAt: string;
}

export async function getVettingRequestByReference(
  vettingRef: string
): Promise<VettingRequestDetails> {
  const response = await fetch(
    `${API_BASE_URL}/vetting/reference/${encodeURIComponent(vettingRef)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Vetting request not found (404)');
    }
    const error = await response.text();
    throw new Error(error || 'Failed to fetch vetting request details');
  }

  return response.json();
}
