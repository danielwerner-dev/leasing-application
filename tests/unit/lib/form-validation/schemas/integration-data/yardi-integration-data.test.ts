import * as schema from '$lib/form-validation/schemas/integration-data/yardi-integration-data.schema';

describe('Yardi Integration Data Schema', () => {
  it('Should fail when undefined', async () => {
    await expect(() =>
      schema.yardiCompleteInfoSchema.validateSync(undefined)
    ).toThrow();
  });

  it('Should validate a correct payload', () => {
    const payload = {
      applicantId: '123',
      guestcardId: '456',
      paymentInfo: {
        paymentType: 'CREDIT',
        payerId: '101112'
      }
    };

    const res = schema.yardiCompleteInfoSchema.validateSync(payload);

    expect(res).toEqual(payload);
  });
});
