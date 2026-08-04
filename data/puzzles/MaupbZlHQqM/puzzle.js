// Title: Chinese Takeaway
// Author: BenTen
// Video: https://www.youtube.com/watch?v=MaupbZlHQqM
// Source: https://app.crackingthecryptic.com/sudoku/39H9QF8L4B

// Normal sudoku rules, standard 3x3 boxes. Every cell is shaded or unshaded:
// shaded cells form one orthogonally connected region, unshaded cells form
// one orthogonally connected region, and no 2x2 area is fully one shade.
// Cages sum to their printed total, with a shaded cell's digit counting
// negative towards that sum; the rules text never says cage digits must be
// distinct, so no AllDifferent is added per cage (only the sum is encoded).
// White dots mark consecutive digits; the rules note that not every possible
// dot is drawn, so an unmarked adjacent pair carries no information either
// way and needs no encoding.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// block, replicated to every block origin.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, 9);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// Cages, transcribed from the drawn `cages` entries (total, cells).
const cages = [
  [3, ['R1C1', 'R1C2', 'R1C3']],
  [24, ['R2C2', 'R2C3', 'R2C4']],
  [3, ['R3C1', 'R3C2']],
  [11, ['R1C5', 'R2C5', 'R3C4', 'R3C5']],
  [1, ['R1C7', 'R1C8', 'R1C9']],
  [16, ['R2C7', 'R2C8', 'R3C7']],
  [6, ['R3C9', 'R4C9']],
  [4, ['R4C4', 'R5C4']],
  [9, ['R4C5', 'R5C5', 'R6C5']],
  [1, ['R4C3', 'R5C2', 'R5C3']],
  [3, ['R5C6', 'R6C6']],
  [8, ['R5C7', 'R5C8', 'R6C7']],
  [10, ['R6C1', 'R7C1']],
  [6, ['R7C3', 'R8C2', 'R8C3']],
  [13, ['R9C1', 'R9C2', 'R9C3']],
  [6, ['R7C5', 'R7C6']],
  [5, ['R8C5', 'R9C5']],
  [6, ['R8C6', 'R8C7', 'R8C8']],
  [3, ['R7C8', 'R7C9']],
  [9, ['R9C7', 'R9C8', 'R9C9']],
];

// Reads a cage as alternating (shade, digit) pairs and accumulates the
// signed running total -- a shaded cell's digit subtracts, an unshaded
// cell's digit adds. `target` is baked into `accept` (one compiled spec per
// distinct cage), so no state needs to track it; `maxDepth` is the cage's
// exact symbol count, since each spec is only ever used at that one length.
const cageSumSpec = (target, cellCount) => NFA.encodeSpec({
  startState: { phase: 0, sign: 0, total: 0 },
  transition: ({ phase, sign, total }, value) => (phase % 2 === 0
    ? { phase: phase + 1, sign: value === SHADED ? -1 : 1, total }
    : { phase: phase + 1, sign: 0, total: total + sign * value }),
  accept: ({ total }) => total === target,
  maxDepth: cellCount * 2,
}, 9);
const signedStream = cells => cells.flatMap(cell => [shade.at(cell), cell]);

const cageConstraints = cages.map(([total, cells]) =>
  new NFA(cageSumSpec(total, cells.length), 'cage-sum', ...signedStream(cells)));

// White dots (edge marks decoded from the two rounded white/black overlays).
const whiteDots = [
  ['R7C4', 'R8C4'],
  ['R2C6', 'R3C6'],
];

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...cageConstraints,
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
