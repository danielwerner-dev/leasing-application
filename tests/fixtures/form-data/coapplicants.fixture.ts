export function mockCoapplicant() {
  return {
    firstName: 'John',
    lastName: 'Snow',
    type: 'Roommate',
    email: 'jsnow@westeros.com',
    id: '1234-1234'
  };
}
export function mockCoapplicants() {
  return {
    coapplicants: [],
    confirmedApplicationInfo: true
  };
}

export function mockContext() {
  return {
    applicationType: 'primary'
  };
}
