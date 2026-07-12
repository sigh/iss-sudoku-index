// Title: Yin Yang killers
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=3srmjGZskE4
// Source: https://sudokupad.app/uoypkyxq4g

// Normal sudoku. Colour each cell one of two colours such that each colour
// forms a single orthogonally connected region and no 2x2 block is entirely
// one colour. The digits along each line sum to the same total (deduced, not
// given). Along each line, the colouring separates the line's odd digits
// from its even digits (one colour holds all the odds on that line, the
// other holds all the evens). Digits joined by a white dot are consecutive.
//
// Model: a VS shade Var (YIN/YANG) per cell. No-monochrome-2x2 is a local
// NFA over each 2x2 block of shade cells. The equal (unknown) line total is
// EqualSum over the 17 lines. The per-line odd/even-by-colour split is
// modelled as: for every cell, t = (digit parity) XOR (shade bit); a line
// satisfies the rule exactly when t is the same for every one of its cells
// (whichever colour ends up as "odds" and whichever as "evens" is free per
// line, only self-consistency along that one line is required) -- enforced
// by an NFA that reads each line's cells as interleaved (digit, shade) pairs
// and checks t stays constant.
// OMITTED: the global "each colour forms a single connected region"
// requirement -- ISS has no general connected-component primitive; only the
// local no-monochrome-2x2 rule is encoded (known constraint-gap).

const YIN = 1, YANG = 2;
const DIGIT_VALUES = 9;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const shadeOf = cell => shade.at(cell);
const gridCells = graph.cells();

const constraints = [
  new Shape('9x9'),
  shade.toVar('yin-yang shade'),
];
const add = (...cs) => constraints.push(...cs);

for (const cell of gridCells) add(new Given(shadeOf(cell), YIN, YANG));

// --- No 2x2 block of cells is entirely one colour. ---
const notAllSameNFA = NFA.encodeSpec({
  startState: null,
  transition: (state, v) => state === null
    ? { first: v, allSame: true }
    : { first: state.first, allSame: state.allSame && v === state.first },
  accept: (state) => state !== null && !state.allSame,
}, YANG);
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    const block = [
      makeCellId(r, c), makeCellId(r, c + 1),
      makeCellId(r + 1, c), makeCellId(r + 1, c + 1),
    ].map(shadeOf);
    add(new NFA(notAllSameNFA, 'no-monochrome-2x2', ...block));
  }
}

// --- Lines: drawn as thick white/grey strokes; each pair of cells here is a
// segment of one such line, read off the decoded waypoints. ---
const lines = [
  ['R1C1', 'R2C1'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R1C9', 'R1C8', 'R2C8'],
  ['R2C7', 'R2C6', 'R3C6'],
  ['R3C7', 'R3C8', 'R3C9'],
  ['R2C3', 'R2C2', 'R3C2', 'R3C3'],
  ['R4C1', 'R5C1', 'R6C1', 'R6C2'],
  ['R4C2', 'R5C2', 'R5C3'],
  ['R4C3', 'R4C4', 'R5C4'],
  ['R6C4', 'R6C5', 'R5C5', 'R5C6'],
  ['R4C8', 'R5C8', 'R6C8'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R8C3', 'R8C2', 'R8C1', 'R9C1'],
  ['R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R8C7', 'R7C7', 'R6C7'],
  ['R7C5', 'R7C6', 'R8C6'],
  ['R7C8', 'R8C8', 'R9C8'],
];

// The digits along each line sum to the same (unknown, deduced) total.
add(new EqualSum(...lines));

// Along each line, the colouring separates odd digits from even digits: for
// every cell, t = parity(digit) XOR shadeBit must be the same for every cell
// on that line (either colour may hold the odds; only per-line consistency
// is required). Reads each line's cells as interleaved (digit, shade) pairs.
const dsFlat = cells => cells.flatMap(cell => [cell, shadeOf(cell)]);
const lineParityNFA = NFA.encodeSpec({
  startState: { phase: 'digit', t: null },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'shade', digit: value, t: state.t };
    const parity = state.digit % 2; // 1 = odd, 0 = even
    const shadeBit = value - 1; // YIN(1) -> 0, YANG(2) -> 1
    const t = parity ^ shadeBit;
    if (state.t !== null && t !== state.t) return undefined;
    return { phase: 'digit', t };
  },
  accept: (state) => state.phase === 'digit',
}, DIGIT_VALUES);
for (const line of lines) add(new NFA(lineParityNFA, 'line-parity-split', ...dsFlat(line)));

// --- White dot: digits are consecutive. ---
add(new WhiteDot('R5C6', 'R6C6'));

return constraints;
