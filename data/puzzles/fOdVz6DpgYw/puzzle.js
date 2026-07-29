// Title: Assembly
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=fOdVz6DpgYw
// Source: https://app.crackingthecryptic.com/magjthb2bw

// Normal Sudoku rules apply. A cage's weighted digit sum has its numeric
// label, or the parity named by an Odd/Even label. Digits do not repeat within
// a cage. The drawn full, half, and quarter pieces are recorded below in
// quarter units, so every sum can use integer coefficients.
const cages = [
  ['2',    [['R1C2', 4], ['R2C2', 1]]],
  ['8',    [['R2C1', 4], ['R2C2', 1]]],
  ['4',    [['R2C2', 1], ['R2C3', 4]]],
  ['6',    [['R2C2', 1], ['R3C2', 4]]],
  ['Even', [['R2C4', 2], ['R2C5', 4], ['R2C6', 2], ['R3C5', 1]]],
  ['14',   [['R1C8', 1], ['R2C7', 1], ['R2C8', 4], ['R2C9', 1], ['R3C8', 1]]],
  ['8',    [['R3C6', 2], ['R3C7', 4], ['R4C7', 2]]],
  ['10',   [['R4C4', 4], ['R5C4', 2]]],
  ['5',    [['R4C5', 2], ['R4C6', 4]]],
  ['Odd',  [['R4C2', 2], ['R5C2', 4], ['R5C3', 1], ['R6C2', 2]]],
  ['Odd',  [['R4C8', 2], ['R5C7', 1], ['R5C8', 4], ['R6C8', 2]]],
  ['11',   [['R6C4', 4], ['R6C5', 2]]],
  ['8',    [['R5C6', 2], ['R6C6', 4]]],
  ['6',    [['R7C2', 1], ['R8C1', 1], ['R8C2', 4], ['R8C3', 1], ['R9C2', 1]]],
  ['Odd',  [['R7C5', 1], ['R8C4', 2], ['R8C5', 4], ['R8C6', 2]]],
  ['10',   [['R8C7', 4], ['R8C8', 1]]],
  ['9',    [['R7C8', 4], ['R8C8', 1]]],
  ['7',    [['R8C8', 1], ['R8C9', 4]]],
  ['8',    [['R8C8', 1], ['R9C8', 4]]],
];

function sumConstraint(total, weightedCells) {
  const terms = weightedCells.map(([cell, coefficient]) =>
    coefficient === 1 ? cell : [cell, coefficient]
  );
  return new Sum(4 * total, ...terms);
}

function cageSum(label, weightedCells) {
  if (label !== 'Odd' && label !== 'Even') {
    return sumConstraint(Number(label), weightedCells);
  }

  const parity = label === 'Odd' ? 1 : 0;
  const maxTotal = Math.floor(
    9 * weightedCells.reduce((sum, [, coefficient]) => sum + coefficient, 0) / 4
  );
  const alternatives = Array.from({length: maxTotal}, (_, index) => index + 1)
    .filter(total => total % 2 === parity)
    .map(total => sumConstraint(total, weightedCells));
  return new Or(alternatives);
}

return [
  new Shape('9x9'),
  ...cages.map(([label, weightedCells]) => cageSum(label, weightedCells)),
  ...cages.map(([, weightedCells]) =>
    new AllDifferent(...weightedCells.map(([cell]) => cell))
  ),
];
