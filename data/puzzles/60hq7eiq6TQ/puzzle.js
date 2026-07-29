// Title: The Arkenstone
// Author: Blobz
// Video: https://www.youtube.com/watch?v=60hq7eiq6TQ
// Source: https://sudokupad.app/blobz/the-arkenstone

// Standard Sudoku plus the explicit local wall rules. A shade Var is 1 for a
// wall and 2 for an unshaded cell. The four possible 2x2 lairs are the 2x2
// blocks in box 5 containing the yellow Arkenstone R5C5.

const WALL = 1;
const OPEN = 2;
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], WALL, OPEN));

// Every non-lair 2x2 has both shades and is not a checkerboard. The NFA reads
// its four shade cells in row-major order.
const localShadeMachine = NFA.encodeSpec({
  startState: { cells: [] },
  transition: ({ cells }, value) => {
    if (cells === null) return { cells: null };
    const next = [...cells, value];
    if (next.length < 4) return { cells: next };
    const [a, b, c, d] = next;
    const monochrome = a === b && b === c && c === d;
    const checkerboard = a === d && b === c && a !== b;
    return monochrome || checkerboard ? undefined : { cells: null };
  },
  accept: ({ cells }) => cells === null,
}, 9);

const blocks = gridCells
  .map(cell => graph.block(cell, 2, 2))
  .filter(Boolean);
const blockKey = block => block.join(',');
const lairs = [
  ['R4C4', 'R4C5', 'R5C4', 'R5C5'],
  ['R4C5', 'R4C6', 'R5C5', 'R5C6'],
  ['R5C4', 'R5C5', 'R6C4', 'R6C5'],
  ['R5C5', 'R5C6', 'R6C5', 'R6C6'],
];

// The coloured Arkenstone, entrance, and exit cells are named unshaded cells.
const namedOpen = ['R5C5', 'R5C9', 'R9C1'].map(
  cell => new Given(shade.at(cell), OPEN));

const lairAlternatives = lairs.map(lair => new And([
  ...shade.at(lair).map(cell => new Given(cell, OPEN)),
  ...blocks
    .filter(block => blockKey(block) !== blockKey(lair))
    .map(block => new NFA(localShadeMachine, 'local-shade', ...shade.at(block))),
]));

return [
  new Shape('9x9'),
  shade.toVar('wall shading'),
  shadeDomain,
  ...namedOpen,
  new Or(lairAlternatives),
];
