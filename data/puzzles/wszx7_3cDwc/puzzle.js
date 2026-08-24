// Title: Build Your Own Little Killer
// Author: Qinlux
// Video: https://www.youtube.com/watch?v=wszx7_3cDwc
// Source: https://app.crackingthecryptic.com/sudoku/83RBg4Qh4m

// Normal sudoku rules apply (standard 9x9, rows/cols/boxes).
//
// Each of the 7 coloured cages forms a number from its own digits: a
// single-cell cage is that digit; a two-cell cage reads its two digits as a
// two-digit number in the direction the cage runs (left-to-right for a
// horizontal cage, downwards for a vertical one -- both are the orientations
// actually drawn). That number equals the sum of the digits (repeats
// allowed) along the little-killer-style diagonal drawn in the same colour,
// which runs from an on-grid edge cell to the opposite edge -- the standard
// diagonal-outside-clue reading, just with the clue's own value read off a
// cage instead of printed.
//
// The colour/cage/diagonal correspondence and each diagonal's start
// cell + direction come from matching each colour's drawn underlay cells
// (2-3 cells: the cage cells plus one off-grid "bulb" cell placed where the
// diagonal's little-killer marker sits) against the drawn arrow bulbs --
// both give the same coordinates for every colour. The red colour's cage
// (R7C2,R7C3) has *two* off-grid bulb cells, at two different edges, so it
// clues two independent diagonals that both must sum to the same red cage
// number; every other colour has exactly one off-grid bulb / one diagonal.
// This is read from the drawn geometry, not assumed: there are 8 drawn
// little-killer arrows but only 7 coloured cages, so one colour necessarily
// doubles up, and the underlay coordinates identify red as the doubled
// colour and name both its diagonals unambiguously.
//
// Cage digits are not required to be distinct from each other (the rules
// only say they read as a number); no AllDifferent is added for cage cells.

const shape = new Shape('9x9');

// Walk a diagonal from an on-grid edge cell (row, col), 1-indexed, in
// direction (dr, dc) until it leaves the grid.
function diagonal(row, col, dr, dc) {
  const cells = [];
  for (; row >= 1 && row <= 9 && col >= 1 && col <= 9; row += dr, col += dc) {
    cells.push(makeCellId(row, col));
  }
  return cells;
}

// selfCluedDiagonal: the digits on `diagCells` (repeats allowed) sum to the
// two-digit (or, with no onesCell, single-digit) number read from the
// coloured cage's own cell(s). The one-digit case is a plain two-segment
// equal sum (diagCells vs. the single cage cell); the two-digit case needs
// the tens cell weighted x10, so it is a coefficient Sum instead.
function selfCluedDiagonal(diagCells, tensCell, onesCell) {
  if (onesCell === null) {
    return new EqualSum([tensCell], diagCells);
  }
  return new Sum(0, ...diagCells, [tensCell, -10], [onesCell, -1]);
}

// Each entry: cage cells in reading order (tens, ones) -- or a single cell
// for a one-digit cage -- and the diagonal(s) it clues, each given as
// [startRow, startCol, dRow, dCol]. Coordinates and directions taken from
// the coloured underlay cells / arrow bulbs in the payload.
const clues = [
  // blue #34BBE6: cage R2C3,R2C4 (horizontal); diagonal from R3C1 down-right
  // to R9C7 (7 cells).
  { cage: ['R2C3', 'R2C4'], diagonals: [[3, 1, 1, 1]] },
  // green #A3E048: cage R4C4,R4C5 (horizontal); diagonal from R1C6
  // down-right to R4C9 (4 cells).
  { cage: ['R4C4', 'R4C5'], diagonals: [[1, 6, 1, 1]] },
  // purple #D23BE7: cage R4C2,R5C2 (vertical); diagonal from R7C1
  // down-right to R9C3 (3 cells).
  { cage: ['R4C2', 'R5C2'], diagonals: [[7, 1, 1, 1]] },
  // gold #F7D038: cage R8C1,R9C1 (vertical); diagonal from R7C9 down-left
  // to R9C7 (3 cells).
  { cage: ['R8C1', 'R9C1'], diagonals: [[7, 9, 1, -1]] },
  // brown #EB7532: cage R4C8,R5C8 (vertical); diagonal from R4C9 down-left
  // to R9C4 (6 cells; shares cell R5C8 with the cage itself).
  { cage: ['R4C8', 'R5C8'], diagonals: [[4, 9, 1, -1]] },
  // grey #CFCFCF: single-cell cage R9C7 (one digit, no tens cell); diagonal
  // from R1C8 down-right to R2C9 (2 cells).
  { cage: ['R9C7'], diagonals: [[1, 8, 1, 1]] },
  // red #E6261F: cage R7C2,R7C3 (horizontal); TWO diagonals, both summing
  // to the same red cage number -- from R1C9 down-left to R9C1 (9 cells,
  // the full antidiagonal; shares cell R7C3 with the cage) and from R6C1
  // down-right to R9C4 (4 cells; shares cell R7C2 with the cage).
  { cage: ['R7C2', 'R7C3'], diagonals: [[1, 9, 1, -1], [6, 1, 1, 1]] },
];

const selfCluedSums = clues.flatMap(({ cage, diagonals }) => {
  const [tensCell, onesCell] = cage.length === 2 ? cage : [cage[0], null];
  return diagonals.map(([row, col, dr, dc]) =>
    selfCluedDiagonal(diagonal(row, col, dr, dc), tensCell, onesCell));
});

return [
  shape,
  ...selfCluedSums,
];
