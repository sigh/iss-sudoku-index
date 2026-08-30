// Title: A Sudoku With A Single Given Digit - Still Possible?
// Author: Unknown
// Video: https://www.youtube.com/watch?v=2DN32fY63JM
// Source: https://cracking-the-cryptic.web.app/sudoku/9839NjfBpt

// Normal sudoku rules apply: each row, column and 3x3 box holds 1-9 once
// each. One digit is given: R5C4 = 1.
//
// Sandwich: the digits between the 1 and the 9 in a row or column sum to the
// clue printed outside that lane. Clues are drawn left of R1..R9 and above
// C1..C9 (source overlays #9-#17 and #0-#8).
//
// The source publishes no rules text at all. The sandwich reading is reached
// by elimination against ISS's outside-clue catalogue:
// Skyscraper/HiddenSkyscraper/NumberedRoom/FullRank are out of range (this
// puzzle's clues run to 33, those read only 0-9); a little-killer diagonal
// reading is arithmetically impossible for the corner-adjacent clues; XSum is
// arithmetically impossible for "left R9" = 2. Sandwich fits every clue and
// is drawn only above columns / left of rows, matching its class's own
// top-or-left-only restriction.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Sandwich clues as printed, outer lane order R1..R9 and C1..C9 (source
// overlays #9-#17 for rows, #0-#8 for columns).
const rowClues = [16, 7, 3, 14, 11, 21, 19, 33, 2];
const colClues = [8, 23, 16, 15, 23, 13, 30, 27, 3];

const rowSandwiches = rowClues.map(
  (total, i) => Sandwich.fromCells(total, graph.row(i + 1), geometry));

const colSandwiches = colClues.map(
  (total, i) => Sandwich.fromCells(total, graph.column(i + 1), geometry));

return [
  new Shape('9x9'),
  new Given('R5C4', 1),
  ...rowSandwiches,
  ...colSandwiches,
];
