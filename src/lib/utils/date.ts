import dayjs from 'dayjs';

const NEXT_DAYS_LIMIT = 14;

export const parseToISO = (date: string): string => {
  const ISOPattern = /^\d{4}-\d{2}-\d{2}$/;
  const USPattern = new RegExp(
    '^((0?[1-9])|(1[0-2]))/((0?[1-9])|([12][0-9])|([3][01]))/\\d{4}$'
  );

  const dateOnly = date.split('T')[0];

  if (ISOPattern.test(dateOnly)) {
    return new Date(dateOnly).toISOString();
  }

  if (USPattern.test(dateOnly)) {
    const [month, day, year] = dateOnly.split('/');

    return new Date(`${year}-${month}-${day}`).toISOString();
  }

  throw new TypeError(
    `Invalid date format: ${date}. Valid format: YYYY-MM-DD and MM/DD/YYYY`
  );
};

export const getDateOnly = (date: string) => {
  const isoDate = parseToISO(date);
  const [dateOnly] = isoDate.split('T');

  return dateOnly;
};

export const getAllowedMoveInDateRange = (
  propertyAvailableAfter: string,
  applicationCreatedAt: string
) => {
  const propertyDateOnly = parseToISO(propertyAvailableAfter);
  const applicationDateOnly = parseToISO(applicationCreatedAt);

  const isAvailableNow = dayjs(propertyDateOnly).isBefore(dayjs());
  if (isAvailableNow) {
    return {
      min: dayjs(applicationDateOnly).add(1, 'day').toISOString(),
      max: dayjs(applicationDateOnly).add(14, 'day').toISOString()
    };
  }

  const availableBeforeLimit =
    dayjs(propertyDateOnly).diff(dayjs(), 'day') < NEXT_DAYS_LIMIT;
  if (availableBeforeLimit) {
    return {
      min: dayjs(propertyDateOnly).add(1, 'day').toISOString(),
      max: dayjs(applicationDateOnly).add(14, 'day').toISOString()
    };
  }

  return {
    min: dayjs(propertyDateOnly).add(1, 'day').toISOString(),
    max: dayjs(propertyDateOnly).add(4, 'day').toISOString()
  };
};
