// Title: Thermoregulation
// Author: Pwootjuhs
// Video: https://www.youtube.com/watch?v=Q9kVuyrX7tU
// Source: https://sudokupad.app/i0lz556ia7

// Purple and orange lines are renbans: their digits form a non-repeating
// consecutive set in any order.
const renbans = [
  ['R3C3', 'R4C2', 'R5C2', 'R6C2'],
  ['R7C2', 'R8C2', 'R9C2'],
  ['R8C1', 'R9C1'],
  ['R7C4', 'R8C5', 'R9C6'],
  ['R5C6', 'R5C7', 'R5C8'],
  ['R6C7', 'R7C6'],
  ['R1C4', 'R2C4', 'R3C4'],
  ['R4C4', 'R4C5'],
  ['R2C3', 'R3C2', 'R4C3', 'R5C4'],
].map(cells => new Renban(...cells));

// Adjacent digits on each green German whisper line differ by at least 5.
const whispers = [
  ['R2C5', 'R1C6', 'R2C7', 'R3C6'],
  ['R2C3', 'R3C4', 'R4C5', 'R5C4'],
  ['R4C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R9C7', 'R9C8', 'R9C9'],
].map(cells => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  ...renbans,
  ...whispers,
  // The bulb is the circle at R3C9.
  new Thermo('R3C9', 'R3C8'),
];
