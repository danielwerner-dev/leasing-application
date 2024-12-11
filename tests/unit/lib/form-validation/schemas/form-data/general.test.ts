import dayjs from 'dayjs';

import schema from '$lib/form-validation/schemas/form-data/general.schema';

import {
  generalMock,
  generalContext
} from '$fixtures/form-data/general.fixture';

const getEndDate = (startDate, leaseTerm) =>
  dayjs(startDate).add(leaseTerm, 'months').format('MM/DD/YYYY');

describe('General schema', () => {
  let payload;
  let context;
  beforeEach(() => {
    payload = generalMock();
    context = generalContext();
  });
  it('accepts a valid payload', () => {
    expect(schema.isValidSync(payload, { context })).toBe(true);
  });

  describe('leaseStartDate', () => {
    it('rejects payload without context', () => {
      expect(schema.isValidSync(payload)).toBe(false);

      context.availableFrom = undefined;
      expect(schema.isValidSync(payload, { context })).toBe(false);

      context.availableFrom = '09/13/2022';
      context.availableTo = undefined;
      expect(schema.isValidSync(payload, { context })).toBe(false);
    });

    it('rejects payload with start date before available', () => {
      payload.leaseStartDate = dayjs(context.availableFrom)
        .subtract(1, 'day')
        .format('MM/DD/YYYY');
      payload.leaseEndDate = getEndDate(
        payload.leaseStartDate,
        payload.leaseTerm
      );
      expect(schema.isValidSync(payload, { context })).toBe(false);
    });

    it('accepts payload with start date at the first available date', () => {
      payload.leaseStartDate = context.availableFrom;
      payload.leaseEndDate = getEndDate(
        payload.leaseStartDate,
        payload.leaseTerm
      );

      expect(schema.isValidSync(payload, { context })).toBe(true);
    });

    it('accepts payload with start date at the last available date', () => {
      payload.leaseStartDate = context.availableTo;
      payload.leaseEndDate = getEndDate(
        payload.leaseStartDate,
        payload.leaseTerm
      );

      expect(schema.isValidSync(payload, { context })).toBe(true);
    });

    it('rejects payload with start date after the last available date', () => {
      payload.leaseStartDate = dayjs(context.availableTo)
        .add(1, 'day')
        .format('MM/DD/YYYY');
      payload.leaseEndDate = getEndDate(
        payload.leaseStartDate,
        payload.leaseTerm
      );

      expect(schema.isValidSync(payload, { context })).toBe(false);
    });

    it('rejects payload for co-applicant if start date does not match primary data', () => {
      context.applicationType = 'coapplicant';
      context.leaseStartDate = '2023-01-01';
      context.leaseTerm = payload.leaseTerm;

      expect(schema.isValidSync(payload, { context })).toBe(false);
    });

    it('rejects payload for promoted application if start date does not match primary data', () => {
      context.promoted = true;
      context.leaseStartDate = '2023-01-01';
      context.leaseTerm = payload.leaseTerm;

      expect(schema.isValidSync(payload, { context })).toBe(false);
    });

    it('accepts payload for promoted application if start date matches primary data', () => {
      context.promoted = true;
      context.leaseStartDate = payload.leaseStartDate;
      context.leaseTerm = payload.leaseTerm;

      expect(schema.isValidSync(payload, { context })).toBe(true);
    });
  });

  describe('lease term', () => {
    it('accepts lease term equals to 12 for all markets', () => {
      payload.leaseTerm = '12';
      context.market = 'sacramento-ca';
      payload.leaseEndDate = getEndDate(
        payload.leaseStartDate,
        payload.leaseTerm
      );

      expect(schema.isValidSync(payload, { context })).toBe(true);

      context.market = 'los-angeles-ca';
      expect(schema.isValidSync(payload, { context })).toBe(true);

      context.market = 'not-california';
      expect(schema.isValidSync(payload, { context })).toBe(true);
    });

    it('accepts lease term equals to 24 for all markets', () => {
      payload.leaseTerm = '24';
      context.market = 'los-angeles-ca';
      payload.leaseEndDate = getEndDate(
        payload.leaseStartDate,
        payload.leaseTerm
      );

      expect(schema.isValidSync(payload, { context })).toBe(true);

      context.market = 'sacramento-ca';
      expect(schema.isValidSync(payload, { context })).toBe(true);

      context.market = 'not-california';
      expect(schema.isValidSync(payload, { context })).toBe(true);
    });

    it('rejects payload if market is california and lease is not 12 or 24', () => {
      context.market = 'not-california';
      payload.leaseTerm = '13';
      payload.leaseEndDate = getEndDate(
        payload.leaseStartDate,
        payload.leaseTerm
      );

      expect(schema.isValidSync(payload, { context })).toBe(true);

      context.market = 'sacramento-ca';
      expect(schema.isValidSync(payload, { context })).toBe(false);

      context.market = 'los-angeles-ca';
      expect(schema.isValidSync(payload, { context })).toBe(false);
    });

    it('rejects payload if lease term is undefined and market is california', () => {
      context.market = 'los-angeles-ca';
      payload.leaseTerm = undefined;
      expect(schema.isValidSync(payload, { context, abortEarly: false })).toBe(
        false
      );

      context.market = 'sacramento-ca';
      expect(schema.isValidSync(payload, { context, abortEarly: false })).toBe(
        false
      );
    });
  });

  describe('leaseEndDate', () => {
    it('accepts if leaseEndDate corresponds to start date + lease term', () => {
      payload.leaseStartDate = context.availableFrom;
      payload.leaseTerm = '12';
      payload.leaseEndDate = dayjs(payload.leaseStartDate)
        .add(payload.leaseTerm, 'months')
        .format('MM/DD/YYYY');

      expect(schema.isValidSync(payload, { context })).toBe(true);
    });

    it('rejects if leaseEndDate does not corresponds to start date + lease term', () => {
      payload.leaseStartDate = context.availableFrom;
      payload.leaseTerm = '12';
      payload.leaseEndDate = dayjs(payload.leaseStartDate)
        .add('13' as any, 'months')
        .format('MM/DD/YYYY');

      expect(schema.isValidSync(payload, { context })).toBe(false);
    });
  });

  describe('phone validation', () => {
    it('accepts national valid phone number', () => {
      payload.phone.digits = '5555555555';
      expect(schema.isValidSync(payload, { context })).toBe(true);
    });

    it('accepts a valid international phone number', () => {
      payload.phone.digits = '+5514997777777';
      expect(schema.isValidSync(payload, { context })).toBe(true);
    });

    it('rejects invalid national phone number', () => {
      payload.phone.digits = '555abc5555';
      expect(schema.isValidSync(payload, { context })).toBe(false);

      payload.phone.digits = '55555555555555';
      expect(schema.isValidSync(payload, { context })).toBe(false);
    });

    it('rejects invalid international phone number', () => {
      payload.phone.digits = '+555abc5555';
      expect(schema.isValidSync(payload, { context })).toBe(false);

      payload.phone.digits = '+55555555555555555555';
      expect(schema.isValidSync(payload, { context })).toBe(false);
    });
  });

  describe('middle name', () => {
    it('accepts empty middle name', () => {
      payload.middleName = '';
      expect(schema.isValidSync(payload, { context })).toBe(true);
    });

    it('rejects middle name with invalid characters', () => {
      payload.middleName = 'R2D2';
      expect(schema.isValidSync(payload, { context })).toBe(false);
    });

    it('accepts middle name with valid characters', () => {
      payload.middleName = 'John';
      expect(schema.isValidSync(payload, { context })).toBe(true);
    });
  });
});
