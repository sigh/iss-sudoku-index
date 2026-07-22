// Title: Hidden Connection
// Author: Fenners
// Video: https://www.youtube.com/watch?v=Fy7iHJaW3fA
// Source: https://sudokupad.app/imlvnekher

// For line position i, ValueIndexing enforces that the cell selected by the
// digit at position i contains i. The fixed VI cells supply those index values.
const lines = [
  ['R5C2', 'R4C2', 'R3C3', 'R2C3', 'R1C2', 'R2C1', 'R3C1'],
  ['R8C5', 'R8C6', 'R7C7', 'R7C8', 'R8C9', 'R9C8', 'R9C7'],
  ['R5C9', 'R4C9', 'R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5'],
  ['R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4'],
  ['R5C7', 'R4C7', 'R4C6', 'R3C6', 'R3C5'],
];
const indexValues = new Var('I', 'Index values', 9);

return [
  new Shape('9x9'),
  new Cage(10, 'R1C4', 'R2C4'),
  new Cage(11, 'R4C2', 'R5C2'),
  new Cage(10, 'R6C8', 'R6C9'),
  new Cage(11, 'R8C5', 'R8C6'),
  indexValues,
  ...indexValues.cells().map((cell, index) => new Given(cell, index + 1)),
  ...lines.flatMap(line => line.map((controlCell, index) =>
    new ValueIndexing(indexValues.cell(index + 1), controlCell, ...line)
  )),
];
