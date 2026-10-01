// Title: Rainbow Arrows in Fog
// Author: Jigokuro
// Video: https://www.youtube.com/watch?v=q8eZpyr23mc
// Source: https://sudokupad.app/297mtjab6j

// Rules: normal sudoku; digits along an arrow sum to the digit in its
// circle (first cell of each Arrow). Fog only governs what is visible while
// solving. "Same-colour arrows differ in length" and "arrows do not cross or
// overlap" describe the drawn arrows (lengths blue 2/3/5/4, green 3/2,
// red 2/4/3/1; no shared cells) and constrain no digits.

// Arrow paths from the drawn arrow waypoints, bulb first. R9C3 carries two
// circles (green and red), one per arrow.
const arrows = [
  // Blue
  ['R4C1', 'R3C1', 'R2C1'],
  ['R4C2', 'R3C2', 'R2C3', 'R1C4'],
  ['R4C3', 'R3C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7'],
  ['R4C4', 'R5C5', 'R5C4', 'R6C3', 'R7C2'],
  // Green
  ['R2C9', 'R1C8', 'R2C7', 'R1C6'],
  ['R9C3', 'R9C2', 'R8C3'],
  // Red
  ['R9C3', 'R8C4', 'R7C4'],
  ['R6C7', 'R7C7', 'R8C6', 'R9C6', 'R9C5'],
  ['R6C8', 'R7C8', 'R8C9', 'R9C8'],
  ['R3C9', 'R4C8'],
];

return [
  new Shape('9x9'),
  ...arrows.map((cells) => new Arrow(...cells)),
];
