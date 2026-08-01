// Title: P = NP
// Author: damasosos92
// Video: https://www.youtube.com/watch?v=OJCDCazMdlo
// Source: https://sudokupad.app/in3a5cg87s

// Normal Sudoku rules apply. Each drawn P or N pentomino is filled by either a
// five-cell renban or a non-branching orthogonal thermometer; all copies of one
// shape use the same kind. The listed cage cells are transcribed from the outlines.
const pCages = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2'],
  ['R3C4', 'R3C5', 'R4C4', 'R4C5', 'R5C4'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2'],
  ['R6C2', 'R7C2', 'R7C3', 'R8C2', 'R8C3'],
  ['R7C8', 'R7C9', 'R8C8', 'R8C9', 'R9C8'],
];
const nCages = [
  ['R2C3', 'R2C4', 'R2C5', 'R3C2', 'R3C3'],
  ['R5C5', 'R5C6', 'R6C3', 'R6C4', 'R6C5'],
  ['R8C4', 'R8C5', 'R8C6', 'R9C3', 'R9C4'],
  ['R4C7', 'R5C7', 'R6C6', 'R6C7', 'R7C6'],
  ['R2C8', 'R3C8', 'R4C8', 'R4C9', 'R5C9'],
  ['R1C7', 'R2C6', 'R2C7', 'R3C6', 'R4C6'],
];

function orthogonalPaths(cells) {
  const adjacent = (a, b) => {
    const A = parseCellId(a);
    const B = parseCellId(b);
    return Math.abs(A.row - B.row) + Math.abs(A.col - B.col) === 1;
  };
  const paths = [];
  const extend = path => {
    if (path.length === cells.length) {
      // Reversing a route only changes which endpoint is the bulb, so Thermo
      // needs both directions to represent every possible bulb position.
      paths.push(path);
      return;
    }
    for (const cell of cells) {
      if (!path.includes(cell) && adjacent(path.at(-1), cell)) extend([...path, cell]);
    }
  };
  for (const cell of cells) extend([cell]);
  return paths;
}

const thermometers = cages => cages.map(cage =>
  new Or(orthogonalPaths(cage).map(path => new Thermo(...path))),
);
const renbans = cages => cages.map(cage => new Renban(...cage));

return [
  new Shape('9x9'),
  new Given('R1C3', 7), new Given('R3C5', 2), new Given('R3C9', 8),
  new Given('R5C1', 5), new Given('R5C8', 1), new Given('R6C4', 4),
  new Given('R7C7', 3), new Given('R8C1', 9), new Given('R8C6', 6),
  // The two alternatives preserve the unknown shape-to-constraint assignment.
  new Or([
    new And([...renbans(pCages), ...thermometers(nCages)]),
    new And([...thermometers(pCages), ...renbans(nCages)]),
  ]),
];
