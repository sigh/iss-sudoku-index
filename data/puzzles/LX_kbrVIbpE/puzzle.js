// Title: The Answer to the Ultimate Question (or The Second Best-Kept Secret)
// Author: ViKingPrime
// Video: https://www.youtube.com/watch?v=LX_kbrVIbpE
// Source: https://sudokupad.app/3peflzyncd
//
// Rules encoded: normal Sudoku (rows/columns/boxes all-different, on the real
// 9x9 digit grid) plus COPYCAT: exactly one Copycat cell per row, column and
// box, the 9 Copycat cells hold 9 different digits, and every clue that reads
// a cell's "value" (Arrow, Kropki, Renban, German Whisper, Killer total) uses
// a Copycat cell's 180-degree-rotated partner digit instead of its own digit.
// A 10th grid row is drawn below the puzzle purely as a column-index legend
// ("Digits at the bottom of the grid have been provided for tracking
// purposes") -- it carries no clues and is not modelled.
// Two of the nine emoji-labelled 3x3 boxes carry a Killer total (42); the
// other seven are undecorated box outlines (all-different is already the
// standard box rule, so they add nothing and are not separately encoded).
// Fog is solving UI, not a final-grid rule (never modelled).

const graph = cellGraph('9x9');

// Copycat flag layer: VM[r][c] in {1,2}, 2 = this cell is the Copycat cell
// for its row/column/box. Exactly one 2 per row/column/box (Sum of nine
// 1/2 flags with exactly one 2 is 9*1 + 1 = 10).
const flags = graph.makeOverlay('VM');
const flag = cell => flags.at(cell);

// Copycat "value" layer: VV[r][c] is the quantity every value-reading clue
// uses at that cell -- the cell's own digit normally, or (when flagged) the
// digit of its 180-degree-rotated partner cell.
const values = graph.makeOverlay('VV');
const value = cell => values.at(cell);

// Per-row "which digit does this row's Copycat cell hold" -- used only to
// assert the nine Copycat digits are pairwise different (they sit in
// different rows, so plain row all-different does not cover them).
const copycatDigitPerRow = new Var('VD', 'copycat digit for this row', 9);

function rotatedCell(cell) {
  const { row, col } = parseCellId(cell);
  return makeCellId(10 - row, 10 - col);
}

// Every flag cell's domain is {1,2}; stamp the one Given as a Replicate
// template over the whole overlay instead of 81 individual copies.
const flagDomainGiven = flags.makeReplicate(
  new Given(flags.cells()[0], 1, 2));

const flagCountConstraints = [
  ...graph.rows().map(cells => new Sum(10, ...flags.at(cells))),
  ...graph.columns().map(cells => new Sum(10, ...flags.at(cells))),
  ...graph.boxes().map(cells => new Sum(10, ...flags.at(cells))),
];

// Link VV to the digit grid through VM: value = own digit when not flagged,
// value = rotated partner's digit when flagged.
const valueLinkConstraints = graph.cells().map(cell => new Or([
  new And([new Given(flag(cell), 1), new SameValues(2, value(cell), cell)]),
  new And([new Given(flag(cell), 2), new SameValues(2, value(cell), rotatedCell(cell))]),
]));

// Link copycatDigitPerRow[r] to the digit under whichever cell in row r is
// flagged, then require the nine per-row digits to be pairwise different.
const copycatDigitLinkConstraints = graph.rows().map((cells, i) => {
  const rowDigit = copycatDigitPerRow.cell(i + 1);
  return new Or(cells.map(cell => new And([
    new Given(flag(cell), 2),
    new SameValues(2, rowDigit, cell),
  ])));
});
const copycatDigitsDifferent = new AllDifferent(...copycatDigitPerRow.cells());

// --- Drawn clues, all read through value(cell) per the rules' "value" wording ---

// Pink Renban line: R5C1-R4C1-R3C1-R2C1-R1C1-R1C2-R1C3-R1C4-R1C5 (9 cells).
const renbanLine = ['R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'];

// Green German Whisper, short segment: R5C7-R5C8.
const whisperShort = ['R5C7', 'R5C8'];

// Green German Whisper, closed loop: R7C4-R8C4-R9C4-R9C5-R9C6-R8C6-R7C6-R7C5,
// closed back to R7C4 (first cell repeated to cover the wrap-around edge).
const whisperLoop = ['R7C4', 'R8C4', 'R9C4', 'R9C5', 'R9C6', 'R8C6', 'R7C6', 'R7C5', 'R7C4'];

// White Kropki dots (consecutive), read off the drawn edge marks.
const whiteDotEdges = [
  ['R7C2', 'R7C3'], ['R7C2', 'R8C2'], ['R7C3', 'R8C3'], ['R8C2', 'R8C3'],
  ['R2C7', 'R2C8'], ['R2C7', 'R3C7'], ['R2C8', 'R3C8'], ['R3C7', 'R3C8'],
  ['R5C6', 'R6C6'], ['R6C5', 'R6C6'],
];

// Black Kropki dots (ratio 2), read off the drawn edge marks.
const blackDotEdges = [
  ['R7C1', 'R8C1'], ['R8C1', 'R9C1'],
  ['R1C7', 'R1C8'], ['R1C8', 'R1C9'],
];

// Arrow with bulb R5C5: the drawn path leaves the bulb and visits each of
// its four orthogonal neighbours in turn (R4C5, R5C6, R6C5, R5C4) before the
// arrowhead -- the straight segments between those waypoints are cell-centre
// to cell-centre diagonals through the corners touching R5C5, i.e. one
// continuous arm looping around the bulb, not four separate one-cell arrows
// (which would force all four same-box neighbours to equal digits under a
// digit reading, and are drawn as separate JSON entries elsewhere in this
// payload when that is intended -- see the two R9C9 arrows below).
const arrow0 = { bulb: 'R5C5', arm: ['R4C5', 'R5C6', 'R6C5', 'R5C4'] };

// Two further arrows sharing the R9C9 bulb, each its own drawn entry.
const arrow1 = { bulb: 'R9C9', arm: ['R8C9', 'R7C9'] };
const arrow2 = { bulb: 'R9C9', arm: ['R9C8', 'R9C7'] };

// The two Killer boxes with a stated total (42); box(5) is the centre box
// (R4-6,C4-6), box(8) is R7-9,C4-6.
const killerBoxes = [
  { box: graph.box(5), total: 42 },
  { box: graph.box(8), total: 42 },
];

return [
  new Shape('9x9'),
  flags.toVar('copycat flags'),
  values.toVar('copycat-adjusted values'),
  copycatDigitPerRow,

  flagDomainGiven,
  ...flagCountConstraints,
  ...valueLinkConstraints,
  ...copycatDigitLinkConstraints,
  copycatDigitsDifferent,

  new Renban(...values.at(renbanLine)),
  new Whisper(5, ...values.at(whisperShort)),
  new Whisper(5, ...values.at(whisperLoop)),
  ...whiteDotEdges.map(edge => new WhiteDot(...values.at(edge))),
  ...blackDotEdges.map(edge => new BlackDot(...values.at(edge))),
  new Arrow(value(arrow0.bulb), ...values.at(arrow0.arm)),
  new Arrow(value(arrow1.bulb), ...values.at(arrow1.arm)),
  new Arrow(value(arrow2.bulb), ...values.at(arrow2.arm)),
  ...killerBoxes.map(({ box, total }) => new Sum(total, ...values.at(box))),
];
