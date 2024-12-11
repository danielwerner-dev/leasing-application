import { updateApplicationYardiOwned } from '$lib/repositories/leasing-application/update-application';

export const setYardiOwned = async (guestcardId: string) => {
  const yardiOwned = true;
  await updateApplicationYardiOwned(guestcardId, yardiOwned);
};
