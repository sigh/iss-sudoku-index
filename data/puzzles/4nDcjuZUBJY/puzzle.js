// Title: Zodiac Project: Ponta Delgada
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=4nDcjuZUBJY
// Source: https://sudokupad.app/2p1an6oilw

// Encodes normal Sudoku, the all-different clue-cell region, and the directly
// expressible Modified Nurikabe rules: clue cells are land, water is one
// orthogonally connected area, and no 2x2 is monochrome. The per-island
// membership, killer, and thermal rules are omitted.

const WATER = 1;
const LAND = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

const clueCells = [
  'R1C7', 'R3C2', 'R4C1', 'R4C4', 'R5C9',
  'R7C4', 'R8C8', 'R9C2', 'R9C7',
];

// Every overlay cell is either water or land.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], WATER, LAND));

// No 2x2 block may be fully water or fully land. The NFA reads the four cells
// of a block in row-major order and rejects a block whose four shade values match.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

return [
  new Shape('9x9'),
  shade.toVar('water-land state'),
  new AllDifferent(...clueCells),
  shadeDomain,
  // All shaded cells form one orthogonally connected water area.
  new ConnectedValues('VS', WATER),
  // Every displayed island clue is unshaded land.
  ...shade.at(clueCells).map(cell => new Given(cell, LAND)),
  noMono2x2,
];
