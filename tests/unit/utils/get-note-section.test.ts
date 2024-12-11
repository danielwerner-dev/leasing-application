import { getYardiNotes } from '$lib/utils/get-notes-section';
import { applicationFixture } from '$fixtures';

describe('Get Yardi Notes', () => {
  let application: any;

  beforeEach(() => {
    application = applicationFixture();
  });
  it('should build notes with type of id different than SSN', () => {
    const expectedValue = `Marital Status: single,
Preferred Method of Contact: Cel#,
Identification: EIN: *****6789,
Active Military: Applicant isn’t an active military`;
    const res = getYardiNotes(application);
    expect(res).toEqual(expectedValue);
  });

  it('should build notes with type of id different than SSN and active military true', () => {
    application.formData.personalDetails.idDocument.type = 'ein';
    application.formData.general.phone.type = 'home';
    application.formData.employment.activeMilitary = true;

    const expectedValue = `Marital Status: single,
Preferred Method of Contact: Tel# - Home,
Identification: EIN: *****6789,
Active Military: Applicant is currently an active military`;
    const res = getYardiNotes(application);
    expect(res).toEqual(expectedValue);
  });
  it('should build notes with for applicant without SSN or EIN', () => {
    application.formData.personalDetails.idDocument.type = 'neither';
    application.formData.general.phone.type = 'home';
    application.formData.employment.activeMilitary = true;

    const expectedValue = `Marital Status: single,
Preferred Method of Contact: Tel# - Home,
Identification: Applicant doesn’t have EIN or SSN,
Active Military: Applicant is currently an active military`;
    const res = getYardiNotes(application);
    expect(res).toEqual(expectedValue);
  });
  it('should build notes with for applicant with SSN', () => {
    application.formData.personalDetails.idDocument.type = 'ssn';
    application.formData.general.phone.type = 'home';
    application.formData.employment.activeMilitary = true;

    const expectedValue = `Marital Status: single,
Preferred Method of Contact: Tel# - Home,
Identification: ,
Active Military: Applicant is currently an active military`;
    const res = getYardiNotes(application);
    expect(res).toEqual(expectedValue);
  });
});
