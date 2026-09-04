// Title: First Hidden Skyscraper Sudoku
// Author: Laura Soler
// Video: https://www.youtube.com/watch?v=_Q9E_AUdzN0
// Source: https://cracking-the-cryptic.web.app/sudoku/n7hqf83H9P

// Normal sudoku rules apply (rows, columns and boxes all different -- the ISS
// default for a 9x9 Shape). Digits double as building heights; scanning a row
// or column from one of its outside clues into the grid, a building is
// "hidden" once a strictly taller one has already appeared earlier in the
// scan, and each outside clue gives the height of the first hidden building
// in that line of sight. HiddenSkyscraper implements exactly this rule for
// one line, given the line's cells ordered from the clue end inward.
//
// There are zero given digits and no cages, lines or arrows drawn -- the 36
// outside clues (one per row end and one per column end, all four sides
// fully clued) are the puzzle's entire content.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Outside-clue values, transcribed from the overlays drawn along all four
// sides, indexed by row (LEFT/RIGHT) or column (TOP/BOTTOM) 1-9.
const LEFT = [2, 6, 5, 6, 1, 2, 5, 5, 1];
const RIGHT = [1, 5, 5, 1, 2, 4, 5, 7, 2];
const TOP = [1, 6, 4, 2, 6, 1, 4, 5, 2];
const BOTTOM = [2, 5, 4, 1, 2, 4, 4, 4, 1];

const outsideClues = [];
for (let n = 1; n <= 9; n++) {
  // Left/right clues view row n from C1 rightward / from C9 leftward.
  outsideClues.push(
    HiddenSkyscraper.fromCells(
      LEFT[n - 1], graph.ray(makeCellId(n, 1), 0, 1), geometry));
  outsideClues.push(
    HiddenSkyscraper.fromCells(
      RIGHT[n - 1], graph.ray(makeCellId(n, 9), 0, -1), geometry));
  // Top/bottom clues view column n from R1 downward / from R9 upward.
  outsideClues.push(
    HiddenSkyscraper.fromCells(
      TOP[n - 1], graph.ray(makeCellId(1, n), 1, 0), geometry));
  outsideClues.push(
    HiddenSkyscraper.fromCells(
      BOTTOM[n - 1], graph.ray(makeCellId(9, n), -1, 0), geometry));
}

return [
  new Shape('9x9'),
  ...outsideClues,
];
