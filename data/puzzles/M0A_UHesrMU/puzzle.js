// Title: Strange Dream
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=M0A_UHesrMU
// Source: https://sudokupad.app/xmr3yscqzn?setting-digitoutlines=0

// 6x6 grid, standard 2x3 boxes (rows0-1/2-3/4-5 x cols0-2/3-5, per the
// payload's own `regions`, which match ISS's default 6x6 box tiling).
// Rules text: "Place a digit from 1-9 ... every digit appears once in every
// row, column, and box" -- a widened 1-9 value range in 6-cell rows/columns/
// boxes, so read as "no repeats" (a row/column/box cannot hold all 9 values
// anyway).
//
// DREAM CELLS: R1C1, R2C4, R3C2, R4C5, R5C3, R6C6 each carry a light-grey
// circle with a "Z" stroke confined to that single cell (a "ZZZ" dream-bubble
// motif, matching the title "Strange Dream" / video title "'Dreams' Of Being
// 9x9"; three of the six additionally have a short diagonal highlight
// coinciding with that cell's Little Killer diagonal). These six cells are
// exactly one per row, one per column, and one per box (a transversal), and
// the setter's own solution leaves precisely these six cells blank -- while
// three of them are pinned by a Little Killer sum below to a value that
// repeats elsewhere in their row/column, which a normal 1-9 all-different
// would forbid. Read together, these are "dream" cells exempt from the row/
// column/box all-different that the rules-text paragraph states for the
// other 30 cells -- the digit "shown" there does not have to be distinct
// from its row/column/box mates.
//
// ISS always enforces row/column all-different on every main-grid cell
// (there is no `NoBoxes` equivalent for rows/columns), so a dream cell
// cannot sit in the main grid as a real 1-9 digit without wrongly
// forbidding it from repeating. Instead:
// each dream cell is pinned to a shared sentinel value (10, via a widened
// Shape) that cannot equal any real 1-9 digit, so it trivially satisfies
// every row/column/box all-different it belongs to; no two dream cells ever
// share a row, column or box (they are a transversal), so one shared
// sentinel is safe for all six. Where a dream cell's actual digit matters to
// another rule (the cage, or a Little Killer sum), that digit instead lives
// in a same-named `Var` with the true 1-9 domain, used in place of the main
// grid cell in that rule.

const SENTINEL = 10;
const DREAM_CELLS = ['R1C1', 'R2C4', 'R3C2', 'R4C5', 'R5C3', 'R6C6'];

const allCells = [];
for (let r = 1; r <= 6; r++) for (let c = 1; c <= 6; c++) allCells.push(makeCellId(r, c));

// Pin every dream cell to the sentinel, and every other cell to a real digit
// (excluding the sentinel), so the widened value range only ever matters at
// the six dream cells.
const cellRangeGivens = allCells.map(cell => DREAM_CELLS.includes(cell)
  ? new Given(cell, SENTINEL)
  : new Given(cell, 1, 2, 3, 4, 5, 6, 7, 8, 9));

// The dream cells' real digits, used only where another rule needs them.
// D1=R1C1, D2=R2C4, D3=R3C2, D4=R4C5 (R5C3 and R6C6 are not referenced by any
// other rule, so they need no stand-in).
const dream = new Var('D', 'dream digit', 4);
const dreamDigitGivens = dream.cells().map(cell => new Given(cell, 1, 2, 3, 4, 5, 6, 7, 8, 9));
const [D1, D2, D3, D4] = dream.cells();

// KILLER: one no-total cage, digits may not repeat within it. The cage has
// no drawn `cages` entry (the payload's single `cages[0]` is an empty
// metadata stub); its shape was instead recovered from ~86 small hand-drawn
// dash overlays that trace a dashed border around R2C3,R2C4,R3C3,R3C4. The
// border wiggles slightly near R2C4 and R3C2 to route around the dream-cell
// marks described above; those wiggles do not reach a full extra cell width,
// so they are read as visual routing, not additional cage cells. R2C4 is a
// dream cell, so its stand-in D2 is used in its place.
const cage = new AllDifferent('R2C3', D2, 'R3C3', 'R3C4');

// SILENT LITTLE KILLER: a cell with a diagonal arrow contains the sum of the
// digits strictly beyond it, in the direction the arrow points, out to the
// grid edge (the arrow cell's own value is not part of its own sum -- the
// classic outside-the-grid Little Killer ray, just anchored inside the grid
// instead of at a corner). Encoded with `Arrow(cell, ...armCellsInDirection)`.
// Three arrow cells (R2C4, R3C2, R4C5) are dream cells; their stand-ins
// (D2, D3, D4) are used as the Arrow's control cell. One arm cell (R1C1) is
// also a dream cell; its stand-in D1 is used there.
const littleKillers = [
  new Arrow(D2, 'R1C3'),
  new Arrow('R2C2', D1),
  new Arrow('R3C1', 'R2C2', 'R1C3'),
  new Arrow(D3, 'R2C1'),
  new Arrow('R3C4', 'R2C5', 'R1C6'),
  new Arrow(D4, 'R3C6'),
  new Arrow('R6C4', 'R5C5', 'R4C6'),
];

// THERMO: omitted. The rules text names a THERMO rule, but the only
// candidate geometry is the six dream-cell marks described above -- each is
// confined entirely to its own single cell (verified by plotting; no stroke
// reaches an adjacent cell), so there is no recoverable multi-cell
// thermometer path.

return [
  new Shape('6x6', SENTINEL),
  ...cellRangeGivens,
  dream,
  ...dreamDigitGivens,
  cage,
  ...littleKillers,
];
