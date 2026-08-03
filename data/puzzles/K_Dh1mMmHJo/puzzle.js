// Title: Brackets
// Author: Kitten
// Video: https://www.youtube.com/watch?v=K_Dh1mMmHJo
// Source: https://app.crackingthecryptic.com/sudoku/GLmtfHpmnD

// Standard sudoku, plus: sum arrows, black (2:1) Kropki dots, and a
// no-repeat diagonal. The payload draws eight separate arrow entries in four
// visually adjoining pairs -- two arrows sharing a cell near the circle end,
// or two circles sharing cells near the arrowhead end. Nothing in the rules
// text merges a pair into one clue, so each of the eight is its own ordinary
// Arrow (circle cell first, then arm cells), faithfully overlapping where
// drawn.

// Arrows, provenance: the 8 arrow entries and their paired circle overlays.
const arrows = [
  // Circle R7C8 forks into two arms sharing R6C8.
  ['R7C8', 'R6C8', 'R6C7', 'R5C7'],
  ['R7C8', 'R6C8', 'R6C9', 'R5C9'],
  // Circle R6C2 forks into two arms sharing R7C2.
  ['R6C2', 'R7C2', 'R8C1', 'R9C1'],
  ['R6C2', 'R7C2', 'R8C3', 'R9C3'],
  // Circle R4C5 forks into two arms sharing R3C5.
  ['R4C5', 'R3C5', 'R2C4', 'R1C4'],
  ['R4C5', 'R3C5', 'R2C6', 'R1C6'],
  // Two separate circles, R9C6 and R9C4, whose arms merge into a shared
  // tail R8C5-R7C5.
  ['R9C6', 'R8C6', 'R8C5', 'R7C5'],
  ['R9C4', 'R8C4', 'R8C5', 'R7C5'],
];

// Black dots, provenance: the 4 edge-sized black overlays.
const blackDots = [
  ['R1C1', 'R2C1'],
  ['R1C3', 'R2C3'],
  ['R1C8', 'R2C8'],
  ['R7C6', 'R7C7'],
];

return [
  new Shape('9x9'),
  // Drawn diagonal runs R1C1-R9C9 (top-left to bottom-right); Diagonal(-1)
  // is ISS's top-left-to-bottom-right diagonal, per its ARGUMENT_CONFIG.
  new Diagonal(-1),
  ...arrows.map(cells => new Arrow(...cells)),
  ...blackDots.map(pair => new BlackDot(...pair)),
];
