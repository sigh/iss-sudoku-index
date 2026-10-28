// Title: Nine Quilts
// Author: Aleksa
// Video: https://www.youtube.com/watch?v=038TRmTz0kY
// Source: https://sudokupad.app/2md3mxcvt8

// Normal Sudoku, distinct-digit sum cages, increasing thermometers, and
// orthogonal neighbours whose difference is not a multiple of three.
const shape = new Shape('9x9');
// The predicate rejects precisely equal residues modulo three.
const neighbourKey = Pair.fnToKey((a, b) => (a - b) % 3 !== 0, shape);
const indices = Array.from({length: 9}, (_, i) => i + 1);
const rowsAndColumns = indices.flatMap(row => [
  indices.map(col => makeCellId(row, col)),
  indices.map(col => makeCellId(col, row)),
]);
// The nine dashed cages each display a total of 9.
const cages = [
  ['R2C1', 'R2C2', 'R3C1'],
  ['R2C5', 'R3C4', 'R3C5'],
  ['R5C4', 'R5C5', 'R6C4'],
  ['R8C7', 'R8C8', 'R9C7'],
  ['R8C5', 'R9C4', 'R9C5'],
  ['R8C2', 'R9C1', 'R9C2'],
  ['R5C2', 'R6C1', 'R6C2'],
  ['R5C8', 'R6C7', 'R6C8'],
  ['R2C8', 'R3C7', 'R3C8'],
];
// The circles at R9C3 and R9C6 are the bulbs of the two grey shafts.
const thermometers = [['R9C3', 'R8C3'], ['R9C6', 'R8C6']];
return [
  shape,
  ...cages.map(cells => new Cage(9, ...cells)),
  ...thermometers.map(cells => new Thermo(...cells)),
  ...rowsAndColumns.map(cells => new Pair(neighbourKey, 'Different residues mod 3', ...cells)),
];
