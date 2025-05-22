export interface Organization {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  description?: string;
  areaOfActivity?: string;
  status: 'pending' | 'approved' | 'rejected';
  ownerId: string; // Связь с пользователем-владельцем
  createdAt: string;
  updatedAt: string;
}

export interface RegisterOrganizationPayload {
  name: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  description?: string;
  areaOfActivity?: string;
} 