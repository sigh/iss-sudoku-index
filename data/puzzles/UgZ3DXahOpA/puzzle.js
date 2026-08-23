// Title: GDS Sudoku
// Author: Goncalo Sousa
// Video: https://www.youtube.com/watch?v=UgZ3DXahOpA
// Source: https://app.crackingthecryptic.com/sudoku/68mFFbLRMn

// Normal sudoku rules apply (default row/col/box). Thermometers: Thermo
// (strictly increasing from the bulb, listed bulb-first; grey lines with a
// filled bulb circle at one end). Cages: Cage (distinct digits summing to
// the printed total). Outside clues: Sandwich (values strictly between the
// 1 and the 9 in that row/column sum to the printed total; ISS's native
// class matches this rule's wording exactly).
//
// The raw payload's cage list carries a fifth entry over R5C8, R5C9, R3C7
// with a printed total of 2, alongside a separate entry over just R5C8, R5C9
// totalling 9. A 3-cell cage cannot sum to 2 (minimum possible total for
// three cells is 3), so the 3-cell/total-2 entry cannot be a valid cage as
// literally recorded and is treated as leftover/duplicate decode data, not
// a real clue. Only the self-consistent R5C8, R5C9 = 9 cage is encoded.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Thermometers (bulb first, drawn geometry).
  new Thermo('R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3'),
  new Thermo('R5C5', 'R5C6', 'R5C7'),
  new Thermo('R7C3', 'R6C3', 'R5C3', 'R4C3'),
  new Thermo('R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C7'),
  new Thermo('R8C3', 'R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2'),
  new Thermo('R9C8', 'R9C9', 'R8C9', 'R8C8', 'R7C8', 'R7C9'),

  // Cages (top-left cell corner total; drawn geometry).
  new Cage(16, 'R1C3', 'R2C3'),
  new Cage(11, 'R1C7', 'R1C8'),
  new Cage(5, 'R2C7', 'R2C8'),
  new Cage(9, 'R5C8', 'R5C9'),

  // Outside sandwich clues (grid-outward lane position; drawn geometry).
  Sandwich.fromCells(30, graph.row(3), geometry),
  Sandwich.fromCells(12, graph.row(5), geometry),
  Sandwich.fromCells(28, graph.row(7), geometry),
  Sandwich.fromCells(20, graph.column(2), geometry),
  Sandwich.fromCells(21, graph.column(3), geometry),
  Sandwich.fromCells(0, graph.column(5), geometry),
];
