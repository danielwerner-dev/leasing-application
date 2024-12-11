import * as service from '$lib/services/GetApplicationSummary';
import * as pdf from '$lib/pdf/generate-pdf';
import { applicationFixture } from '$fixtures';

jest.mock('$lib/pdf/generate-pdf', () => {
  return {
    generateApplicationPdf: jest.fn()
  };
});

describe('Get Application Summary Service', () => {
  describe('getApplicationPDFService', () => {
    let application;
    beforeEach(() => {
      jest.spyOn(pdf, 'generateApplicationPdf').mockResolvedValue('success');

      application = applicationFixture();
    });

    it('calls pdf.generateApplciationPdf', async () => {
      const res = await service.getApplicationPDFService(application);

      expect(res).toEqual('success');
      expect(pdf.generateApplicationPdf).toHaveBeenCalledWith(application);
    });
  });
});
