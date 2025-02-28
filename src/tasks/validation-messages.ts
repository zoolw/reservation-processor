export const VALIDATION_MESSAGES = {
  RESERVATION_ID_REQUIRED: 'ID rezerwacji jest wymagane',
  RESERVATION_ID_NUMBER: 'ID rezerwacji musi być liczbą',
  GUEST_NAME_REQUIRED: 'Imię i nazwisko gościa jest wymagane',
  GUEST_NAME_STRING: 'Imię i nazwisko musi być tekstem',
  STATUS_REQUIRED: 'Status rezerwacji jest wymagany',
  STATUS_INVALID: 'Niepoprawny status rezerwacji',
  CHECK_IN_DATE_REQUIRED: 'Data zameldowania jest wymagana',
  CHECK_IN_DATE_INVALID: 'Niepoprawny format daty zameldowania',
  CHECK_OUT_DATE_REQUIRED: 'Data wymeldowania jest wymagana',
  CHECK_OUT_DATE_INVALID: 'Niepoprawny format daty wymeldowania',
  FILE_REQUIRED: 'Plik jest wymagany',
};

export const SUGGESTIONS = {
  [VALIDATION_MESSAGES.GUEST_NAME_REQUIRED]:
    'Proszę uzupełnić imię i nazwisko gościa.',
  [VALIDATION_MESSAGES.STATUS_INVALID]: 'Proszę sprawdzić status rezerwacji.',
  [VALIDATION_MESSAGES.CHECK_IN_DATE_INVALID]:
    'Proszę poprawić format daty zameldowania i upewnić się, że data jest wypełniona.',
  [VALIDATION_MESSAGES.CHECK_OUT_DATE_INVALID]:
    'Proszę poprawić format daty wymeldowania i upewnić się, że data jest wypełniona.',
  [VALIDATION_MESSAGES.STATUS_REQUIRED]: 'Proszę podać status rezerwacji.',
  DEFAULT: 'Proszę sprawdzić poprawność danych.',
};
