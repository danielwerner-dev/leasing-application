export function mockResidence() {
  return {
    type: 'current',
    id: '1234-1234',
    isInternational: false,
    addressLine1: '12 Main St',
    addressLine2: '',
    city: 'Dallas',
    state: 'TX',
    zipcode: '11111',
    startDate: '09/19/2015'
  };
}

export function mockResidenceSection() {
  return {
    currentResidence: mockResidence(),
    pastResidences: []
  };
}
