import * as utils from '$lib/utils/application-permissions';

describe('Application permissions utility', () => {
  describe('getApplicationPermissions', () => {
    let applicationType: any;
    let applicationStatus: any;
    let promoted: any;
    describe('for `primary` applicant non-promoted', () => {
      beforeEach(() => {
        applicationType = 'primary';
        promoted = false;
      });

      describe('in `draft` status', () => {
        beforeEach(() => {
          applicationStatus = 'draft';
        });

        it('has permission to edit or cancel application', () => {
          const res = utils.getApplicationPermissions({
            applicationStatus,
            applicationType,
            promoted
          });

          expect(res).toEqual({
            canEditApplication: true,
            canDeleteApplication: true
          });
        });
      });

      describe('in `pending` status', () => {
        beforeEach(() => {
          applicationStatus = 'pending';
        });

        it('has permission to manage applicants, add documents, and download application', () => {
          const res = utils.getApplicationPermissions({
            applicationStatus,
            applicationType,
            promoted
          });

          expect(res).toEqual({
            canManageApplicants: true,
            canAddDocuments: true,
            canDownloadPDF: true
          });
        });
      });

      describe('in `approved` status', () => {
        beforeEach(() => {
          applicationStatus = 'approved';
        });

        it('has permission to make payments, add documents, and download application', () => {
          const res = utils.getApplicationPermissions({
            applicationStatus,
            applicationType,
            promoted
          });

          expect(res).toEqual({
            canMakePayments: true,
            canAddDocuments: true,
            canDownloadPDF: true
          });
        });
      });

      describe('in `denied` status', () => {
        beforeEach(() => {
          applicationStatus = 'denied';
        });

        it('has permission to add documents, and download application', () => {
          const res = utils.getApplicationPermissions({
            applicationStatus,
            applicationType,
            promoted
          });

          expect(res).toEqual({
            canAddDocuments: true,
            canDownloadPDF: true
          });
        });
      });

      describe('in `canceled` status', () => {
        beforeEach(() => {
          applicationStatus = 'canceled';
        });

        it('has permission to make payments, add documents, and download application', () => {
          const res = utils.getApplicationPermissions({
            applicationStatus,
            applicationType,
            promoted
          });

          expect(res).toEqual({
            canMakePayments: true,
            canAddDocuments: true,
            canDownloadPDF: true
          });
        });
      });
    });

    describe('for `coapplicant` applicant', () => {
      beforeEach(() => {
        applicationType = 'coapplicant';
        promoted = false;
      });

      describe('in `draft` status', () => {
        beforeEach(() => {
          applicationStatus = 'draft';
        });

        it('has permission to edit application', () => {
          const res = utils.getApplicationPermissions({
            applicationStatus,
            applicationType,
            promoted
          });

          expect(res).toEqual({
            canEditApplication: true
          });
        });
      });

      describe('in `pending` status', () => {
        beforeEach(() => {
          applicationStatus = 'pending';
        });

        it('has permission to add documents, and download application', () => {
          const res = utils.getApplicationPermissions({
            applicationStatus,
            applicationType,
            promoted
          });

          expect(res).toEqual({
            canAddDocuments: true,
            canDownloadPDF: true
          });
        });
      });

      describe('in `approved` status', () => {
        beforeEach(() => {
          applicationStatus = 'approved';
        });

        it('has permission to make payments, add documents, and download application', () => {
          const res = utils.getApplicationPermissions({
            applicationStatus,
            applicationType,
            promoted
          });

          expect(res).toEqual({
            canMakePayments: true,
            canAddDocuments: true,
            canDownloadPDF: true
          });
        });
      });

      describe('in `denied` status', () => {
        beforeEach(() => {
          applicationStatus = 'denied';
        });

        it('has permission to add documents, and download application', () => {
          const res = utils.getApplicationPermissions({
            applicationStatus,
            applicationType,
            promoted
          });

          expect(res).toEqual({
            canAddDocuments: true,
            canDownloadPDF: true
          });
        });
      });

      describe('in `canceled` status', () => {
        beforeEach(() => {
          applicationStatus = 'canceled';
        });

        it('has permission to make payments, add documents, and download application', () => {
          const res = utils.getApplicationPermissions({
            applicationStatus,
            applicationType,
            promoted
          });

          expect(res).toEqual({
            canMakePayments: true,
            canAddDocuments: true,
            canDownloadPDF: true
          });
        });
      });
    });

    describe('for `primary` applicant promoted', () => {
      beforeEach(() => {
        applicationType = 'primary';
        promoted = true;
      });

      describe('in `draft` status', () => {
        beforeEach(() => {
          applicationStatus = 'draft';
        });

        it('has permission to edit application', () => {
          const res = utils.getApplicationPermissions({
            applicationStatus,
            applicationType,
            promoted
          });

          expect(res).toEqual({
            canEditApplication: true
          });
        });
      });

      describe('in `pending` status', () => {
        beforeEach(() => {
          applicationStatus = 'pending';
        });

        it('has permission to manage applicants, add documents, and download application', () => {
          const res = utils.getApplicationPermissions({
            applicationStatus,
            applicationType,
            promoted
          });

          expect(res).toEqual({
            canManageApplicants: true,
            canAddDocuments: true,
            canDownloadPDF: true
          });
        });
      });

      describe('in `approved` status', () => {
        beforeEach(() => {
          applicationStatus = 'approved';
        });

        it('has permission to make payments, add documents, and download application', () => {
          const res = utils.getApplicationPermissions({
            applicationStatus,
            applicationType,
            promoted
          });

          expect(res).toEqual({
            canMakePayments: true,
            canAddDocuments: true,
            canDownloadPDF: true
          });
        });
      });

      describe('in `denied` status', () => {
        beforeEach(() => {
          applicationStatus = 'denied';
        });

        it('has permission to add documents, and download application', () => {
          const res = utils.getApplicationPermissions({
            applicationStatus,
            applicationType,
            promoted
          });

          expect(res).toEqual({
            canAddDocuments: true,
            canDownloadPDF: true
          });
        });
      });

      describe('in `canceled` status', () => {
        beforeEach(() => {
          applicationStatus = 'canceled';
        });

        it('has permission to make payments, add documents, and download application', () => {
          const res = utils.getApplicationPermissions({
            applicationStatus,
            applicationType,
            promoted
          });

          expect(res).toEqual({
            canMakePayments: true,
            canAddDocuments: true,
            canDownloadPDF: true
          });
        });
      });
    });
  });
});
