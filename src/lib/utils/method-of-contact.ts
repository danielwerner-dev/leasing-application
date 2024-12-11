export const methodOfContact = (methodOfContact: string, phoneType: string) => {
  if (methodOfContact === 'email') {
    return 'Email';
  }

  return phoneType === 'home' ? 'Tel# - Home' : 'Cel#';
};
