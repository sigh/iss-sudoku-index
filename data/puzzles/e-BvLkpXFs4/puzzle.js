// Title: Counting Thermos
// Author: Scojo
// Video: https://www.youtube.com/watch?v=e-BvLkpXFs4
// Source: https://sudokupad.app/f2ajiy0h66

// Chaos Construction Sudoku: rows, columns, and nine orthogonally connected
// nine-cell regions each contain 1-9.
const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

// Thermometers transcribed from the grey bulb-to-tip paths.
const THERMOS = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C3', 'R2C2'],
  ['R3C1', 'R3C2', 'R4C2', 'R4C3'],
  ['R6C3', 'R5C3', 'R5C2', 'R5C1', 'R4C1'],
  ['R7C4', 'R6C4', 'R6C5', 'R5C5'],
  ['R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'],
  ['R5C9', 'R4C9', 'R4C8', 'R4C7', 'R5C7'],
  ['R7C9', 'R7C8', 'R7C7', 'R7C6', 'R7C5'],
];
const BULBS = THERMOS.map(cells => cells[0]);
const THERMO_CELLS = [...new Set(THERMOS.flat())];

// The bulb digit is the number of its path's consecutive CC labels that differ.
const borderCountSpec = {
  startState: { target: null, previous: null, count: 0 },
  transition({ target, previous, count }, value) {
    if (target === null) return { target: value, previous: null, count: 0 };
    if (previous === null) return { target, previous: value, count: 0 };
    const nextCount = Math.min(count + (value !== previous ? 1 : 0), target + 1);
    return { target, previous: value, count: nextCount };
  },
  accept: ({ target, previous, count }) => previous !== null && count === target,
};
const borderCountNFA = NFA.encodeSpec(borderCountSpec, 9, { maxDepth: 6 });

// The outlined-square cells transcribed from the drawn square underlays. A
// ChaosCount compares their CC label with the distinct thermometer cells' labels.
const SQUARES = ['R1C7', 'R2C7', 'R2C5', 'R4C4', 'R6C4', 'R6C5', 'R5C8', 'R7C9', 'R9C2'];
function squareCount(square) {
  const otherThermoCells = THERMO_CELLS.filter(cell => cell !== square);
  const squareIsOnThermo = otherThermoCells.length !== THERMO_CELLS.length;
  return new ChaosCount(
    square,
    squareIsOnThermo ? 0 : 1,
    cc.at(square),
    ...cc.at(otherThermoCells),
  );
}

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...THERMOS.map(cells => new Thermo(...cells)),
  new CountingCircles(...BULBS),
  ...THERMOS.map(cells => new NFA(borderCountNFA, 'RegionBorderCount', cells[0], ...cc.at(cells))),
  ...SQUARES.map(squareCount),
  // The downward-pointing V says the lower cell is R9C3.
  new GreaterThan('R8C3', 'R9C3'),
];
