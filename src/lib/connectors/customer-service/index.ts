import createIamAxiosClient from '@invitation-homes/iam-axios';
import { CasingPattern, jsonCasingParser } from '$lib/utils/json-casing-parser';

import {
  CustomerSearch,
  CustomerSummary
} from '$lib/types/customer-service.types';

export const iamAxios = createIamAxiosClient(process.env.CUSTOMER_SERVICE_URL);

export const getCustomerByEmail = async (
  email: string
): Promise<CustomerSummary | null> => {
  const path = `/admin/customers/search`;
  const res: { data: CustomerSearch } = await iamAxios.get(path, {
    params: { email }
  });

  const data = jsonCasingParser(res.data, CasingPattern.CAMEL);

  if (data.total > 0) {
    return data.customers[0];
  }

  return null;
};
