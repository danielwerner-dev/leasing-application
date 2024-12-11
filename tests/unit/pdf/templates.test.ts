import { applicationFixture } from '$fixtures';
import * as template from '$lib/pdf/templates';

describe('Templates', () => {
  describe('fillTemplateValues', () => {
    let htmlTemplate: any;
    let application: any;

    beforeEach(() => {
      application = applicationFixture();
      htmlTemplate = '<html><body>${applicationId}</body></html>';

      jest.spyOn(template, 'mapAdditionalIncome').mockImplementation(jest.fn());
      jest.spyOn(template, 'mapAnimal').mockImplementation(jest.fn());
      jest.spyOn(template, 'mapDependent').mockImplementation(jest.fn());
      jest.spyOn(template, 'mapCoapplicant').mockImplementation(jest.fn());
      jest.spyOn(template, 'mapPastResidence').mockImplementation(jest.fn());
      jest.spyOn(template, 'mapVehicle').mockImplementation(jest.fn());
      jest.spyOn(template, 'hasBackgroundInfo').mockReturnValue(true);
      jest
        .spyOn(template, 'personalDetailsIdType')
        .mockImplementation(jest.fn());
    });

    it('parses data for real application with hasBackGroundInfo as true', () => {
      expect(template.fillTemplateValues(htmlTemplate, application)).toEqual(
        '<html><body>p151515</body></html>'
      );
    });

    it('parses data for real application with hasBackGroundInfo as false', () => {
      jest.spyOn(template, 'hasBackgroundInfo').mockReturnValue(false);
      expect(template.fillTemplateValues(htmlTemplate, application)).toEqual(
        '<html><body>p151515</body></html>'
      );
    });
    it('uses fallback values', () => {
      jest.spyOn(template, 'hasBackgroundInfo').mockReturnValue(true);
      application = {
        audit: { updatedAt: null, submittedAt: null, submittedByIp: null },
        property: {},
        integrationData: {},
        formData: {
          general: {
            title: 'Mr.',
            audit: {
              updatedAt: null,
              updatedByIp: null
            }
          },
          personalDetails: {
            animals: [1, 2, 3],
            vehicles: [1, 2, 3],
            dependents: [1, 2, 3],
            bankruptcy: true,
            pendingCharges: true,
            evicted: true,
            felony: true,
            backgroundInfo: true,
            audit: {
              updatedAt: null,
              updatedByIp: null
            }
          },
          residence: {
            currentResidence: {
              isInternational: true,
              startDate: null
            },
            pastResidences: [1, 2, 3],
            audit: {
              updatedAt: null,
              updatedByIp: null
            }
          },
          employment: {
            employment: {
              isInternational: true
            },
            audit: {
              updatedAt: null,
              updatedByIp: null
            },
            metadata: { config: { isCalifornia: true } },
            additionalIncome: ['1', '2', '3'],
            activeMilitary: true
          },
          coapplicants: {
            coapplicants: [1, 2, 3],
            audit: {
              updatedAt: null,
              updatedByIp: null
            }
          }
        }
      };

      expect(template.fillTemplateValues(htmlTemplate, application)).toEqual(
        '<html><body>-</body></html>'
      );
    });
  });

  describe('hasBackgroundInfo', () => {
    it('should return the fallback value ("-") if no given values', async () => {
      const hasBackGroundInfo = template.hasBackgroundInfo({
        backgroundInfo: false,
        bankruptcy: false,
        evicted: false,
        felony: false,
        pendingCharges: false
      });
      expect(hasBackGroundInfo).toBe(false);
    });

    it('should return the fallback value ("-") with mixed given values', async () => {
      const hasBackGroundInfo = template.hasBackgroundInfo({
        backgroundInfo: true,
        bankruptcy: false,
        evicted: false,
        felony: false,
        pendingCharges: false
      });
      expect(hasBackGroundInfo).toBe(false);
    });

    it('should return true with correct given values', async () => {
      const hasBackGroundInfo = template.hasBackgroundInfo({
        backgroundInfo: true,
        bankruptcy: true,
        evicted: true,
        felony: true,
        pendingCharges: true
      });
      expect(hasBackGroundInfo).toBe(true);
    });

    it('should return true with correct given values', async () => {
      const hasBackGroundInfo = template.hasBackgroundInfo({
        backgroundInfo: true,
        bankruptcy: true,
        evicted: true,
        felony: true,
        pendingCharges: true
      });
      expect(hasBackGroundInfo).toBe(true);
    });

    it('should return the fallback value ("-") with no given object', async () => {
      const hasBackGroundInfo = template.hasBackgroundInfo({});
      expect(hasBackGroundInfo).toBe(false);
    });
  });

  describe('mapDependent', () => {
    it('should return the fallback value ("-") if no given values', async () => {
      const dependent = template.mapDependent({});
      expect(dependent).toBeInstanceOf(Object);
      expect(dependent).toHaveProperty(['firstName'], '-');
      expect(dependent).toHaveProperty(['lastName'], '-');
      expect(dependent).toHaveProperty(['dateOfBirth'], '-');
    });
    it('should return the given object mapped', async () => {
      const dependent = template.mapDependent({
        firstName: 'Joss',
        lastName: 'Stone',
        dateOfBirth: '09/15/90'
      });
      expect(dependent).toBeInstanceOf(Object);
      expect(dependent).toHaveProperty(['firstName'], 'Joss');
      expect(dependent).toHaveProperty(['lastName'], 'Stone');
      expect(dependent).toHaveProperty(['dateOfBirth'], '09/15/90');
    });
  });

  describe('mapVehicle', () => {
    it('should return the fallback value ("-") if no given values', async () => {
      const vehicle = template.mapVehicle({});

      expect(vehicle).toBeInstanceOf(Object);
      expect(vehicle).toHaveProperty(['make'], '-');
      expect(vehicle).toHaveProperty(['model'], '-');
      expect(vehicle).toHaveProperty(['color'], '-');
      expect(vehicle).toHaveProperty(['license'], '-');
    });

    it('should return the given object mapped', async () => {
      const vehicle = template.mapVehicle({
        make: 'Ford',
        model: 'Edge',
        color: 'Black',
        license: '123ABCD'
      });

      expect(vehicle).toBeInstanceOf(Object);
      expect(vehicle).toHaveProperty(['make'], 'Ford');
      expect(vehicle).toHaveProperty(['model'], 'Edge');
      expect(vehicle).toHaveProperty(['color'], 'Black');
      expect(vehicle).toHaveProperty(['license'], '123ABCD');
    });
  });

  describe('mapAnimal', () => {
    it('should return the fallback value ("-") if no given values', async () => {
      const animal = template.mapAnimal({});

      expect(animal).toBeInstanceOf(Object);
      expect(animal).toHaveProperty(['breed'], '-');
      expect(animal).toHaveProperty(['weight'], '-');
      expect(animal).toHaveProperty(['name'], '-');
      expect(animal).toHaveProperty(['animalType'], '-');
      expect(animal).toHaveProperty(['serviceAnimal'], 'No');
    });

    it('should return the given object mapped', async () => {
      const animal = template.mapAnimal({
        breed: 'Golden',
        weight: '60',
        name: 'Lambreca',
        animalType: 'Dog',
        serviceAnimal: 'yes'
      });

      expect(animal).toBeInstanceOf(Object);
      expect(animal).toHaveProperty(['breed'], 'Golden');
      expect(animal).toHaveProperty(['weight'], '60');
      expect(animal).toHaveProperty(['name'], 'Lambreca');
      expect(animal).toHaveProperty(['animalType'], 'Dog');
      expect(animal).toHaveProperty(['serviceAnimal'], 'Yes');
    });
  });

  describe('mapAdditionalIncome', () => {
    it('should return the fallback value ("-") if no given values', async () => {
      const additionalIncome = template.mapAdditionalIncome({});

      expect(additionalIncome).toBeInstanceOf(Object);
      expect(additionalIncome).toHaveProperty(['monthlyIncome'], '-');
      expect(additionalIncome).toHaveProperty(['source'], '-');
    });

    it('should return the given object mapped', async () => {
      const additionalIncome = template.mapAdditionalIncome({
        monthlyIncome: '2000',
        source: 'retirement'
      });

      expect(additionalIncome).toBeInstanceOf(Object);
      expect(additionalIncome).toHaveProperty(['monthlyIncome'], '2000');
      expect(additionalIncome).toHaveProperty(['source'], 'retirement');
    });
  });

  describe('mapCoapplicant', () => {
    it('should return the fallback value ("-") if no given values', async () => {
      const coapplicant = template.mapCoapplicant({});

      expect(coapplicant).toBeInstanceOf(Object);
      expect(coapplicant).toHaveProperty(['firstName'], '-');
      expect(coapplicant).toHaveProperty(['lastName'], '-');
      expect(coapplicant).toHaveProperty(['type'], '-');
      expect(coapplicant).toHaveProperty(['email'], '-');
    });

    it('should return the given object mapped', async () => {
      const coapplicant = template.mapCoapplicant({
        firstName: 'Lauryn',
        lastName: 'Hill',
        type: 'wife',
        email: 'lauryn@hill.com'
      });

      expect(coapplicant).toBeInstanceOf(Object);
      expect(coapplicant).toHaveProperty(['firstName'], 'Lauryn');
      expect(coapplicant).toHaveProperty(['lastName'], 'Hill');
      expect(coapplicant).toHaveProperty(['type'], 'wife');
      expect(coapplicant).toHaveProperty(['email'], 'lauryn@hill.com');
    });
  });

  describe('mapPastResidence', () => {
    it('should return the fallback value ("-") if no given values', async () => {
      const pastResidence = template.mapPastResidence({});

      expect(pastResidence).toBeInstanceOf(Object);
      expect(pastResidence).toHaveProperty(['zipcode'], '-');
      expect(pastResidence).toHaveProperty(['city'], '-');
      expect(pastResidence).toHaveProperty(['addressLine1'], '-');
      expect(pastResidence).toHaveProperty(['addressLine2'], '-');
      expect(pastResidence).toHaveProperty(['state'], '-');
      expect(pastResidence).toHaveProperty(['type'], '-');
      expect(pastResidence).toHaveProperty(['isInUSA'], 'Yes');
      expect(pastResidence).toHaveProperty(['startDate'], '-');
    });

    it('should return the given object mapped', async () => {
      const pastResidence = template.mapPastResidence({
        zipcode: '60707',
        city: 'Chicago',
        addressLine1: '1509 main street',
        addressLine2: '',
        state: 'IL',
        type: 'current',
        isInternational: true,
        startDate: '09/01/2021'
      });

      expect(pastResidence).toBeInstanceOf(Object);
      expect(pastResidence).toHaveProperty(['zipcode'], '60707');
      expect(pastResidence).toHaveProperty(['city'], 'Chicago');
      expect(pastResidence).toHaveProperty(
        ['addressLine1'],
        '1509 main street'
      );
      expect(pastResidence).toHaveProperty(['addressLine2'], '-');
      expect(pastResidence).toHaveProperty(['state'], 'IL');
      expect(pastResidence).toHaveProperty(['type'], 'current');
      expect(pastResidence).toHaveProperty(['isInUSA'], 'No');
      expect(pastResidence).toHaveProperty(['startDate'], '09/01/2021');
    });
  });

  describe('personalDetailsIdType', () => {
    it('parses data for real application without SSN or EIN', () => {
      const personalDetails: any = {
        idDocument: {
          type: 'neither'
        }
      };
      expect(template.personalDetailsIdType(personalDetails)).toEqual('-');
    });
    it('parses data for real application without SSN or EIN', () => {
      const personalDetails: any = {
        idDocument: {
          type: 'ssn'
        }
      };
      expect(template.personalDetailsIdType(personalDetails)).toEqual(
        'SSN number'
      );
    });
    it('parses data for real application without SSN or EIN', () => {
      const personalDetails: any = {
        idDocument: {
          type: 'ein'
        }
      };
      expect(template.personalDetailsIdType(personalDetails)).toEqual(
        'EIN number'
      );
    });
  });
});
