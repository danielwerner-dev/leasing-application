import { methodOfContact } from '$lib/utils/method-of-contact';

describe('Method of Contact for Yardi Notes', () => {
  it('should return e-mail string when method of contact is email', () => {
    const method = 'email';
    const phoneType = 'landline';

    const res = methodOfContact(method, phoneType);

    expect(res).toEqual('Email');
  });
  it('should return "Tel# - Home" when method of contact is phone and phone type is landline', () => {
    const method = 'phone';
    const phoneType = 'home';

    const res = methodOfContact(method, phoneType);
    expect(res).toEqual('Tel# - Home');
  });
  it('should return "Cel#" when method of contact is phone and phone type is mobile', () => {
    const method = 'phone';
    const phoneType = 'cell';

    const res = methodOfContact(method, phoneType);
    expect(res).toEqual('Cel#');
  });
});
