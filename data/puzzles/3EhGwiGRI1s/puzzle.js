// Title: 345
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=3EhGwiGRI1s
// Source: https://app.crackingthecryptic.com/sudoku/3jH9gBHTJb

// Normal sudoku rules apply. Three whisper-style lines, each with its own
// minimum adjacent difference: yellow line >= 3, orange line >= 4, green
// line >= 5 (rules text). The green and orange lines are closed loops, so
// their cell lists repeat the first cell at the end to bind the wrap-around
// edge; the yellow line is an open path and needs no repeat. Colour ->
// rule-name mapping is by hue (orange #EB7532 ~22 deg, yellow #F7D038 ~48
// deg, green #A3E048 ~84 deg), matching the rules text order.

const green = [
  'R3C4', 'R3C5', 'R3C6', 'R4C7', 'R5C7', 'R6C7', 'R7C6', 'R7C5', 'R7C4',
  'R6C3', 'R5C3', 'R4C3', 'R3C4',
];

const orange = [
  'R2C4', 'R2C5', 'R2C6', 'R3C7', 'R4C8', 'R5C8', 'R6C8', 'R7C7', 'R8C6',
  'R8C5', 'R8C4', 'R7C3', 'R6C2', 'R5C2', 'R4C2', 'R3C3', 'R2C4',
];

const yellow = [
  'R8C3', 'R7C2', 'R6C1', 'R5C1', 'R4C1', 'R3C2', 'R2C3', 'R1C4', 'R1C5',
  'R1C6', 'R2C7', 'R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C8', 'R8C7',
];

return [
  new Shape('9x9'),

  new Given('R2C8', 2),
  new Given('R5C8', 9),
  new Given('R6C3', 6),

  new Whisper(5, ...green),
  new Whisper(4, ...orange),
  new Whisper(3, ...yellow),
];
