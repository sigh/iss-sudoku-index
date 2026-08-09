// Title: 5 Pluses
// Author: Udo Spemyn
// Video: https://www.youtube.com/watch?v=qmMbZARvuNU
// Source: https://app.crackingthecryptic.com/sudoku/GTdJRB7TPG

// Normal sudoku rules apply, plus:
// - Anti-king: identical digits cannot be a king's-move apart.
// - The (filled) grey circle at R2C2 is an odd digit.
// - Two grey arrows: digits along the arrow sum to the digit in the
//   (grey-outlined) circle at the arrow's bulb; that bulb digit is also odd,
//   since the rules only name one grey-circle clue kind ("the grey circle is
//   an odd digit") and both bulbs are drawn with the same grey styling as the
//   arrow line itself, not as a second, distinct filled clue.
// - Black dots join two cells in a 1:2 ratio; white dots join consecutive
//   digits.
// - Outside clues give the sum of the digits strictly between the 1 and the
//   9 in that row/column (a sandwich clue).
// - Five overlapping plus-shaped regions (two shown shaded, two drawn as
//   dashed no-total cages, one formed by the two red lines crossing) each
//   contain every digit 1-9 once. For each plus, its four three-cell arms
//   (2 outer cells + the shared centre, e.g. r1/2/3c3) sum to values that are
//   either all odd or all even.

// A plus centred at (cr, cc): 4 arms of [outer1, outer2, centre], per the
// rules' own worked example "r1/2/3c3" (up-arm of the centre-R3C3 plus).
const plus = (cr, cc) => {
  const centre = makeCellId(cr, cc);
  const up = [makeCellId(cr - 2, cc), makeCellId(cr - 1, cc), centre];
  const down = [makeCellId(cr + 1, cc), makeCellId(cr + 2, cc), centre];
  const left = [makeCellId(cr, cc - 2), makeCellId(cr, cc - 1), centre];
  const right = [makeCellId(cr, cc + 1), makeCellId(cr, cc + 2), centre];
  const cells = [centre, up[0], up[1], down[0], down[1],
    left[0], left[1], right[0], right[1]];
  return { cells, arms: [up, down, left, right] };
};

// Plus centres, derived from the drawn geometry:
//   A: dashed no-total cage over R1-5C3 / R3C1-5
//   B: grey-shaded cells over R1-5C7 / R3C5-9
//   C: grey-shaded cells over R5-9C3 / R7C1-5
//   D: dashed no-total cage over R5-9C7 / R7C5-9
//   E: the two red lines, crossing at the given R5C5
const PLUSES = [
  { name: 'A', ...plus(3, 3) },
  { name: 'B', ...plus(3, 7) },
  { name: 'C', ...plus(7, 3) },
  { name: 'D', ...plus(7, 7) },
  { name: 'E', ...plus(5, 5) },
];

// Each plus is a 9-cell all-different region holding 1-9 once.
const plusRegions = PLUSES.map(p => new AllDifferent(...p.cells));

// Arm-parity: accumulate each arm's 3-cell sum mod 2 and accept the target
// parity. "All 4 arms odd" or "all 4 arms even" is Or([And([...]), And([...])]).
const parityNFA = (parity) => NFA.encodeSpec({
  startState: 0,
  transition: (sum, v) => (sum + v) % 2,
  accept: (sum) => sum === parity,
}, 9);
const ARM_ODD = parityNFA(1);
const ARM_EVEN = parityNFA(0);
const armParities = PLUSES.map(p => new Or([
  new And(p.arms.map(arm => new NFA(ARM_ODD, `${p.name} arm odd`, ...arm))),
  new And(p.arms.map(arm => new NFA(ARM_EVEN, `${p.name} arm even`, ...arm))),
]));

const row = (r) => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const col = (c) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),
  new Given('R5C5', 1),

  new AntiKing(),

  // Grey filled circle (odd digit): a solid grey-filled circle at R2C2,
  // distinct from the two grey-outlined (white-filled) arrow bulbs below.
  new Given('R2C2', 1, 3, 5, 7, 9),

  // Arrows: bulb first, then the arm cells. Both bulbs are also odd (see
  // header note).
  new Arrow('R4C6', 'R4C5', 'R4C4'),
  new Given('R4C6', 1, 3, 5, 7, 9),
  new Arrow('R6C4', 'R6C5', 'R6C6'),
  new Given('R6C4', 1, 3, 5, 7, 9),

  // Black dots (1:2 ratio) and white dots (consecutive).
  new BlackDot('R4C2', 'R4C3'),
  new BlackDot('R8C2', 'R9C2'),
  new BlackDot('R6C7', 'R6C8'),
  new WhiteDot('R1C8', 'R2C8'),
  new WhiteDot('R8C8', 'R8C9'),

  // Outside sandwich clues: "11" left of row 5, "4" above column 7.
  Sandwich.fromCells(11, row(5), geometry),
  Sandwich.fromCells(4, col(7), geometry),

  ...plusRegions,
  ...armParities,
];
