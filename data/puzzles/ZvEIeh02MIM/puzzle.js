// Title: Falling Arrows
// Author: Antiknight
// Video: https://www.youtube.com/watch?v=ZvEIeh02MIM
// Source: https://app.crackingthecryptic.com/sudoku/TR6JQBMF6M

// Standard 9x9 sudoku (rows, columns, boxes; boxes drawn as the default
// nine 3x3 regions), plus:
//  - Arrows: digits along the arm sum to the digit in the circle.
//  - Purple lines: a non-repeating set of consecutive digits (Renban).
//  - Anti-knight: no repeated digit a knight's move apart.

// Each arrow's cells[0] is the circle (sum) cell, snapped from the drawn
// off-centre wayPoint nearest the circle overlay's center; the rest is the
// arm, in the order the wayPoints trace away from the circle (source:
// arrows[], overlays[]).
const arrows = [
  ['R1C6', 'R2C5', 'R2C4', 'R3C4'],
  ['R4C6', 'R5C5', 'R5C4', 'R6C4'],
  ['R5C8', 'R6C8', 'R7C8', 'R8C8'],
];

// Purple (#D23BE7) lines, cells interpolated from wayPoints (source: lines[]).
const renbanLines = [
  ['R2C5', 'R2C6', 'R3C6'],
  ['R2C1', 'R2C2'],
  ['R2C8', 'R2C9'],
  ['R5C5', 'R5C6', 'R6C6'],
];

return [
  new Shape('9x9'),

  new Given('R3C9', 8),

  new AntiKnight(),

  ...arrows.map((cells) => new Arrow(...cells)),

  ...renbanLines.map((cells) => new Renban(...cells)),
];
