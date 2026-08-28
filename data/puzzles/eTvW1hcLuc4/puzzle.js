// Title: All our Favourites in One!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=eTvW1hcLuc4
// Source: https://cracking-the-cryptic.web.app/sudoku/rRTthqrm96

// Normal sudoku rules apply (rows, columns and boxes all-different --
// standard for a plain 9x9 Shape). Sandwich: each outside clue is the sum of
// the digits strictly between the 1 and the 9 in its row/column, built from
// the payload's own outside-clue cells via Sandwich.fromCells. Thermometer:
// digits strictly increase away from the filled-circle bulb on each grey
// line. Knight: no repeated digit a knight's move apart (AntiKnight). No
// givens are present in the payload.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Row sandwich sums, R1..R9 (payload outside-clue overlays, left lane).
const rowSandwichSums = [5, 12, 35, 17, 0, 18, 6, 11, 25];
// Column sandwich sums, C1..C9 (payload outside-clue overlays, top lane).
const colSandwichSums = [0, 8, 17, 17, 27, 0, 0, 27, 21];

const rowSandwiches = rowSandwichSums.map(
  (value, i) => Sandwich.fromCells(value, graph.row(i + 1), geometry));
const colSandwiches = colSandwichSums.map(
  (value, i) => Sandwich.fromCells(value, graph.column(i + 1), geometry));

// Thermometers, bulb cell first. Cell paths and bulb ends come from the
// puzzle's 9 grey lines and their circle bulb markers. Two of the drawn
// lines share one bulb cell (R5C4) with a third arm off the same cell, so
// that bulb is split here into 3 separate increasing arms; one other line
// is drawn tip-first and is reversed here to read bulb-first.
const thermoArms = [
  ['R2C3', 'R3C3', 'R3C2', 'R2C2', 'R2C1'],
  ['R6C3', 'R6C2', 'R6C1', 'R5C1', 'R4C1'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R5C4', 'R4C4'],
  ['R5C4', 'R6C4'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R2C5', 'R2C6', 'R3C6'],
  ['R5C7', 'R5C8', 'R6C8', 'R6C7'],
  ['R8C9', 'R8C8', 'R8C7', 'R7C7'],
  ['R6C9', 'R5C9', 'R4C9'],
];
const thermos = thermoArms.map(cells => new Thermo(...cells));

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...rowSandwiches,
  ...colSandwiches,
  ...thermos,
];
