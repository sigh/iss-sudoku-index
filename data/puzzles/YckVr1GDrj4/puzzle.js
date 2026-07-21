// Title: Magic Matryoshka
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=YckVr1GDrj4
// Source: https://sudokupad.app/bupkl5df4h

// Place 1-9 once in every row, column, and marked irregular region.
const shape = new Shape('9x9');
const graph = cellGraph(shape);

const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R3C3'],
  ['R1C5', 'R2C5', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C5', 'R4C6', 'R4C7'],
  ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C6', 'R2C7', 'R2C8', 'R3C8', 'R4C8'],
  ['R3C1', 'R3C2', 'R4C1', 'R4C2', 'R4C3', 'R4C4', 'R5C2', 'R5C4', 'R6C2'],
  ['R2C9', 'R3C9', 'R4C9', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9', 'R6C9'],
  ['R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R5C3', 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R8C2', 'R8C3'],
  ['R6C5', 'R6C6', 'R6C7', 'R7C6', 'R7C7', 'R8C4', 'R8C5', 'R8C6', 'R8C7'],
  ['R6C8', 'R7C8', 'R7C9', 'R8C8', 'R8C9', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
];

// Every row, column, and main diagonal in each centred square has the same
// sum. Repetition is allowed here, so these are EqualSums rather than cages.
function magicSquare(topLeft, size) {
  const cells = graph.block(topLeft, size, size);
  const rows = Array.from({ length: size }, (_, row) =>
    cells.slice(row * size, (row + 1) * size));
  const columns = Array.from({ length: size }, (_, col) =>
    rows.map(row => row[col]));
  const diagonals = [
    rows.map((row, index) => row[index]),
    rows.map((row, index) => row[size - 1 - index]),
  ];
  return new EqualSum(...rows, ...columns, ...diagonals);
}

return [
  shape,
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),

  // Black dots are positive clues only: one digit is double the other.
  new BlackDot('R1C3', 'R1C4'),
  new BlackDot('R3C1', 'R4C1'),
  new BlackDot('R7C9', 'R8C9'),

  magicSquare('R1C1', 9),
  magicSquare('R2C2', 7),
  magicSquare('R3C3', 5),
  magicSquare('R4C4', 3),
];
