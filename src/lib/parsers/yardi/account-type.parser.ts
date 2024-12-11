import { YardiBankAccountType } from '$lib/types/yardi.types';

export const parseAccountTypeToYardi = (
  accountType: YardiBankAccountType
): boolean => {
  return YardiBankAccountType[accountType] === 'savings' ? true : false;
};
