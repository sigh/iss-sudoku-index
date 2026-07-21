// Title: A Dot of Killer Heat
// Author: Chip Sounder
// Video: https://www.youtube.com/watch?v=UvLyXnOoOdI
// Source: https://sudokupad.app/j1609txzkd

// Digits increase from each bulb along every thermometer branch.
const thermometers = [
  ['R6C2', 'R5C2', 'R4C3', 'R3C4', 'R2C5'],
  ['R1C8', 'R1C7', 'R1C6', 'R1C5'],
  ['R1C8', 'R2C8', 'R3C8', 'R4C8'],
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R1C1', 'R1C2', 'R1C3', 'R1C4'],
  ['R8C1', 'R7C1', 'R6C1', 'R5C1'],
  ['R8C1', 'R8C2', 'R8C3', 'R8C4'],
  ['R8C8', 'R7C8', 'R6C8', 'R5C8'],
  ['R8C8', 'R8C7', 'R8C6', 'R8C5'],
  ['R3C7', 'R4C7', 'R5C6', 'R6C5', 'R7C4'],
].map(cells => new Thermo(...cells));

return [
  new Shape('8x8'),
  ...thermometers,
  new AllDifferent(
    'R4C6',
    'R5C5', 'R5C6', 'R5C7',
    'R6C6', 'R6C7',
    'R7C6', 'R7C7',
  ),
  new Cage(10, 'R5C4', 'R6C4'),
  new BlackDot('R3C7', 'R4C7'),
  new WhiteDot('R8C6', 'R8C7'),
];
