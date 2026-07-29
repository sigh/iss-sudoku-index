// Title: Zipper Gramophone
// Author: Flash Groudon
// Video: https://www.youtube.com/watch?v=Cqh0MS8utnw
// Source: https://sudokupad.app/iwfv5d36aw

// Standard 9x9 Sudoku. Lavender lines are zippers; pink lines are renbans;
// the peach line alternates parity. Each list follows its drawn path.
const zippers = [
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8'],
  ['R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1'],
  ['R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2'],
].map((cells) => new Zipper(...cells));

const renbans = [
  ['R4C9', 'R5C9', 'R6C9'],
  ['R4C6', 'R5C6'],
  ['R6C6', 'R7C6', 'R8C6'],
  ['R3C4', 'R3C5', 'R3C6'],
].map((cells) => new Renban(...cells));

const parity = new Modular(2,
  'R9C5', 'R8C5', 'R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5', 'R2C5', 'R1C5');

return [
  new Shape('9x9'),
  ...zippers,
  ...renbans,
  parity,
];
