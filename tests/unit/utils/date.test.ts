import * as utils from '$lib/utils/date';

jest.useFakeTimers().setSystemTime(new Date('2022-12-31'));

describe('Date utils tests', () => {
  describe('parseToISO', () => {
    it('parses ISO formatted date, ignoring the timezone offset', () => {
      const date = '2022-12-31T15:30:32.000Z';

      const res = utils.parseToISO(date);

      expect(res).toEqual('2022-12-31T00:00:00.000Z');
    });

    it('parses US formatted date only', () => {
      const date = '12/31/2022';

      const res = utils.parseToISO(date);

      expect(res).toEqual('2022-12-31T00:00:00.000Z');
    });

    it('throws if date is not formatted in US or ISO format', () => {
      const date = '31/12/2022';

      expect(() => utils.parseToISO(date)).toThrowError(
        `Invalid date format: ${date}. Valid format: YYYY-MM-DD and MM/DD/YYYY`
      );
    });
  });

  describe('getDateOnly', () => {
    it('gets only the date part of a ISO string', () => {
      const date = '2022-12-31T00:00:00.000';

      expect(utils.getDateOnly(date)).toEqual('2022-12-31');
    });
  });

  describe('getAllowedMoveInDateRange', () => {
    let propertyAvailableAfter: any;
    let applicationCreatedAt: any;
    beforeEach(() => {
      propertyAvailableAfter = '12/31/2022';
      applicationCreatedAt = '12/31/2022';
    });

    describe('when property is available now', () => {
      it('returns 14 days range starting the day after application was created', () => {
        propertyAvailableAfter = '12/30/2022';
        const res = utils.getAllowedMoveInDateRange(
          propertyAvailableAfter,
          applicationCreatedAt
        );

        const expectedRes = {
          min: '2023-01-01T00:00:00.000Z',
          max: '2023-01-14T00:00:00.000Z'
        };

        expect(res).toEqual(expectedRes);
      });
    });

    describe('when property is available within 14 days in the future', () => {
      it('returns min: day after property is available / max: 14 days after application created', () => {
        propertyAvailableAfter = '01/04/2023';
        const res = utils.getAllowedMoveInDateRange(
          propertyAvailableAfter,
          applicationCreatedAt
        );

        const expectedRes = {
          min: '2023-01-05T00:00:00.000Z',
          max: '2023-01-14T00:00:00.000Z'
        };

        expect(res).toEqual(expectedRes);
      });
    });

    describe('when property will be available in more than 14 days in the future', () => {
      it('returns a range of 3 days starting the day after property is available', () => {
        propertyAvailableAfter = '02/01/2023';
        const res = utils.getAllowedMoveInDateRange(
          propertyAvailableAfter,
          applicationCreatedAt
        );

        const expectedRes = {
          min: '2023-02-02T00:00:00.000Z',
          max: '2023-02-05T00:00:00.000Z'
        };

        expect(res).toEqual(expectedRes);
      });
    });
  });
});
