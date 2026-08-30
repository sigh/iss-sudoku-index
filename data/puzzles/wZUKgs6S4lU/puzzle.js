// Title: Killer Sandwich Thermo
// Author: Ben Needham
// Video: https://www.youtube.com/watch?v=wZUKgs6S4lU
// Source: https://cracking-the-cryptic.web.app/sudoku/BNDRFjD72R

// Standard 9x9 sudoku, no givens. Three rule families (video description):
// - Killer: each background-coloured group of cells is a cage summing to 19
//   (standard killer convention: no repeated digit within a cage).
// - Sandwich: an outside clue gives the sum of the digits strictly between
//   the 1 and the 9 in that row/column.
// - Thermo: digits strictly increase away from the bulb along each line.
//
// Cage cells and thermometer paths are transcribed from the source payload's
// coloured underlays and drawn lines; comments below name only the drawn
// colour or bulb each group comes from.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  // Killer cages, one per background fill colour, all summing to 19.
  new Cage(19, 'R1C1', 'R2C1', 'R2C2', 'R3C1', 'R3C2'), // yellow #F7D038
  new Cage(19, 'R4C1', 'R5C1', 'R5C2', 'R5C3'),         // yellow-green #A3E048
  new Cage(19, 'R7C1', 'R7C2', 'R7C3', 'R8C2'),         // brown #EB7532
  new Cage(19, 'R7C5', 'R8C5', 'R9C5'),                 // blue #34BBE6
  new Cage(19, 'R4C7', 'R4C8', 'R4C9', 'R5C8'),         // red #E6261F
  new Cage(19, 'R7C8', 'R8C8', 'R8C9', 'R9C8'),         // purple #D23BE7

  // Thermometers, cells given bulb-first (some payload lines are drawn
  // tip-first; direction was resolved against the bulb-circle underlay).
  new Thermo('R3C3', 'R3C2', 'R2C1', 'R1C2', 'R1C3'),
  new Thermo('R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C6', 'R3C5', 'R3C4', 'R2C4'),
  new Thermo('R1C7', 'R2C7', 'R3C8', 'R2C9', 'R1C9'),
  new Thermo('R4C3', 'R5C3', 'R6C3'),
  // R6C5's bulb circle sits mid-path (not at either open end) on the single
  // drawn stroke R4C6-R4C5-R5C5-R6C5-R6C6-R5C7: a shared bulb with two
  // increasing arms, encoded as two Thermos from the common bulb cell.
  new Thermo('R6C5', 'R5C5', 'R4C5', 'R4C6'),
  new Thermo('R6C5', 'R6C6', 'R5C7'),
  new Thermo('R8C3', 'R8C2', 'R8C1'),
  new Thermo('R9C5', 'R8C5', 'R7C5'),
  new Thermo('R9C8', 'R9C9', 'R8C9', 'R7C9', 'R7C8', 'R7C7', 'R8C7', 'R8C8'),

  // Sandwich clues: sum of digits strictly between the 1 and the 9.
  Sandwich.fromCells(0, graph.row(1), geometry),
  Sandwich.fromCells(19, graph.row(4), geometry),
  Sandwich.fromCells(0, graph.row(7), geometry),
  Sandwich.fromCells(0, graph.column(5), geometry),
  Sandwich.fromCells(0, graph.column(8), geometry),
];
