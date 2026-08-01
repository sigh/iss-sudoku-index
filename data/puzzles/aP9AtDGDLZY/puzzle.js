// Title: Feeling Lucky
// Author: Scaly Griffon & Glitch Horse
// Video: https://www.youtube.com/watch?v=aP9AtDGDLZY
// Source: https://app.crackingthecryptic.com/z32ikj4sbe

// Standard Sudoku. Adjacent cells on the lime-green line differ by at least 5.
// Sage-green thermometers increase from their circular bulbs; gold circles are odd.
return [
  new Shape('9x9'),

  // The drawn lime-green German Whisper path, including its revisited R6C5.
  new Whisper(5,
    'R9C4', 'R8C5', 'R7C5', 'R6C5', 'R7C4', 'R7C3', 'R6C2', 'R5C2',
    'R4C3', 'R3C2', 'R2C2', 'R1C3', 'R1C4', 'R2C5', 'R1C6', 'R1C7',
    'R2C8', 'R3C8', 'R4C7', 'R5C8', 'R6C8', 'R7C7', 'R7C6', 'R6C5'),

  // The seven sage-green thermometers, listed bulb to tip from the drawn paths.
  new Thermo('R7C8', 'R8C8', 'R9C8'),
  new Thermo('R8C7', 'R9C7'),
  new Thermo('R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new Thermo('R8C3', 'R9C3'),
  new Thermo('R8C2', 'R9C2'),
  new Thermo('R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new Thermo('R8C6', 'R9C6'),

  // Gold-circle cells from the source art are restricted to odd digits.
  new Given('R2C1', 1, 3, 5, 7, 9),
  new Given('R2C9', 1, 3, 5, 7, 9),
  new Given('R4C2', 1, 3, 5, 7, 9),
  new Given('R4C9', 1, 3, 5, 7, 9),
];
