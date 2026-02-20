export interface TenantDto {
  idNumber: string;
  name: string;
  surname: string;
  email: string;
  cellNumber: string;
}

export type DocumentType =
  | 'ID_DOCUMENT'
  | 'PASSPORT'
  | 'PROOF_OF_EMPLOYMENT'
  | 'BANK_STATEMENTS'
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

export async function updateVettingRequestStatus(
  vettingRef: string,
  status: string
) {
  const response = await fetch(
    `${API_BASE_URL}/vetting/reference/${encodeURIComponent(vettingRef)}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to update vetting request status');
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
  // Add other fields as needed
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
