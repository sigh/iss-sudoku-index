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
// Model: a VS shade Var (YIN/YANG) per cell. Global Yin-Yang connectivity is
// one ConnectedValues constraint per shade over the shade overlay.
// No-monochrome-2x2 is a local NFA over each 2x2 block of shade cells. The
// equal (unknown) line total is EqualSum over the 17 lines. The per-line
// odd/even-by-colour split is modelled as: for every cell, t = (digit
// parity) XOR (shade bit); a line satisfies the rule exactly when t is the
// same for every one of its cells (whichever colour ends up as "odds" and
// whichever as "evens" is free per line, only self-consistency along that
// one line is required) -- enforced by an NFA that reads each line's cells
// as interleaved (digit, shade) pairs and checks t stays constant.

const YIN = 1, YANG = 2;
const DIGIT_VALUES = 9;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const shadeOf = cell => shade.at(cell);
const gridCells = graph.cells();

// --- No 2x2 block of cells is entirely one colour. ---
const notAllSameNFA = NFA.encodeSpec({
  startState: null,
  transition: (state, v) => state === null
    ? { first: v, allSame: true }
    : { first: state.first, allSame: state.allSame && v === state.first },
  accept: (state) => state !== null && !state.allSame,
}, YANG);
const monoOrigin = shadeOf('R1C1');

// Every cell is YIN or YANG: one Given template stamped over the whole grid
// via Replicate instead of 81 identical Givens.
const shadeCells = gridCells.map(cell => shadeOf(cell));
const shadeGivens = shade.makeReplicate(new Given(shadeCells[0], YIN, YANG));

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

return [
  new Shape('9x9'),
  shade.toVar('yin-yang shade'),

  shadeGivens,

  // --- Global Yin-Yang connectivity: each colour forms one connected region. ---
  new ConnectedValues('VS', YIN),
  new ConnectedValues('VS', YANG),

  // The rules never name which colour is which -- every constraint above is
  // exactly invariant under swapping YIN<->YANG everywhere, so any solution's
  // full swap is also a solution with the identical digit grid and physical
  // partition, just the two arbitrary colour names exchanged. Pin one
  // reference cell so the model reports that single canonical labeling
  // instead of counting the meaningless relabeling as a second solution.
  new Given(shadeOf('R1C1'), YIN),

  // --- No 2x2 block of cells is entirely one colour. ---
  shade.makeReplicate(
    new NFA(
      notAllSameNFA, 'no-monochrome-2x2',
      shadeOf('R1C1'), shadeOf('R1C2'), shadeOf('R2C1'), shadeOf('R2C2')),
    shade.block(monoOrigin, 8, 8)),

  // The digits along each line sum to the same (unknown, deduced) total.
  new EqualSum(...lines),

  // Along each line, the colouring separates odd digits from even digits: for
  // every cell, t = parity(digit) XOR shadeBit must be the same for every cell
  // on that line (either colour may hold the odds; only per-line consistency
  // is required). Reads each line's cells as interleaved (digit, shade) pairs.
  ...lines.map(line => new NFA(lineParityNFA, 'line-parity-split', ...dsFlat(line))),

  // --- White dot: digits are consecutive. ---
  new WhiteDot('R5C6', 'R6C6'),
];
