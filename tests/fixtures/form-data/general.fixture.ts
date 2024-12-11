import dayjs from 'dayjs';

const DEFAULT_LEASE_TERM = '12';
const DEFAULT_START_LEASE_DARTE = dayjs();
const DEFAULT_AVAILABLE_FROM = DEFAULT_START_LEASE_DARTE.subtract(1, 'day');
const DEFAULT_AVAILABLE_TO = DEFAULT_AVAILABLE_FROM.add(14, 'days');

export const generalContext = () => {
  return {
    availableFrom: DEFAULT_AVAILABLE_FROM.format('MM/DD/YYYY'),
    availableTo: DEFAULT_AVAILABLE_TO.format('MM/DD/YYYY'),
    market: 'los-angeles-ca'
  };
};

export const generalMock = () => {
  return {
    applicationType: 'personal',
    title: '',
    firstName: 'John',
    middleName: '',
    lastName: 'Snow',
    maritalStatus: '',
    phone: {
      digits: '5555555555',
      type: 'home'
    },
    methodOfContact: '',
    leaseStartDate: DEFAULT_START_LEASE_DARTE.format('MM/DD/YYYY'),
    leaseEndDate: DEFAULT_START_LEASE_DARTE.add(12, 'months').format(
      'MM/DD/YYYY'
    ),
    leaseTerm: DEFAULT_LEASE_TERM
  };
};
