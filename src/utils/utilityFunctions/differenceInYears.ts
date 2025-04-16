const differenceInYears = (date1: Date, date2: Date) => {
  const year1 = date1.getFullYear();
  const year2 = date2.getFullYear();

  return Math.abs(year2 - year1);
};

export default differenceInYears;
