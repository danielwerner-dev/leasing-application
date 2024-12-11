import * as pdf from '$lib/pdf/generate-pdf';
import * as templates from '$lib/pdf/templates';
import generator from 'html-pdf';
import fs from 'fs';
import path from 'path';

jest.mock('html-pdf', () => {
  return {
    create: jest.fn().mockImplementation(() => {
      return {
        toBuffer: jest.fn()
      };
    })
  };
});

jest.mock('fs', () => {
  return {
    readFileSync: jest.fn()
  };
});

jest.mock('path', () => {
  return {
    resolve: jest.fn()
  };
});

jest.mock('$lib/pdf/templates', () => {
  return {
    fillTemplateValues: jest.fn()
  };
});

describe('Generate pdf tests', () => {
  describe('geenerateApplicationPdf', () => {
    let application: any;
    beforeEach(() => {
      application = 'application';

      jest.spyOn(fs, 'readFileSync').mockReturnValue('template');
      jest.spyOn(path, 'resolve').mockReturnValue('path');
      jest.spyOn(templates, 'fillTemplateValues').mockReturnValue('html');
      jest.spyOn(pdf, 'generatePdf').mockImplementation(jest.fn());
    });

    it('calls generatePdf on success', async () => {
      await pdf.generateApplicationPdf(application);

      expect(fs.readFileSync).toHaveBeenCalledWith('path', 'utf8');
      expect(templates.fillTemplateValues).toHaveBeenCalledWith(
        'template',
        application
      );
      expect(pdf.generatePdf).toHaveBeenCalledWith('html');
    });
  });

  describe('generatePdf', () => {
    let html: any;
    beforeEach(() => {
      html = 'html';

      jest.spyOn(generator, 'create').mockReturnValue({
        toBuffer: jest
          .fn()
          .mockImplementation((callback) =>
            callback(false, { toString: jest.fn().mockReturnValue('success') })
          )
      } as any);
    });

    it('calls create and toBuffer on success', async () => {
      await expect(pdf.generatePdf(html)).resolves.toEqual('success');
    });

    it('rejects buffer promise on error', async () => {
      jest.spyOn(generator, 'create').mockReturnValue({
        toBuffer: jest
          .fn()
          .mockImplementation((callback) =>
            callback(true, { toString: jest.fn() })
          )
      } as any);

      await expect(pdf.generatePdf(html)).rejects.toEqual(true);
    });
  });
});
