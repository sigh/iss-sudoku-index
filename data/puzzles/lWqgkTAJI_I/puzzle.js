// Title: Squarrows
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=lWqgkTAJI_I
// Source: https://app.crackingthecryptic.com/sudoku/3dn76m4hfp

// Normal sudoku rules apply (9x9, default rows/columns/boxes -- the drawn
// regions match the default 3x3 tiling).
//
// Arrows: digits along each arrow sum to the number in its connecting pill
// (2-digit, read left-to-right or top-to-bottom) or circle (1-digit) --
// PillArrow / Arrow below. Arm and pill/circle cells are traced from the
// drawn arrow paths.
//
// Four of the pills are additionally "highlighted" (drawn with a coloured
// cell background): each must show a 2-digit perfect square, and no two of
// the four highlighted pills may show the same square. The only 2-digit squares
// usable with sudoku digits 1-9 (no zero) are 16, 25, 36, 49, 64, 81. This
// is a shared-but-unlabelled derived value with no native sudoku tie, so it
// is enumerated directly: an auxiliary index Var per highlighted pill picks
// which of the 6 squares that pill shows (via Given pinning the pill's two
// digits and the index together), and AllDifferent over the four indices
// forbids two pills from picking the same square.
//
// One white dot is drawn (R1C8-R2C8): its two digits are consecutive. The
// rules say "Not all white dots are shown", so no negative dot constraint
// is added elsewhere on the grid.

const givens = [
  new Given('R2C2', 9),
  new Given('R5C9', 2),
];

// Pill arrows: { pill: [cell read first, cell read second], arm: [...] }.
const pillArrows = [
  { pill: ['R1C1', 'R2C1'], arm: ['R3C1', 'R2C2', 'R1C3', 'R1C4', 'R2C3', 'R3C2'] },
  { pill: ['R1C9', 'R2C9'], arm: ['R3C9', 'R2C8', 'R1C7', 'R1C6', 'R2C7', 'R3C8', 'R4C9', 'R5C9', 'R4C8', 'R3C7', 'R2C6', 'R1C5', 'R2C5', 'R3C5'] },
  { pill: ['R4C4', 'R5C4'], arm: ['R3C4', 'R4C3', 'R5C3'] },
  { pill: ['R4C6', 'R5C6'], arm: ['R3C6', 'R4C7', 'R5C7'] },
  { pill: ['R9C1', 'R9C2'], arm: ['R9C3', 'R8C2', 'R7C1', 'R6C1', 'R7C2', 'R8C3', 'R9C4', 'R9C5', 'R8C4', 'R7C3', 'R6C2', 'R5C1'] },
  { pill: ['R9C8', 'R9C9'], arm: ['R9C7', 'R8C8', 'R7C9', 'R6C9', 'R7C8', 'R8C7', 'R9C6'] },
];

const pillArrowConstraints = pillArrows.map(
  ({ pill, arm }) => new PillArrow(2, ...pill, ...arm));

const circleArrowConstraint = new Arrow('R6C5', 'R7C4', 'R7C5', 'R7C6');

// The four highlighted pills (drawn with a coloured cell background):
// R1C1/R2C1 (pillArrows[0]), R1C9/R2C9 (pillArrows[1]), R9C1/R9C2
// (pillArrows[4]), R9C8/R9C9 (pillArrows[5]).
const highlightedPills = [
  pillArrows[0].pill,
  pillArrows[1].pill,
  pillArrows[4].pill,
  pillArrows[5].pill,
];
// Digit pairs (reading order) for the six 2-digit perfect squares usable
// with sudoku digits 1-9: 16, 25, 36, 49, 64, 81.
const squareDigitPairs = [[1, 6], [2, 5], [3, 6], [4, 9], [6, 4], [8, 1]];

const squareVar = new Var('Q', 'highlighted-pill square index', highlightedPills.length);
const squareConstraints = [
  squareVar,
  new AllDifferent(...squareVar.cells()),
  ...highlightedPills.map(([hi, lo], i) => new Or(
    squareDigitPairs.map(([d1, d2], j) => new And([
      new Given(hi, d1),
      new Given(lo, d2),
      new Given(squareVar.cell(i + 1), j + 1),
    ]))
  )),
];

const dotConstraint = new WhiteDot('R1C8', 'R2C8');

return [
  new Shape('9x9'),
  ...givens,
  ...pillArrowConstraints,
  circleArrowConstraint,
  ...squareConstraints,
  dotConstraint,
];
