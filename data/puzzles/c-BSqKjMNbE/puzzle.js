// Title: Three Strikes and You're Out
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=c-BSqKjMNbE
// Source: https://sudokupad.app/329ytp25q2

// No contiguous horizontal or vertical three-cell window may contain a
// consecutive set. The standard row/column rules already make each window
// distinct, while this machine rejects precisely the sets with range two.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

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

const vClues = [
  ['R3C3', 'R3C4'],
  ['R2C4', 'R3C4'],
  ['R1C6', 'R2C6'],
  ['R4C2', 'R5C2'],
  ['R6C2', 'R6C3'],
  ['R6C6', 'R6C7'],
  ['R8C1', 'R8C2'],
  ['R8C8', 'R9C8'],
];

const xClues = [
  ['R3C1', 'R4C1'],
  ['R4C2', 'R4C3'],
  ['R4C8', 'R4C9'],
  ['R5C8', 'R5C9'],
  ['R5C6', 'R5C7'],
  ['R6C4', 'R7C4'],
  ['R7C1', 'R8C1'],
  ['R7C8', 'R8C8'],
  ['R8C2', 'R9C2'],
  ['R6C9', 'R7C9'],
  ['R3C5', 'R4C5'],
];

return [
  new Shape('9x9'),
  ...vClues.map(cells => new V(...cells)),
  ...xClues.map(cells => new X(...cells)),
  noHorizontalConsecutiveTriple,
  noVerticalConsecutiveTriple,
];
