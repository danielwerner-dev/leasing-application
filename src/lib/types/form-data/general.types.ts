export interface General {
  applicationType: string;
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  maritalStatus: string;
  phone: {
    digits: string;
    type: string;
  };
  audit: {
    updatedAt: string;
    updatedByIp: string;
  };
  methodOfContact: string;
  leaseStartDate: string;
  leaseEndDate: string;
  leaseTerm: string;
  metadata: {
    config: {
      isCalifornia: boolean;
    };
  };
}
