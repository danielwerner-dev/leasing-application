import { addEndDateToResidences } from '$lib/parsers/yardi/residences.parser';

describe('Residence Parser Test', () => {
  it('Should add end Dates to previous addresses', () => {
    const residences = [
      {
        type: 'current',
        address1: '789 Main St',
        city: 'Carrollton',
        state: 'TX',
        postalCode: '75201',
        startDate: '2023-03-03',
        country: 'USA'
      },
      {
        type: 'past',
        address1: '456 DEF St',
        city: 'Bedford',
        state: 'TX',
        postalCode: '75201',
        startDate: '2020-02-02',
        country: 'USA'
      },
      {
        type: 'past',
        address1: '123 ABC St',
        city: 'Arlington',
        state: 'TX',
        postalCode: '75201',
        startDate: '2001-01-01',
        country: 'USA'
      }
    ];

    const res = addEndDateToResidences(residences);

    expect(res[0].startDate).toBe('2023-03-03');
    expect(res[0].endDate).toBeUndefined();
    expect(res[1].startDate).toBe('2020-02-02');
    expect(res[1].endDate).toBe('2023-03-03');
    expect(res[2].startDate).toBe('2001-01-01');
    expect(res[2].endDate).toBe('2020-02-02');
  });

  it('Should do no work when no past residences', () => {
    const residences = [
      {
        type: 'current',
        address1: '789 Main St',
        city: 'Carrollton',
        state: 'TX',
        postalCode: '75201',
        startDate: '2000-04-04',
        country: 'USA'
      }
    ];

    const res = addEndDateToResidences(residences);

    expect(res[0].startDate).toBe('2000-04-04');
    expect(res[0].endDate).toBeUndefined();
  });
});
