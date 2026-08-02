// Title: Rising Tide
// Author: Nordy
// Video: https://www.youtube.com/watch?v=QWlRxdCKfxg
// Source: https://sudokupad.app/fB4rmjbndh

// Normal Sudoku applies. Green lines are German Whispers. Digits 5-9 are
// coral and digits 1-4 are water; coral is orthogonally connected and no 2x2
// block is monochrome. The rule that every separate water body reaches the
// grid edge is omitted.

const CORAL = 1;
const WATER = 2;
const graph = cellGraph('9x9');
const gridCells = graph.cells();
const shade = graph.makeOverlay('VS');

// Drawn green line paths, transcribed from the SudokuPad line entries.
const whispers = [
  ['R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C3'],
  ['R6C1', 'R6C2', 'R6C3', 'R7C3'],
  ['R8C5', 'R9C5'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R8C7', 'R7C7', 'R6C7', 'R5C7', 'R5C8', 'R4C8'],
  ['R7C8', 'R6C8', 'R6C9', 'R5C9'],
  ['R2C9', 'R3C9'],
  ['R2C5', 'R2C6'],
];

// This pair maps each solved digit to its stated coral/water class.
const tideKey = Pair.fnToKey(
  (digit, state) => state === (digit >= 5 ? CORAL : WATER), 9);
const tideStates = gridCells.map(cell =>
  new Pair(tideKey, 'digit-to-tide class', cell, shade.at(cell)));

// No 2x2 block may be entirely one tide class. The NFA reads its four shade
// states row-major and accepts exactly when at least one differs from the first.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(state => state === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, 9);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-monochrome-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

return [
  new Shape('9x9'),
  shade.toVar('coral or water'),
  shade.makeReplicate(new Given(shade.cells()[0], CORAL, WATER)),
  ...tideStates,
  new ConnectedValues('VS', CORAL),
  noMono2x2,
  ...whispers.map(cells => new Whisper(5, ...cells)),
];
