// Title: Gameboard
// Author: Nicolas Spindler
// Video: https://www.youtube.com/watch?v=EocvP5eL3n4
// Source: https://sudokupad.app/b2mdMhrdPJ
//
// Rules: white cells must be filled but grey cells without a given digit are
// not filled. Digits cannot repeat in any row or column. A block of white
// cells in a row or column contains a series of consecutive digits in any
// order. No boxes are stated or drawn, so only rows and columns carry the
// no-repeat rule.
//
// The grid is built on the Raw grid type (no implicit rows/columns/boxes)
// with a widened 0-9 alphabet, using 0 as a sentinel meaning "unfilled".
// Every rule below is stated explicitly over the grid's own rows/columns.

const shape = new Shape('9x9', '0-9', 'Raw');
const graph = cellGraph(shape);

// Grey cells: drawn as 24 `#CFCFCF`-filled 1x1 underlays on the board.
const GREY = [
  'R1C1', 'R1C2', 'R1C5', 'R1C9', 'R2C9',
  'R3C3', 'R3C6', 'R3C7',
  'R4C4', 'R4C7', 'R4C8',
  'R5C1', 'R5C9',
  'R6C2', 'R6C3', 'R6C6',
  'R7C3', 'R7C4', 'R7C7',
  'R8C1',
  'R9C1', 'R9C5', 'R9C8', 'R9C9',
];
const isGrey = new Set(GREY);

// Given digits, as printed on the board.
const GIVENS = {
  R1C8: 9, R1C9: 6,
  R3C3: 7, R3C7: 4,
  R4C6: 4, R4C8: 2,
  R6C4: 6, R6C6: 1, R6C9: 4,
  R9C1: 8,
};
const isGiven = cell => Object.prototype.hasOwnProperty.call(GIVENS, cell);

const givens = Object.entries(GIVENS).map(([cell, value]) => new Given(cell, value));

// "Grey cells without a given digit are not filled": pin every such cell to
// the 0 sentinel, so it holds no real digit and cannot conflict with one.
const blanks = GREY.filter(cell => !isGiven(cell));
const blankGivens = blanks.map(cell => new Given(cell, 0));

// A cell actually carries a digit ("is filled") if it is white, or if it is
// grey but carries a printed given -- grey/white decides block membership
// below, not fill status once a digit is drawn on a grey cell.
const isFilled = cell => !isGrey.has(cell) || isGiven(cell);

// Every filled cell needs its domain restricted to the real 1-9 digits
// (excluding the 0 blank sentinel). One Replicate stamps the shared domain
// over the whole filled group; the narrower per-cell Givens above already
// pin the 10 that carry a printed digit, and Givens intersect, so the
// stamped domain changes nothing there and only narrows the other 53 cells.
const allCells = graph.rows().flat();
const filledCells = allCells.filter(isFilled);
const domainGivens = [
  new Replicate(
    [new Given(filledCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)],
    Replicate.encodeTargetCells(filledCells, filledCells[0], graph),
    filledCells[0],
  ),
];

// "Digits cannot repeat in any row or column": all-different over each
// line's filled cells only -- unfilled (blank-pinned) cells are excluded so
// their shared sentinel value 0 is never read as a repeat.
const lineAllDifferent = [...graph.rows(), ...graph.columns()]
  .map(line => line.filter(isFilled))
  .map(cells => new AllDifferent(...cells));

// "A block of white cells in a row or column ... contains a series of
// consecutive digits in any order": Renban (consecutive set, any order)
// over each maximal run of *white* cells (colour, not fill status -- a grey
// cell breaks a run whether or not it carries a given) of length >= 2. A
// length-1 run has no pairwise constraint to add.
function whiteRuns(line) {
  const runs = [];
  let current = [];
  for (const cell of line) {
    if (isGrey.has(cell)) {
      if (current.length >= 2) runs.push(current);
      current = [];
    } else {
      current.push(cell);
    }
  }
  if (current.length >= 2) runs.push(current);
  return runs;
}
const blocks = [...graph.rows(), ...graph.columns()].flatMap(whiteRuns);
const renbans = blocks.map(cells => new Renban(...cells));

return [
  shape,
  ...givens,
  ...blankGivens,
  ...domainGivens,
  ...lineAllDifferent,
  ...renbans,
];
