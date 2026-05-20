export const toNumber = (value) => Number(value || 0);

export const round2 = (value) => Number(toNumber(value).toFixed(2));
