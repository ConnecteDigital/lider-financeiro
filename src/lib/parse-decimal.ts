/** Parse a user-typed decimal string (supports both comma and dot) to a number */
export const p = (v: string | number): number =>
  parseFloat(String(v).replace(',', '.')) || 0
