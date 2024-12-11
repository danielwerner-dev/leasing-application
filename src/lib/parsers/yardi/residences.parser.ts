import { Application } from '$lib/types/Application.types';
import { YardiResidence } from '$lib/types/yardi.types';
import { getDateOnly } from '$lib/utils/date';
import { concatenateAddress } from '$lib/utils/concatenate-address';
import residenceSchema, {
  Residence
} from '$lib/form-validation/schemas/form-data/residences.schema';

export const parseResidenceToYardi = (
  application: Application
): YardiResidence[] => {
  const { formData } = application;

  const { currentResidence, pastResidences } = residenceSchema.validateSync(
    formData.residence
  );

  const residences = [currentResidence, ...pastResidences].map(residenceMapper);

  addEndDateToResidences(residences);

  return residences;
};

export const addEndDateToResidences = (residences: YardiResidence[]) => {
  residences.sort((a, b) => {
    const aStartDate = new Date(a.startDate).getUTCMilliseconds();
    const bStartDate = new Date(b.startDate).getUTCMilliseconds();
    return bStartDate - aStartDate;
  });

  let previousStart;

  for (const residence of residences) {
    if (previousStart) {
      residence.endDate = previousStart;
    }
    previousStart = residence.startDate;
  }

  return residences;
};

const residenceMapper = (residence: Residence): YardiResidence => {
  const {
    addressLine1,
    addressLine2,
    city,
    state,
    zipcode,
    startDate,
    type,
    isInternational
  } = residence;

  const parsedAddress1 = isInternational
    ? addressLine1.substring(0, 50)
    : addressLine1;

  const parsedAddress2 = isInternational
    ? addressLine1.substring(50, 100)
    : addressLine2;

  const yardiResidence = {
    type,
    address1: concatenateAddress(parsedAddress1, parsedAddress2, 100),
    city: city || undefined,
    state: state || undefined,
    postalCode: zipcode || undefined,
    startDate: getDateOnly(startDate),
    country: 'USA' // will be removed from yardi
  };

  return yardiResidence;
};
