// Title: Kropki's Revenge
// Author: Metagloria
// Video: https://www.youtube.com/watch?v=BeP4jzmsBwQ
// Source: https://app.crackingthecryptic.com/sudoku/tdrMgQDbM8

// Normal Sudoku rules apply. White dots are consecutive digits or 1 and 9;
// black dots are 2:1 pairs or pairs drawn from 5, 7, and 9. Every possible
// black dot is drawn, so each other orthogonally adjacent pair is not black.
// Dot-edge tables are transcribed from the source's black and white dot overlays.
const whiteEdges = [
  ['R1C4', 'R2C4'], ['R2C3', 'R3C3'], ['R3C2', 'R3C3'], ['R2C8', 'R3C8'],
  ['R6C4', 'R7C4'], ['R6C4', 'R6C5'], ['R6C5', 'R7C5'], ['R8C6', 'R8C7'],
];
const blackEdges = [
  ['R8C9', 'R9C9'], ['R9C7', 'R9C8'], ['R8C7', 'R8C8'], ['R7C7', 'R7C8'],
  ['R6C9', 'R7C9'], ['R5C9', 'R6C9'], ['R5C8', 'R5C9'], ['R6C7', 'R6C8'],
  ['R6C6', 'R6C7'], ['R3C9', 'R4C9'], ['R2C9', 'R3C9'], ['R1C9', 'R2C9'],
  ['R3C7', 'R3C8'], ['R4C6', 'R4C7'], ['R3C6', 'R4C6'], ['R4C5', 'R4C6'],
  ['R2C6', 'R2C7'], ['R1C6', 'R1C7'], ['R1C5', 'R1C6'], ['R2C5', 'R3C5'],
  ['R1C3', 'R1C4'], ['R2C3', 'R2C4'], ['R3C3', 'R3C4'], ['R2C2', 'R2C3'],
  ['R2C2', 'R3C2'], ['R2C1', 'R3C1'], ['R5C1', 'R5C2'], ['R5C2', 'R5C3'],
  ['R4C3', 'R4C4'], ['R6C3', 'R6C4'], ['R7C3', 'R7C4'], ['R8C3', 'R8C4'],
  ['R9C3', 'R9C4'], ['R9C5', 'R9C6'], ['R8C2', 'R8C3'],
];

const edgeId = ([a, b]) => [a, b].sort().join('-');
const blackIds = new Set(blackEdges.map(edgeId));

// The custom predicate is the rule-defined white-dot relationship.
const whiteKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1 ||
  (a === 1 && b === 9) || (a === 9 && b === 1), 9);
const isBlackPair = (a, b) => a === 2 * b || b === 2 * a ||
  ([5, 7, 9].includes(a) && [5, 7, 9].includes(b));

// This NFA scans one complete row or column. Its state remembers the previous
// digit and edge position: the transition accepts the black relation exactly
// at drawn black-dot edges and its negation at every other edge.
const blackDotNfa = (dots) => NFA.encodeSpec({
  startState: { prev: null, pos: 0 },
  transition: ({ prev, pos }, value) => {
    if (prev === null) return { prev: value, pos };
    if (isBlackPair(prev, value) !== dots[pos]) return undefined;
    return { prev: value, pos: pos + 1 };
  },
  accept: ({ pos }) => pos === 8,
  maxDepth: 9,
}, 9);

const indices = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const rows = indices.map(row => indices.map(col => makeCellId(row, col)));
const columns = indices.map(col => indices.map(row => makeCellId(row, col)));
const blackDotNfas = [...rows, ...columns].map(cells =>
  new NFA(blackDotNfa(cells.slice(1).map((cell, i) =>
    blackIds.has(edgeId([cells[i], cell])))), 'black-dot completeness', ...cells));

return [
  new Shape('9x9'),
  ...whiteEdges.map(([a, b]) => new Pair(whiteKey, 'white dot', a, b)),
  ...blackDotNfas,
];
