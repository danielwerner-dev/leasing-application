const CommunicationPreferecencesValues = ['email', 'phone'] as const;
export type CommunicationPreferences =
  typeof CommunicationPreferecencesValues[number][];

export interface Customer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  emailStatus?: string;
  phone: string | null;
  phoneStatus: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  communicationPreferences: CommunicationPreferences;
  migrationStatus?: 'pending' | 'complete';
}

export interface CustomerSummary {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
}

export interface CustomerSearch {
  total: number;
  customers: CustomerSummary[];
}
