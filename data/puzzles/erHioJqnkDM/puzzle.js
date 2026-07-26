// Title: Forbidden Planet.
// Author: Chip Sounder
// Video: https://www.youtube.com/watch?v=erHioJqnkDM
// Source: https://sudokupad.app/7jwdfj9eqn

// Normal 6x6 sudoku (rows/columns/2x3 boxes) plus:
//  - Palindromes: thick grey lines, digits read the same forwards/backwards.
//  - Between line: thin grey line, interior digits strictly between the two
//    circled end digits.
//  - Little killer: two outside diagonal-sum clues.
// Shape('6x6')'s default 2x3 box tiling already matches the payload's drawn
// `regions` (verified via graph.boxes()), so no explicit region constraint
// is needed.

const graph = cellGraph('6x6');
const geometry = cellGeometry('6x6');

return [
  new Shape('6x6'),

  // Palindrome #1: thick line R4C2-R3C3-R4C3-R3C4-R4C4-R5C4 (payload `lines`
  // entry, thickness 8.96). R3C3 also sits on the between line below; the two
  // drawn lines cross there and each keeps its own constraint.
  new Palindrome('R4C2', 'R3C3', 'R4C3', 'R3C4', 'R4C4', 'R5C4'),

  // Palindrome #2: thick line R3C6-R4C5-R5C6-R6C5 (payload `lines` entry,
  // thickness 8.96).
  new Palindrome('R3C6', 'R4C5', 'R5C6', 'R6C5'),

  // Between line: thin line R3C1-R2C1-R1C1-R2C2-R3C3-R2C3-R1C3 (payload
  // `lines` entry, thickness 1.92), circled at both ends (payload `overlays`
  // centred on R3C1 and R1C3). First/last args are the circle ends.
  new Between('R3C1', 'R2C1', 'R1C1', 'R2C2', 'R3C3', 'R2C3', 'R1C3'),

  // Little killer diagonals (payload `arrows` + `underlays` "23"/"11",
  // paired by nearest on-grid corner): 23 down the main diagonal from
  // R1C1, 11 down the short diagonal from R5C1.
  LittleKiller.fromCells(23, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(11, graph.ray('R5C1', 1, 1), geometry),
];
