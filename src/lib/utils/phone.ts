export const isPhoneInternational = (phone: string): boolean => {
  return phone.startsWith('+');
};
