// Title: X marks the Sum
// Author: randall
// Video: https://www.youtube.com/watch?v=DjqVwTTzVvU
// Source: https://sudokupad.app/ehliu8yyko

// Rules encoded here, over a 9x9 play grid surrounded by a one-cell ring of
// outside-clue cells:
//   * Normal Sudoku: digits 1-9 once per row, column and 3x3 box of the play
//     grid. The ring is outside the grid and carries no Sudoku rule.
//   * X-Sums: a number in the ring is the sum of the first X digits of the row
//     or column it faces, read from that number, where X is the digit in the
//     cell nearest it.
//   * German whispers: adjacent numbers along a green line differ by at least 5.
//   * Kropki: a white dot means consecutive, a black dot means a 2:1 ratio.
//     Only the drawn dots are constrained -- the rules state no negative
//     constraint, so unmarked pairs are free.
//   * Numbers may not repeat in a cage: one cage is drawn, over four ring cells.
// The green lines and several dots run through ring cells, so the X-Sum totals
// themselves take part in the whisper, Kropki and cage rules. No total is
// printed in the source; each is solved for.
// "For the answer check to work, no large digits should be entered outside the
// grid" is a note about the source's answer check, not a rule about the final
// grid: the answer is the 9x9 play grid, with the ring left blank.
// The source also draws eighteen invisible no-repeat cages that duplicate the
// nine rows and nine columns of the play grid; they add nothing to the Sudoku
// rules above and are not re-encoded.

// Value 0 is here only for the Var digits below; grid cells are pinned to 1-9.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// An X-Sum total runs up to 9+8+7+6+5+4+3+2+1 = 45, past the 16-value ceiling on
// a single ISS cell, so each total is held as two Var cells -- its tens and
// units digits -- and read back as 10*tens + units. The bound also caps the
// tens digit at 4, which keeps the state machines below small.
const MAX_TENS = 4;

// The thirteen ring cells that carry a clue, from the drawn art: N/S name the
// cell above/below a column, W/E the cell left/right of a row. `scan` is that
// row or column read away from the clue, nearest cell first.
const CLUES = [
  { key: 'N1', scan: graph.ray('R1C1', 1, 0) },
  { key: 'N4', scan: graph.ray('R1C4', 1, 0) },
  { key: 'N5', scan: graph.ray('R1C5', 1, 0) },
  { key: 'W1', scan: graph.ray('R1C1', 0, 1) },
  { key: 'W2', scan: graph.ray('R2C1', 0, 1) },
  { key: 'W9', scan: graph.ray('R9C1', 0, 1) },
  { key: 'E4', scan: graph.ray('R4C9', 0, -1) },
  { key: 'E5', scan: graph.ray('R5C9', 0, -1) },
  { key: 'E6', scan: graph.ray('R6C9', 0, -1) },
  { key: 'E7', scan: graph.ray('R7C9', 0, -1) },
  { key: 'E9', scan: graph.ray('R9C9', 0, -1) },
  { key: 'S1', scan: graph.ray('R9C1', -1, 0) },
  { key: 'S9', scan: graph.ray('R9C9', -1, 0) },
];

const tensVar = new Var('T', 'x-sum totals: tens digit', CLUES.length);
const unitsVar = new Var('U', 'x-sum totals: units digit', CLUES.length);

const clueIndex = new Map(CLUES.map((clue, i) => [clue.key, i + 1]));
const isClue = node => clueIndex.has(node);
// The two cells holding one total, in the order every machine below reads them.
const totalCells = key => [tensVar.cell(clueIndex.get(key)), unitsVar.cell(clueIndex.get(key))];

// Green lines, in drawn order; consecutive entries are the whisper pairs. Steps
// may be diagonal, and a line may leave and re-enter the play grid.
const LINES = [
  ['R2C5', 'R1C5', 'N5', 'N4', 'R1C4', 'R2C4', 'R1C3', 'R1C2', 'N1', 'W1', 'R2C1', 'R3C2'],
  ['R7C9', 'R8C9', 'E9', 'S9', 'R9C8', 'R9C7', 'R9C6'],
  ['S1', 'W9', 'R8C1', 'R7C2'],
  ['R8C8', 'R7C7'],
];

// The drawn dots, black then white.
const BLACK_DOTS = [
  ['N4', 'N5'], ['W2', 'R2C1'], ['E4', 'E5'], ['E5', 'E6'], ['E6', 'E7'],
  ['R8C1', 'R9C1'], ['R7C5', 'R7C6'],
];
const WHITE_DOTS = [['R9C1', 'S1']];

// The single drawn cage: four ring cells, no printed total, no-repeat flag set.
const CAGE = ['E4', 'E5', 'E6', 'E7'];

// --- State machines over totals held as two cells -------------------------
// A relation involving a total cannot use the named Whisper/BlackDot/WhiteDot
// classes, because the total is spread over two cells. Each machine below
// reassembles 10*tens + units as it reads and then applies `pred` to the pair.
// `pred` is the rule itself; all four are symmetric, so the order the two
// operands appear in the cell list does not matter.

const whisperPred = (a, b) => Math.abs(a - b) >= 5;
const blackDotPred = (a, b) => a === 2 * b || b === 2 * a;
const whiteDotPred = (a, b) => Math.abs(a - b) === 1;
const distinctPred = (a, b) => a !== b;

