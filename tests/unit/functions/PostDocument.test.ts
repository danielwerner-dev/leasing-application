import * as lambda from '$functions/PostDocument';
import * as service from '$lib/services/CreateDocument';

jest.mock('$lib/services/CreateDocument', () => {
  return {
    createDocumentService: jest.fn()
  };
});

describe('PostDocument lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let application: any;
    let body: any;
    beforeEach(() => {
      application = 'application';
      body = {
        documentType: 'income-proof',
        documentDisplayName: 'document-display-name'
      };
      event = {
        body: JSON.stringify(body)
      };

      jest
        .spyOn(service, 'createDocumentService')
        .mockResolvedValue('results' as any);
    });

    it('returns 200 on success', async () => {
      const res = await lambda.requestHandler(event, application, null as any);

      const expected = {
        statusCode: 200,
        body: JSON.stringify('results'),
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.createDocumentService).toHaveBeenCalledWith(
        application,
        body.documentType,
        body.documentDisplayName
      );
    });

    it('throws if body is missing', async () => {
      event.body = null;
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrow();
    });
  });

  describe('document name validations', () => {
    let event: any;
    let application: any;
    let body: any;
    beforeEach(() => {
      application = 'application';
      body = {
        documentType: 'income-proof',
        documentDisplayName: 'document-display-name.jpg'
      };
      event = {
        body: JSON.stringify(body)
      };

      jest
        .spyOn(service, 'createDocumentService')
        .mockResolvedValue('results' as any);
    });

    it('successfully calls createDocumentService with a valid filename', async () => {
      await lambda.requestHandler(event, application, null as any);
      expect(service.createDocumentService).toHaveBeenCalledWith(
        application,
        body.documentType,
        body.documentDisplayName
      );
    });

    it('successfully calls createDocumentService with a valid filename using hypen/underscore - this-is-valid__.jpg', async () => {
      body = {
        documentType: 'income-proof',
        documentDisplayName: 'this-is-valid__.jpg'
      };
      event = {
        body: JSON.stringify(body)
      };
      await lambda.requestHandler(event, application, null as any);
      expect(service.createDocumentService).toHaveBeenCalledWith(
        application,
        body.documentType,
        body.documentDisplayName
      );
    });

    it('successfully calls createDocumentService with a valid filename using period - this.valid.jpg', async () => {
      body = {
        documentType: 'income-proof',
        documentDisplayName: 'this.valid.jpg'
      };
      event = {
        body: JSON.stringify(body)
      };
      await lambda.requestHandler(event, application, null as any);
      expect(service.createDocumentService).toHaveBeenCalledWith(
        application,
        body.documentType,
        body.documentDisplayName
      );
    });

    it('successfully calls createDocumentService with a valid filename using spaces - this is valid.jpg', async () => {
      body = {
        documentType: 'income-proof',
        documentDisplayName: 'this is valid.jpg'
      };
      event = {
        body: JSON.stringify(body)
      };
      await lambda.requestHandler(event, application, null as any);
      expect(service.createDocumentService).toHaveBeenCalledWith(
        application,
        body.documentType,
        body.documentDisplayName
      );
    });

    it('successfully calls createDocumentService with a valid filename using numbers - th2is3.val1id.jpg', async () => {
      body = {
        documentType: 'income-proof',
        documentDisplayName: 'this.valid.jpg'
      };
      event = {
        body: JSON.stringify(body)
      };
      await lambda.requestHandler(event, application, null as any);
      expect(service.createDocumentService).toHaveBeenCalledWith(
        application,
        body.documentType,
        body.documentDisplayName
      );
    });

    it('successfully calls createDocumentService with a valid png file - this.valid.png', async () => {
      body = {
        documentType: 'income-proof',
        documentDisplayName: 'this.valid.jpg'
      };
      event = {
        body: JSON.stringify(body)
      };
      await lambda.requestHandler(event, application, null as any);
      expect(service.createDocumentService).toHaveBeenCalledWith(
        application,
        body.documentType,
        body.documentDisplayName
      );
    });

    it('successfully calls createDocumentService with a valid filename using special characters only -_.jpg', async () => {
      body = {
        documentType: 'income-proof',
        documentDisplayName: '-_.jpg'
      };
      event = {
        body: JSON.stringify(body)
      };
      await lambda.requestHandler(event, application, null as any);
      expect(service.createDocumentService).toHaveBeenCalledWith(
        application,
        body.documentType,
        body.documentDisplayName
      );
    });

    it('throws createDocumentService with a invalid filename - this-invalid^^%.jpg', async () => {
      body = {
        documentType: 'income-proof',
        documentDisplayName: 'this-invalid^^%.jpg'
      };
      event = {
        body: JSON.stringify(body)
      };
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrowError('Invalid characters');
    });

    it('throws createDocumentService with a invalid filename - this#inv@alid.jpg', async () => {
      body = {
        documentType: 'income-proof',
        documentDisplayName: 'this#inv@alid.jpg'
      };
      event = {
        body: JSON.stringify(body)
      };
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrowError('Invalid characters');
    });

    it('throws createDocumentService with a invalid filename - this#inv@ali<>^d.jpg', async () => {
      body = {
        documentType: 'income-proof',
        documentDisplayName: 'this#inv@ali<>^d.jpg'
      };
      event = {
        body: JSON.stringify(body)
      };
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrowError('Invalid characters');
    });

    it('throws createDocumentService with a invalid filename using exclamations - thisisNOTvalid!.jpg', async () => {
      body = {
        documentType: 'income-proof',
        documentDisplayName: 'thisisNOTvalid!.jpg'
      };
      event = {
        body: JSON.stringify(body)
      };
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrowError('Invalid characters');
    });

    it('throws createDocumentService with a invalid filename using hypens - thisis(NO)Tvalid.jpg', async () => {
      body = {
        documentType: 'income-proof',
        documentDisplayName: 'thisis(NO)Tvalid.jpg'
      };
      event = {
        body: JSON.stringify(body)
      };
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrowError('Invalid characters');
    });
    it('throws createDocumentService with a invalid filename using asterisk - thisisnot*valid.jpg', async () => {
      body = {
        documentType: 'income-proof',
        documentDisplayName: 'thisis(NO)Tvalid.jpg'
      };
      event = {
        body: JSON.stringify(body)
      };
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrowError('Invalid characters');
    });
  });
});
