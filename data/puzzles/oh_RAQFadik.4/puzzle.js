// Title: Dec. 10, 2022: German Whispers
// Author: clover!
// Video: https://www.youtube.com/watch?v=oh_RAQFadik
// Source: https://tinyurl.com/2r3cmhhm

// Normal sudoku rules apply (default rows/columns/boxes, digits 1-9).
// Adjacent digits along each green line must differ by at least 5,
// encoded as Whisper(5, ...) on each of the six drawn lines below.
// Cell lists taken from the payload's `whispers` entries.

const whispers = [
  ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'],
  ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['R7C1', 'R6C2', 'R5C3', 'R4C2', 'R3C1'],
  ['R1C3', 'R2C4', 'R3C5', 'R2C6', 'R1C7'],
  ['R3C9', 'R4C8', 'R5C7', 'R6C8', 'R7C9'],
  ['R9C3', 'R8C4', 'R7C5', 'R8C6', 'R9C7'],
];

return [
  new Shape('9x9'),
  new Given('R2C5', 9), new Given('R3C4', 6), new Given('R3C6', 5),
  new Given('R4C3', 1), new Given('R4C5', 5), new Given('R4C7', 2),
  new Given('R5C2', 7), new Given('R5C4', 3), new Given('R5C6', 2),
  new Given('R5C8', 6), new Given('R6C3', 3), new Given('R6C5', 4),
  new Given('R6C7', 7), new Given('R7C4', 5), new Given('R7C6', 9),
  new Given('R8C5', 6),
  ...whispers.map(cells => new Whisper(5, ...cells)),
];
