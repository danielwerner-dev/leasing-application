export const maskPiiInfo = (value?: string, digitsToDisplay = 4) => {
  if (!value?.length) {
    return '-';
  }

  if (value.length <= digitsToDisplay) {
    return value;
  }

  const maskCharCount = value.length - digitsToDisplay;
  const masked = '*'.repeat(maskCharCount);
  const toShow = value.substring(value.length - digitsToDisplay);

  return masked + toShow;
};
