export function getOptions() {
  return {
    context: {
      market: 'not-florida'
    }
  };
}

export function animalMock() {
  return {
    animalType: 'Dog',
    breed: 'Beagle',
    weight: '60',
    name: 'Boris',
    serviceAnimal: 'no',
    id: '1234-1234'
  };
}

export function dependentMock() {
  return {
    firstName: 'John',
    lastName: 'Snow',
    dateOfBirth: '09/01/2022',
    id: '1234-1234'
  };
}

export function vehicleMock() {
  return {
    make: 'Volkswagen',
    model: 'Beetle',
    color: 'L87 Pearl white',
    license: 'OFP857',
    id: '1234-1234'
  };
}

export function personalDetailsMock() {
  return {
    dateOfBirth: '01/01/1970',
    idDocument: {
      type: 'neither',
      number: ''
    },
    driversLicense: {
      number: '',
      state: ''
    },
    emergencyContact: {
      name: 'Jane',
      relationship: 'Friend',
      phone: {
        digits: '5555555555',
        type: 'cell'
      }
    },
    animals: [],
    dependents: [],
    vehicles: [],
    backgroundInfo: false,
    acceptedTerms: true,
    reviewedProvidedInfo: true
  };
}
