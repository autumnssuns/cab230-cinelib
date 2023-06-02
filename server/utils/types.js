function toNumber(str) {
  return str ? +str : str;
}

function toDate(str) {
  if (str) {
    const parts = str.split("-");
    if (parts.length === 3) {
      const year = parts[0].length === 4 ? +parts[0] : undefined;
      const month = parts[1].length === 2 ? +parts[1] : undefined;
      const day = parts[2].length === 2 ? +parts[2] : undefined;
      const isValidYear = year >= 0;
      const isValidMonth = month >= 1 && month <= 12;
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      let isValidDay = day >= 1;
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
      console.log(year, month, day, isValidYear, isValidMonth, isValidDay);
      if (isValidYear && isValidMonth && isValidDay) return new Date(year, month - 1, day);
    }
  }
  throw {
    code: 400,
    message: "Invalid input: dob must be a real date in format YYYY-MM-DD.",
  };
}

module.exports = {
  toNumber,
  toDate
}