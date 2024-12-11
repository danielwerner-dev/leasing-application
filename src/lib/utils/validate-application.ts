import { Application, ApplicationStatus } from '$lib/types/Application.types';

export const isAllowedToCreateApplication = (
  applications: Application[],
  propertySlug: string
) => {
  const ALLOWED_STATUS = [
    ApplicationStatus.approved,
    ApplicationStatus.denied,
    ApplicationStatus.deleted,
    ApplicationStatus.canceled
  ];

  const dealBreaker = applications.find(({ applicationStatus, property }) => {
    return (
      property.slug === propertySlug &&
      !ALLOWED_STATUS.includes(applicationStatus)
    );
  });

  return !dealBreaker;
};
