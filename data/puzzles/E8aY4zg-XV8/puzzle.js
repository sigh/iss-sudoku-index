// Title: Squares And Primes Harmony!
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=E8aY4zg-XV8
// Source: https://sudokupad.app/qndcjysi43

// Cell positions are numbered 1-81 in row-major order. Square-numbered
// positions contain square digits; prime-numbered positions contain prime digits.
// The NFA rejects a consecutive set in every contiguous horizontal or vertical
// three-cell window. Sudoku's row/column constraints make each window distinct.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const isPrime = value => {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor++) {
    if (value % divisor === 0) return false;
  }
  return true;
};

const squareCells = gridCells.filter((cell, index) =>
  Number.isInteger(Math.sqrt(index + 1)));
const primeCells = gridCells.filter((cell, index) => isPrime(index + 1));

const squarePositionDomains = squareCells.map(cell =>
  new Given(cell, 1, 4, 9));
const primePositionDomains = primeCells.map(cell =>
  new Given(cell, 2, 3, 5, 7));

const noConsecutiveTripleMachine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen }, value) => ({
    seen: [...seen, value].sort((a, b) => a - b),
  }),
  accept: ({ seen }) => seen.length === 3 && seen[2] - seen[0] !== 2,
  maxDepth: 3,
}, geometry.numValues);

const horizontalOrigins = gridCells.filter(cell => graph.block(cell, 1, 3));
const verticalOrigins = gridCells.filter(cell => graph.block(cell, 3, 1));

const noHorizontalConsecutiveTriple = graph.makeReplicate(
  new NFA(noConsecutiveTripleMachine, 'no consecutive triple',
    ...graph.block('R1C1', 1, 3)),
  horizontalOrigins);

const noVerticalConsecutiveTriple = graph.makeReplicate(
  new NFA(noConsecutiveTripleMachine, 'no consecutive triple',
    ...graph.block('R1C1', 3, 1)),
  verticalOrigins);

return [
  new Shape('9x9'),
  new Given('R1C2', 3),
  new Given('R3C4', 2),
  new Given('R8C3', 9),
  new Given('R9C7', 5),
  ...squarePositionDomains,
  ...primePositionDomains,
  noHorizontalConsecutiveTriple,
  noVerticalConsecutiveTriple,
];
