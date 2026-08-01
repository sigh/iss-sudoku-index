// Title: InBetween Snack
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Luz3aQcjLrQ
// Source: https://sudokupad.app/wg95d01p88

// Standard Sudoku with the two drawn givens.
const givens = [
  ['R2C5', 2],
  ['R4C1', 7],
];

// Each listed diagonal has circled first and last cells; all interior digits lie
// strictly between the two endpoint digits. The coordinates are transcribed from
// the drawn grey and brown lines.
const greyLines = [
  ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9'],
  ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8'],
  ['R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'],
  ['R8C1', 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'],
  ['R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9'],
  ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'],
  ['R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C9'],
  ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
  ['R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6'],
];

const brownLines = [
  ['R4C1', 'R3C2', 'R2C3', 'R1C4'],
  ['R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R9C6', 'R8C7', 'R7C8', 'R6C9'],
];

// One circled end of each brown line is the sum of all the other digits on it.
// The rules do not designate an end, so retain both allowed directions.
function brownLineSum(cells) {
  const [first, ...middle] = cells;
  const last = middle.pop();
  return new Or([
    new EqualSum([first], [...middle, last]),
    new EqualSum([...middle, first], [last]),
  ]);
}

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...greyLines.map(cells => new Between(...cells)),
  ...brownLines.flatMap(cells => [new Between(...cells), brownLineSum(cells)]),
];
