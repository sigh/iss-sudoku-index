// Title: Sandwich Capsules
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=MWSMiKp-j9Q
// Source: https://app.crackingthecryptic.com/sudoku/Dh3pfFLfnJ

// Normal sudoku rules apply (Shape('9x9') gives rows, columns and boxes
// all-different; the payload's 9 regions are exactly the 9 standard boxes,
// just listed in a non-default order).
//
// "Numbers in the circled cells represent sandwich clues" is read literally,
// not as "a number is printed in/beside each circle": the circled cells are
// ordinary grid cells the solver fills, and the digit(s) placed there are
// what the rule calls the clue's number -- no text overlay carries a printed
// value anywhere in the source payload (every drawn capsule/circle is a bare
// white rounded-rect/circle, no label). That reading is confirmed by the
// rest of the sentence: a two-cell capsule is explicitly "read left to
// right" or "read top to bottom" -- a reading direction only matters for two
// digits the solver places, not a single pre-printed total -- and a
// single-cell circle is "a sandwich clue for either its row or its column,
// to be determined": a single printed number could not itself be
// ambiguous about which axis it clues, but a single solved digit can.
//
// So each two-cell capsule's two digits, concatenated in the stated reading
// direction (tens digit first), equal the sum of the digits strictly
// between the 1 and the 9 of the row (horizontal capsule) or column
// (vertical capsule) it sits in -- a standard sandwich sum, self-clued by
// two of the row/column's own cells rather than a printed number. Each
// single-cell circle's own digit equals the sandwich sum of its row OR its
// column (disjunction: the rules leave the axis for the solver to
// determine, per "Two candidates means disjunction").

const graph = cellGraph('9x9');

// Self-referential sandwich-sum NFA over one 9-cell row or column line.
// `positions` names the 1-based position(s) within the line supplying the
// clue's own value: a single position for a one-cell circle (its own digit
// is the target), or two consecutive positions [tensPos, onesPos] for a
// two-cell capsule (concatenated, tens digit first).
//
// `m` is the usual 3-phase sandwich marker ('NONE' before either 1 or 9 is
// seen, 'ONE' between them, 'BOTH' once both are seen); a cell counts toward
// the interior sum only while m === 'ONE' and is not itself a 1 or a 9.
// Rather than carry the running interior sum and the (not-yet-known) target
// as separate fields -- which multiplies into a large compiled-state count
// once both survive to the end of the scan -- the target is resolved into a
// single running difference `acc` the moment its last supplying cell is
// read: `acc` starts at target minus the interior sum seen so far, and every
// further interior cell subtracts its own value from `acc` (clamped at -1,
// a dead sink, since a negative difference can never recover). The clue
// holds iff acc is back to exactly 0 once both markers have been seen.
// `digits`/`between` are reset to a canonical empty/zero the instant `acc`
// is set, so paths differing only in already-resolved history collapse into
// the same state instead of inflating the compiled count.
const selfSandwichSpec = (positions) => {
  const posSet = new Set(positions);
  const lastPos = Math.max(...positions);
  return NFA.encodeSpec({
    startState: { pos: 0, m: 'NONE', between: 0, digits: [], acc: null },
    transition: (state, value) => {
      const pos = state.pos + 1;
      const isMarker = value === 1 || value === 9;
      const isBetweenCell = state.m === 'ONE' && !isMarker;
      const m = state.m === 'NONE' ? (isMarker ? 'ONE' : 'NONE')
        : state.m === 'ONE' ? (isMarker ? 'BOTH' : 'ONE') : 'BOTH';

      if (state.acc !== null) {
        const acc = isBetweenCell ? Math.max(state.acc - value, -1) : state.acc;
        return { pos, m, between: 0, digits: [], acc };
      }

      let between = state.between;
      if (isBetweenCell) between = Math.min(between + value, 36);
      let digits = state.digits;
      if (posSet.has(pos)) digits = [...digits, value];
      if (pos === lastPos) {
        const target = digits.reduce((t, d) => t * 10 + d, 0);
        const acc = Math.max(target - between, -1);
        return { pos, m, between: 0, digits: [], acc };
      }
      return { pos, m, between, digits, acc: null };
    },
    accept: (state) => state.m === 'BOTH' && state.acc === 0,
    maxDepth: 9,
  }, 9);
};

// Horizontal capsules: row -> the tens-cell's 1-based column (the ones cell
// is the next column over). Provenance: the drawn horizontal two-cell
// capsule underlays.
const horizontalCapsules = [
  { row: 1, tensCol: 1 }, // R1C1-R1C2
  { row: 4, tensCol: 4 }, // R4C4-R4C5
  { row: 5, tensCol: 5 }, // R5C5-R5C6
  { row: 9, tensCol: 6 }, // R9C6-R9C7
  { row: 3, tensCol: 7 }, // R3C7-R3C8
];

// Vertical capsules: column -> the tens-cell's 1-based row (the ones cell is
// the next row down). Provenance: the drawn vertical two-cell capsule
// underlays.
const verticalCapsules = [
  { col: 4, tensRow: 5 }, // R5C4-R6C4
  { col: 2, tensRow: 8 }, // R8C2-R9C2
  { col: 8, tensRow: 4 }, // R4C8-R5C8
];

const capsuleConstraints = [
  ...horizontalCapsules.map(({ row, tensCol }) =>
    new NFA(selfSandwichSpec([tensCol, tensCol + 1]), 'row-capsule-sandwich', graph.row(row))),
  ...verticalCapsules.map(({ col, tensRow }) =>
    new NFA(selfSandwichSpec([tensRow, tensRow + 1]), 'col-capsule-sandwich', graph.column(col))),
];

// Single-cell circles: cell -> its [row, col]. Provenance: the drawn
// single-cell circle underlays. Each is Or'd over "clues its row" / "clues
// its column" per the rules' explicit to-be-determined axis.
const singleCircles = [
  { row: 4, col: 6 }, // R4C6
  { row: 6, col: 5 }, // R6C5
  { row: 6, col: 6 }, // R6C6
];

const circleConstraints = singleCircles.map(({ row, col }) => new Or([
  new NFA(selfSandwichSpec([col]), 'row-sandwich', graph.row(row)),
  new NFA(selfSandwichSpec([row]), 'col-sandwich', graph.column(col)),
]));

return [
  new Shape('9x9'),
  ...capsuleConstraints,
  ...circleConstraints,
];
