import { Application } from '$lib/types/Application.types';
import { getAllowedMoveInDateRange } from '$lib/utils/date';

export const getValidationContext = (application: Application) => {
  const { property } = application;

  const { min: availableFrom, max: availableTo } = getAllowedMoveInDateRange(
    property.availableAt,
    application.audit.createdAt
  );

  return {
    market: property.market.slug,
    availableFrom,
    availableTo,
    applicationType: application.applicationType,
    promoted: application.promoted,
    leaseStartDate: application.primaryApplicationData?.leaseStartDate,
    leaseTerm: application.primaryApplicationData?.leaseTerm
  };
};
