// Title: Circular Reasoning
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=rLvdbW7-P4o
// Source: https://app.crackingthecryptic.com/sudoku/dqNLp6qJHR
//
// Normal sudoku. 43 cells are drawn as circles; each circled digit counts how
// many of those 43 circles hold that same digit (CountingCircles). Four of
// the circles are also arrow bulbs: the digits on the rest of that arrow's
// path sum to the bulb's digit (Arrow, bulb cell first).

// Circled cells, transcribed from the drawn circle overlays (all share the
// same white-fill/light-grey-border style; 4 of them coincide with the
// arrow-bulb cells below).
const circles = [
  'R1C1', 'R1C3', 'R1C6', 'R1C7', 'R1C9',
  'R2C1', 'R2C2', 'R2C5',
  'R3C1', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C9',
  'R4C3', 'R4C4', 'R4C5', 'R4C7', 'R4C9',
  'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8',
  'R6C3', 'R6C5', 'R6C7',
  'R7C5',
  'R8C1', 'R8C3', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9',
  'R9C1', 'R9C3', 'R9C5', 'R9C7',
];

// Arrows: bulb cell first, then arm cells, per the drawn arrow paths.
const arrows = [
  ['R1C6', 'R1C5', 'R1C4', 'R2C4', 'R2C3'],
  ['R5C2', 'R4C2', 'R3C2'],
  ['R8C7', 'R7C7', 'R7C8'],
  ['R8C8', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  new CountingCircles(...circles),
  ...arrows.map(cells => new Arrow(...cells)),
];