// Reads <tens, units, tens, units>: a relation between two ring totals.
const totalPairNFA = pred => NFA.encodeSpec({
  startState: { read: 0 },
  transition: (state, value) => {
    switch (state.read) {
      case 0: return value > MAX_TENS ? undefined : { read: 1, a: value * 10 };
      case 1: return { read: 2, a: state.a + value };
      case 2: return value > MAX_TENS ? undefined : { read: 3, a: state.a, b: value * 10 };
      case 3: return pred(state.a, state.b + value) ? { read: 4 } : undefined;
      default: return undefined;
    }
  },
  accept: state => state.read === 4,
}, shape);

// Reads <tens, units, digit>: a relation between a ring total and a grid digit.
const totalDigitNFA = pred => NFA.encodeSpec({
  startState: { read: 0 },
  transition: (state, value) => {
    switch (state.read) {
      case 0: return value > MAX_TENS ? undefined : { read: 1, a: value * 10 };
      case 1: return { read: 2, a: state.a + value };
      case 2: return pred(state.a, value) ? { read: 3 } : undefined;
      default: return undefined;
    }
  },
  accept: state => state.read === 3,
}, shape);

// Reads <tens, units> then the nine cells of the clued row or column, nearest
// the clue first. The first grid cell read is X: it is both the count of digits
// to add and the first of them, so `left` starts at X-1 and `need` at
// total - X. Digits past the Xth are read but ignored.
const X_SUM = NFA.encodeSpec({
  startState: { read: 'tens' },
  transition: (state, value) => {
    if (state.read === 'tens') {
      return value > MAX_TENS ? undefined : { read: 'units', tens: value };
    }
    if (state.read === 'units') {
      return { read: 'first', total: state.tens * 10 + value };
    }
    if (state.read === 'first') {
      // A grid digit is never 0; rejecting it here also bounds `left` below.
      if (value === 0 || value > state.total) return undefined;
      return { read: 'scan', left: value - 1, need: state.total - value };
    }
    if (state.left === 0) return state.need === 0 ? state : undefined;
    if (value > state.need) return undefined;
    return { read: 'scan', left: state.left - 1, need: state.need - value };
  },
  accept: state => state.read === 'scan' && state.left === 0 && state.need === 0,
}, shape);

const WHISPER_TT = totalPairNFA(whisperPred);
const WHISPER_TD = totalDigitNFA(whisperPred);
const BLACK_TT = totalPairNFA(blackDotPred);
const BLACK_TD = totalDigitNFA(blackDotPred);
const WHITE_TT = totalPairNFA(whiteDotPred);
const WHITE_TD = totalDigitNFA(whiteDotPred);
const DISTINCT_TT = totalPairNFA(distinctPred);

// One drawn pair with at least one ring total on it.
const ringPair = (label, totalTotal, totalDigit, a, b) => {
  const [total, other] = isClue(a) ? [a, b] : [b, a];
  const name = `${label} ${a}-${b}`;
  return isClue(other)
    ? new NFA(totalTotal, name, ...totalCells(total), ...totalCells(other))
    : new NFA(totalDigit, name, ...totalCells(total), other);
};

// --- Constraint groups ----------------------------------------------------

const xSums = CLUES.map(
  clue => new NFA(X_SUM, `x-sum ${clue.key}`, ...totalCells(clue.key), ...clue.scan));

// Split a line at its ring cells: each remaining run of two or more grid cells
// is one Whisper, and every pair touching a ring cell is a machine.
const gridRuns = (nodes) => {
  const runs = [[]];
  for (const node of nodes) {
    if (isClue(node)) runs.push([]);
    else runs[runs.length - 1].push(node);
  }
  return runs.filter(run => run.length > 1);
};
const linePairs = nodes => nodes.slice(1).map((node, i) => [nodes[i], node]);

const whispers = [
  ...LINES.flatMap(gridRuns).map(run => new Whisper(5, ...run)),
  ...LINES.flatMap(linePairs)
    .filter(([a, b]) => isClue(a) || isClue(b))
    .map(([a, b]) => ringPair('whisper', WHISPER_TT, WHISPER_TD, a, b)),
];

const kropki = [
  ...BLACK_DOTS.map(([a, b]) => (isClue(a) || isClue(b))
    ? ringPair('black dot', BLACK_TT, BLACK_TD, a, b)
    : new BlackDot(a, b)),
  ...WHITE_DOTS.map(([a, b]) => (isClue(a) || isClue(b))
    ? ringPair('white dot', WHITE_TT, WHITE_TD, a, b)
    : new WhiteDot(a, b)),
];

// All-different over totals held as two cells each is the pairwise inequality
// of the cage's six pairs.
const cage = CAGE.flatMap(
  (a, i) => CAGE.slice(i + 1).map(
    b => new NFA(DISTINCT_TT, `cage ${a}-${b}`, ...totalCells(a), ...totalCells(b))));

return [
  shape,
  tensVar,
  unitsVar,
  // Grid cells hold 1-9; the extra value 0 belongs to the Var digits only.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...xSums,
  ...whispers,
  ...kropki,
  ...cage,
];
