export const concatenateAddress = (
  address1: string | undefined,
  address2: string | undefined,
  limit: number
) => {
  if (!address1) return;
  if (!address2) return address1;
  const finalAddress = `${address1} ${address2}`;

  return finalAddress.toString().substring(0, limit);
};
