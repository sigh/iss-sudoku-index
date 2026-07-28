// Title: Crest of the Zora
// Author: Wei-Hwa Huang
// Video: https://www.youtube.com/watch?v=83J-IuhRL2M
// Source: https://sudokupad.app/4GB8MR92N4

// Rules: Place 0-9 in each row, column and outlined region. A cell with a
// slash features two digits, the digit with the smaller value appearing
// above the larger one. The orientations of the slashes are purely
// decorative.
//
// Every row, column and region has six cells but must hold all ten digits
// 0-9, so a fixed set of cells (marked with a diagonal slash in the source
// art) each carry two digits; every other cell carries one. Each unit works
// out to exactly four slash cells and two single cells (4*2 + 2*1 = 10), so
// this is consistent across every row, column and region -- see the
// AllDifferent groups below.
//
// A slash cell's second digit is modelled as a same-cell Var overlay
// ("VD#"). The main-grid slot always holds the smaller of the cell's two
// digits and the Var slot the larger (the `slashOrder` Pair below), matching
// the stated "smaller above larger" rule; this also lets a slash-cell given
// bind a specific slot below (see SLASH_GIVENS_SMALLER/_LARGER) instead of
// either one. The slash orientation itself (which corner the drawn line
// points to) carries no information, per the rules text, and is not
// modelled.

const shape = new Shape('6x6', '0-9');

// Cells carrying a diagonal slash mark (drawn corner-to-corner within the
// cell) hold two digits; transcribed from the source art's slash-line
// geometry, row-major.
const SLASH_CELLS = [
  'R1C1', 'R1C2', 'R1C5', 'R1C6',
  'R2C2', 'R2C3', 'R2C4', 'R2C5',
  'R3C1', 'R3C3', 'R3C4', 'R3C6',
  'R4C1', 'R4C2', 'R4C5', 'R4C6',
  'R5C1', 'R5C3', 'R5C4', 'R5C6',
  'R6C2', 'R6C3', 'R6C4', 'R6C5',
];

const secondDigit = new Var('D', 'slash cell: second digit', SLASH_CELLS.length);
const auxCell = new Map(SLASH_CELLS.map((cell, i) => [cell, secondDigit.cell(i + 1)]));

// The six single-digit cells' given digits, transcribed from the source
// art's printed givens.
const SINGLE_GIVENS = {
  'R1C3': 4, 'R1C4': 3,
  'R5C2': 4, 'R5C5': 9,
  'R6C1': 9, 'R6C6': 0,
};

// One known digit per slash cell (its counterpart digit is unknown),
// transcribed from the source art's overlay numerals. Each overlay is drawn
// in either the upper or lower half of its cell; per "the digit with the
// smaller value appearing above the larger one" that half tells us which of
// the cell's two digits this given is, so it binds the main-grid (smaller)
// or Var (larger) slot directly rather than either one.
const SLASH_GIVENS_SMALLER = {
  'R2C3': 6, 'R2C4': 8,
  'R3C1': 7, 'R3C6': 1,
  'R6C2': 6, 'R6C5': 5,
};
const SLASH_GIVENS_LARGER = {
  'R5C1': 2, 'R5C6': 7,
};

const givens = [
  ...Object.entries(SINGLE_GIVENS).map(([cell, v]) => new Given(cell, v)),
  ...Object.entries(SLASH_GIVENS_SMALLER).map(([cell, v]) => new Given(cell, v)),
  ...Object.entries(SLASH_GIVENS_LARGER).map(
    ([cell, v]) => new Given(auxCell.get(cell), v)),
];

// main-grid slot < Var slot for every slash cell (see header note).
const slashOrderKey = Pair.fnToKey((a, b) => a < b, shape);
const slashOrder = SLASH_CELLS.map(cell => new Pair(
  slashOrderKey, 'slash cell: smaller digit above larger', cell, auxCell.get(cell)));

// Every row, column and region must hold all ten digits 0-9 across its six
// cells (four slash cells and two single cells): an AllDifferent over the
// unit's ten slots -- its six grid cells plus the second-digit Vars of
// whichever of them are slash cells -- forces exact coverage of 0-9 by
// pigeonhole, since the slot count equals the value count.
const graph = cellGraph(shape);
const unitSlots = (cells) => cells.flatMap(
  cell => auxCell.has(cell) ? [cell, auxCell.get(cell)] : [cell]);
const unitGroups = graph.rowsColumnsBoxes().map(cells => new AllDifferent(...unitSlots(cells)));

return [
  shape,
  secondDigit,
  ...givens,
  ...slashOrder,
  ...unitGroups,
];
