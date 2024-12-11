export function employmentMock() {
  return {
    employmentStatus: 'other',
    monthlyGrossIncome: '100',
    employment: {
      employer: '',
      phone: '',
      jobTitle: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipcode: '',
      isInternational: false
    },
    additionalIncome: [],
    activeMilitary: false
  };
}

export function incomeMock() {
  return {
    source: 'SportBets',
    monthlyIncome: '100.50',
    id: '1234-1234'
  };
}

export function contextMock() {
  return {
    market: 'miami-fl'
  };
}
