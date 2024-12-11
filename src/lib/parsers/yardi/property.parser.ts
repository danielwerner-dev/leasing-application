import { Application } from '$lib/types/Application.types';

export const parsePropertyToYardi = (application: Application) => {
  const {
    property: { propertyCode, address1 }
  } = application;

  const yardiProperty = {
    propertyCode,
    streetAddress: address1
  };

  return yardiProperty;
};
