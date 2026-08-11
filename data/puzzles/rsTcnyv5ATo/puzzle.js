// Title: Tightrope Crossing
// Author: Joey Thamir
// Video: https://www.youtube.com/watch?v=rsTcnyv5ATo
// Source: https://app.crackingthecryptic.com/sudoku/3F37hMHfLR

// Normal sudoku rules apply (default Shape('9x9') givens standard row/col/box
// AllDifferent, matching the payload's plain 3x3 box regions).
//
// 9 pairs of "Poles" are drawn as circled cells joined by a straight red rope
// line. Both cells of a pair hold the same "height" digit, and that digit
// does not repeat at any other cell along the rope between them. Each of the
// 9 pairs has a unique height, i.e. across the 9 pairs the heights are a
// permutation of 1-9 (encoded as AllDifferent over one representative cell
// per pair, since the NFA below already ties each pair's two cells equal).
//
// Cell paths below run pole-to-pole in path order, read from the circled
// cells and the straight rope line joining them. Path 1 is the height-4
// pair the rules text calls out as already given.
const POLE_PATHS = [
  ['R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7'],
  ['R1C8', 'R2C7', 'R3C6', 'R4C5', 'R5C4', 'R6C3', 'R7C2', 'R8C1'],
  ['R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1'],
  ['R2C6', 'R3C7', 'R4C8'],
  ['R2C7', 'R3C8', 'R4C9'],
  ['R2C8', 'R3C7', 'R4C6'],
  ['R6C5', 'R7C6', 'R8C7', 'R9C8'],
  ['R7C7', 'R8C6', 'R9C5'],
  ['R4C7', 'R3C8', 'R2C9'],
];

const GIVENS = [
  ['R1C3', 1], ['R2C2', 9], ['R2C3', 4], ['R2C9', 1], ['R3C9', 2],
  ['R4C1', 2], ['R5C1', 8], ['R5C5', 7], ['R6C4', 1], ['R6C7', 4],
  ['R7C8', 8], ['R8C4', 9], ['R8C6', 4], ['R8C9', 7], ['R9C3', 3],
  ['R9C8', 6],
];

// Reads a rope in order. The first cell fixes the target height; `count`
// tallies how many later cells (positions 1..end) equal it, and `last` is
// the most recent value read. Accept iff exactly one later cell equals the
// target (count === 1) and that one is the final cell (last === target) --
// together this is "first == last, and no interior cell repeats that value",
// with no explicit position/length tracking needed.
const poleSpec = NFA.encodeSpec({
  startState: { target: null, count: 0, last: null },
  transition: (state, value) => {
    if (state.target === null) return { target: value, count: 0, last: value };
    const hit = value === state.target ? 1 : 0;
    return { target: state.target, count: Math.min(state.count + hit, 2), last: value };
  },
  accept: (state) => state.target !== null && state.count === 1 && state.last === state.target,
}, 9);

const poleNFAs = POLE_PATHS.map(
  (path, i) => new NFA(poleSpec, `pole ${i + 1}`, ...path));

const uniqueHeights = new AllDifferent(...POLE_PATHS.map(path => path[0]));

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, v]) => new Given(cell, v)),
  ...poleNFAs,
  uniqueHeights,
];
