// Title: No more tens
// Author: KoopaNooba
// Video: https://www.youtube.com/watch?v=CfVgawWSh6A
// Source: https://app.crackingthecryptic.com/sudoku/7Ng2dh2Bfr

// Normal sudoku rules. Each green line is a Whisper(5): consecutive digits
// along the drawn line order differ by at least 5.
//
// "All killer cages of size 2 or 3 summing to 10 are given" is an exhaustive-
// marking negative: the four drawn cages (Cage, below) are asserted to be the
// only orthogonally-connected, non-repeating-digit 2- or 3-cell groups in the
// whole grid that sum to 10. Every other such group is therefore forbidden
// from being simultaneously non-repeating and summing to 10 (it may still
// repeat a digit, or sum to something else). Size-4 groups summing to 10 are
// explicitly left open by the rules ("might or might not exist") and are not
// encoded either way -- that indeterminacy is a stated omission, not a gap.

const graph = cellGraph('9x9');

// The four drawn killer cages (cell groups, each summing to 10).
const givenCages = [
  ['R5C2', 'R6C2', 'R7C2'],
  ['R6C4', 'R7C4'],
  ['R6C7', 'R6C8', 'R6C9'],
  ['R8C8', 'R8C9', 'R9C8'],
];

// The three drawn green Whisper lines, in drawn path order (the R5C1-R6C2
// step is a genuine diagonal jump in the drawn path, not a grid-adjacent one).
const whispers = [
  new Whisper(5, 'R1C3', 'R1C4', 'R1C5', 'R2C5', 'R3C5', 'R3C6', 'R3C7', 'R2C7'),
  new Whisper(5, 'R1C7', 'R1C8', 'R1C9'),
  new Whisper(5, 'R5C1', 'R6C2', 'R6C3', 'R7C3'),
];

// A canonical key for a cell set, order-independent.
const cellSetKey = (cells) => [...cells].sort().join(',');
const givenCageKeys = new Set(givenCages.map(cellSetKey));

// Forbid "non-repeating and sums to 10" -- everywhere the four given cages
// don't already claim it. A same-digit pair summing to 10 (5,5) is not a
// killer cage in the first place (cages are non-repeating by rule), so it
// stays allowed.
const notHiddenCagePair = Pair.fnToKey((a, b) => !(a !== b && a + b === 10), 9);

// Same forbidden combination over 3 cells: reject only when all three differ
// and sum to 10. States after cell 1 and cell 2 just carry the values seen so
// far; the third symbol resolves accept/reject.
const tripleSpec = NFA.encodeSpec({
  startState: {},
  transition: (state, value) => {
    if (state.a === undefined) return { a: value };
    if (state.b === undefined) return { a: state.a, b: value };
    const v1 = state.a, v2 = state.b, v3 = value;
    const distinct = v1 !== v2 && v1 !== v3 && v2 !== v3;
    const sumsTo10 = (v1 + v2 + v3) === 10;
    return { done: true, ok: !(distinct && sumsTo10) };
  },
  accept: (state) => state.ok === true,
}, 9);

// Every orthogonally-connected 2- or 3-cell shape reduces to one of 6 shapes
// up to translation: a horizontal or vertical pair, a straight horizontal or
// vertical triple, or one of the 4 rotations of a bent (L) triple -- each L
// fitting one 2x2 block with one corner omitted (the only bounding box a bent
// tromino can have). `offsets` places a shape's cells relative to a shared
// reference corner; replicating over every valid corner position, minus any
// position matching a given cage exactly, covers every "hidden" instance.
const shapes = [
  { offsets: [[0, 0], [0, 1]], make: (...c) => new Pair(notHiddenCagePair, 'no hidden 10-cage', ...c) },
  { offsets: [[0, 0], [1, 0]], make: (...c) => new Pair(notHiddenCagePair, 'no hidden 10-cage', ...c) },
  { offsets: [[0, 0], [0, 1], [0, 2]], make: (...c) => new NFA(tripleSpec, 'no hidden 10-cage', ...c) },
  { offsets: [[0, 0], [1, 0], [2, 0]], make: (...c) => new NFA(tripleSpec, 'no hidden 10-cage', ...c) },
  { offsets: [[0, 1], [1, 0], [1, 1]], make: (...c) => new NFA(tripleSpec, 'no hidden 10-cage', ...c) }, // 2x2 minus top-left
  { offsets: [[0, 0], [1, 0], [1, 1]], make: (...c) => new NFA(tripleSpec, 'no hidden 10-cage', ...c) }, // 2x2 minus top-right
  { offsets: [[0, 0], [0, 1], [1, 1]], make: (...c) => new NFA(tripleSpec, 'no hidden 10-cage', ...c) }, // 2x2 minus bottom-left
  { offsets: [[0, 0], [0, 1], [1, 0]], make: (...c) => new NFA(tripleSpec, 'no hidden 10-cage', ...c) }, // 2x2 minus bottom-right
];

// graph.cells()[0] ('R1C1') is the reference corner makeReplicate anchors on.
const ORIGIN = graph.cells()[0];
const noHiddenCages = shapes.flatMap(({ offsets, make }) => {
  const templateCells = offsets.map(([dr, dc]) => graph.step(ORIGIN, dr, dc));
  const targets = graph.cells().filter(corner => {
    const cells = offsets.map(([dr, dc]) => graph.step(corner, dr, dc));
    if (cells.some(c => c === null)) return false;
    return !givenCageKeys.has(cellSetKey(cells));
  });
  if (targets.length === 0) return [];
  return [graph.makeReplicate(make(...templateCells), targets)];
});

return [
  new Shape('9x9'),
  ...whispers,
  ...givenCages.map(cells => new Cage(10, ...cells)),
  ...noHiddenCages,
];
