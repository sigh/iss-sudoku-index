// Title: Buplhuset
// Author: Holzanatom
// Video: https://www.youtube.com/watch?v=axjYp6BHPAM
// Source: https://app.crackingthecryptic.com/mmMfqfhJnF

// Standard 6x6 Sudoku with the drawn 2x3 regions. The thermometer rises from
// its grey bulb at R5C4. Each listed cage is all-different. Its unlabelled
// total is prime; equally sized cages share a total and differently sized
// cages have distinct totals. R5C4 is the bulb, so it is counted twice in the
// six-cell cage. The signs point towards the smaller digit.
const twoCellCages = [
  ['R1C2', 'R1C3'],
  ['R6C1', 'R6C2'],
];
const threeCellCages = [
  ['R1C4', 'R1C5', 'R2C5'],
  ['R2C6', 'R3C5', 'R3C6'],
];
const sixCellCage = ['R3C4', 'R4C4', 'R4C5', 'R4C6', 'R5C3', 'R5C4'];

// The drawn cage sizes bound their possible prime totals. Each branch chooses
// one distinct prime for each cage size, while applying that choice to both
// cages of a repeated size.
const twoCellPrimes = [3, 5, 7, 11];
const threeCellPrimes = [7, 11, 13];
const cageTotals = new Or(
  twoCellPrimes.flatMap(twoTotal => threeCellPrimes
    .filter(threeTotal => threeTotal !== twoTotal)
    .map(threeTotal => new And([
      ...twoCellCages.map(cells => new Sum(twoTotal, ...cells)),
      ...threeCellCages.map(cells => new Sum(threeTotal, ...cells)),
      new Sum(23, ...sixCellCage, 'R5C4'),
    ])))
);

return [
  new Shape('6x6'),
  new Thermo('R5C4', 'R4C4', 'R3C4', 'R2C4', 'R1C4'),
  new GreaterThan('R1C5', 'R1C6'),
  new GreaterThan('R3C3', 'R3C2'),
  ...twoCellCages.map(cells => new AllDifferent(...cells)),
  ...threeCellCages.map(cells => new AllDifferent(...cells)),
  new AllDifferent(...sixCellCage),
  cageTotals,
];
