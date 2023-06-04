/**
 * Converts a string to a number. If the string is empty, returns the string.
 * @param str The string to convert
 * @returns The number, or the string if it is empty
 */
function toNumber(str) {
  return str ? +str : str;
}

/**
 * Converts a string to a date. If the string is empty or the date is invalid, 
 * throws an error.
 * @param str The string to convert
 * @returns The date
 */
function toDate(str) {
  if (str) {
    const parts = str.split("-");
    if (parts.length === 3) {
      // Convert the year, month, and day to numbers
      // ensuring the YYYY-MM-DD format
      const year = parts[0].length === 4 ? +parts[0] : undefined;
      const month = parts[1].length === 2 ? +parts[1] : undefined;
      const day = parts[2].length === 2 ? +parts[2] : undefined;
      // Validate the year, month, and day
      const isValidYear = year >= 0;
      const isValidMonth = month >= 1 && month <= 12;
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      let isValidDay = day >= 1;
      // Validate the day based on the month
      switch (month) {
        case 2:
          isValidDay &= day <= (isLeapYear ? 29 : 28);
          break;
        case 1: case 3: case 5: case 7: case 8: case 10: case 12:
          isValidDay &= day <= 31;
          break;
        case 4: case 6: case 9: case 11:
          isValidDay &= day <= 30;
          break;
        default:
          isValidDay = false;
          break;
      }
      // If the year, month, and day are valid, return the date
      // Note that the month is 0-indexed
      if (isValidYear && isValidMonth && isValidDay) 
        return new Date(year, month - 1, day);
    }
  }
  throw new Error("Invalid date format. Date must be in the format YYYY-MM-DD.");
}

module.exports = {
  toNumber,
  toDate
}