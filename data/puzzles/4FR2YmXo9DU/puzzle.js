// Title: Antiknight Arrow Sudoku
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=4FR2YmXo9DU
// Source: https://app.crackingthecryptic.com/sudoku/d6HQqjdNqf

// Standard sudoku, anti-knight (identical digits cannot appear a knight's
// move apart), and seven arrows: digits along an arrow sum to the digit in
// its circle (bulb), and may repeat.
const givens = [
  new Given('R2C2', 1),
  new Given('R3C9', 3),
  new Given('R4C2', 4),
];

// Arrow(bulb, ...arm cells). Bulb is the circled sum cell; arm cells are the
// addends and may repeat. Cell paths transcribed from the drawn arrow
// waypoints (payload `arrows[].wayPoints`, snapped to nearest cell centres).
const arrows = [
  new Arrow('R5C2', 'R4C1', 'R3C2', 'R2C3', 'R1C4'),
  new Arrow('R2C5', 'R3C5', 'R4C4', 'R5C3', 'R6C2'),
  new Arrow('R4C6', 'R5C5', 'R5C6'),
  new Arrow('R9C1', 'R8C1', 'R8C2', 'R9C3'),
  new Arrow('R2C7', 'R1C8', 'R2C8', 'R3C9'),
  new Arrow('R8C5', 'R7C5', 'R6C6', 'R5C7', 'R4C8'),
  new Arrow('R5C8', 'R6C9', 'R7C8', 'R8C7', 'R9C6'),
];

return [
  new Shape('9x9'),
  ...givens,
  new AntiKnight(),
  ...arrows,
];
