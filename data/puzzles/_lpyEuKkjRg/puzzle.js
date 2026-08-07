// Title: /4 /5
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=_lpyEuKkjRg
// Source: https://app.crackingthecryptic.com/sudoku/pM7jd2QbmD

// Rules encoded here:
//  1. Normal sudoku rules apply.
//  2. Cells marked with a circle contain an odd digit; cells marked with a
//     square contain an even digit. No circle/square is pre-drawn in this
//     puzzle -- every occurrence of a mark comes from where the pattern in
//     rule 4 ends up placed.
//  3. Two neighbouring digits along a green line have a difference of at
//     least 5. One green line is drawn directly in the grid, R1C3-R2C2;
//     that instance holds unconditionally.
//  4. This pattern of clues must be placed, unrotated and unmirrored, fully
//     inside the grid, at 7 distinct top-left anchor positions:
//       square  line   square
//       line    five   circle
//       square  circle circle
//     (the rules-text ascii art, read top-left to bottom-right; "line" marks
//     the two cells joined by the pattern's own diagonal green line, "five"
//     is a given digit 5). Placements may overlap each other or the fixed
//     clues in rule 3 above; every resulting circle/square/line/five holds
//     wherever it lands, and if two placements disagree on a shared cell
//     both must still be satisfied. Digits may repeat within one placement,
//     so no AllDifferent applies to a placement's own 9 cells.
// Nothing else is omitted.
//
// The one drawn line (R1C3-R2C2) cannot itself be an active placement's line:
// that would force its anchor to R1C2 and its centre (R2C3) to 5, but R2C3 is
// given as 4. So it is encoded as an unconditional Whisper, independent of
// rule 4, and the conflict simply keeps R1C2 out of the solver's choice of 7
// anchors.
//
// A boolean "active" flag per anchor (VA, 7 rows x 7 columns, one per
// possible top-left corner, values 1 = inactive / 2 = active) lets the
// solver choose which 7 of the 49 legal anchors are used; Sum forces exactly
// 7 active flags (42 inactive * 1 + 7 active * 2 = 56). For every anchor and
// each of its 7 non-line marked cells (3 squares, 3 circles, the centre
// five), a Pair conditions that grid cell on the flag: inactive says
// nothing, active applies the mark. The anchor's own line pair is
// conditioned by a 3-cell NFA (flag, lineCellA, lineCellB) so the
// difference-of->=5 rule applies to that pair only when the anchor is
// active.

const NUM_VALUES = 9;

const flags = new Var('A', 'pattern anchor active', '7x7');
const flagDomains = flags.cells().map(cell => new Given(cell, 1, 2));
const activeCount = new Sum(56, ...flags.cells());

// Relative offsets (dRow, dCol) of the pattern's marked cells from its
// top-left anchor, read off the rules-text ascii art.
const SQUARES = [[0, 0], [0, 2], [2, 0]];
const CIRCLES = [[1, 2], [2, 1], [2, 2]];
const CENTER = [1, 1];
const LINE = [[0, 1], [1, 0]];

// Flag value 1 = inactive (anything allowed); 2 = active (mark applies).
const evenKey = Pair.fnToKey((flag, v) => flag === 1 || v % 2 === 0, NUM_VALUES);
const oddKey = Pair.fnToKey((flag, v) => flag === 1 || v % 2 === 1, NUM_VALUES);
const fiveKey = Pair.fnToKey((flag, v) => flag === 1 || v === 5, NUM_VALUES);

// Reads (flag, lineCellA, lineCellB) in order. Inactive flag: accept
// regardless of the two cell values. Active flag: remember lineCellA's
// value, then require the two line cells to differ by at least 5.
const lineDiffSpec = NFA.encodeSpec({
  startState: null,
  transition: (state, value) => {
    if (state === null) return value === 2 ? 'awaitA' : 'free';
    if (state === 'free') return 'free';
    if (state === 'awaitA') return { a: value };
    if (typeof state === 'object') {
      return Math.abs(state.a - value) >= 5 ? 'ok' : undefined;
    }
    return undefined;
  },
  accept: (state) => state === 'free' || state === 'ok',
}, NUM_VALUES);

const patternMarks = [];
for (let topRow = 1; topRow <= 7; topRow++) {
  for (let topCol = 1; topCol <= 7; topCol++) {
    const flag = flags.cell(topRow, topCol);
    const at = ([dRow, dCol]) => makeCellId(topRow + dRow, topCol + dCol);
    for (const off of SQUARES) {
      patternMarks.push(new Pair(evenKey, 'pattern-even', flag, at(off)));
    }
    for (const off of CIRCLES) {
      patternMarks.push(new Pair(oddKey, 'pattern-odd', flag, at(off)));
    }
    patternMarks.push(new Pair(fiveKey, 'pattern-five', flag, at(CENTER)));
    patternMarks.push(
      new NFA(lineDiffSpec, 'pattern-line', flag, at(LINE[0]), at(LINE[1])));
  }
}

return [
  new Shape('9x9'),
  new Given('R2C3', 4),
  new Whisper(5, 'R1C3', 'R2C2'),
  flags,
  ...flagDomains,
  activeCount,
  ...patternMarks,
];
