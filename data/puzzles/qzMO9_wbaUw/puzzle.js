// Title: Visible Inclusions
// Author: m1n3
// Video: https://www.youtube.com/watch?v=qzMO9_wbaUw
// Source: https://sudokupad.app/gz8mfm0r3a

const killerCages = [
  new Cage(12, 'R2C3', 'R2C4'),
  new Cage(6, 'R4C2', 'R5C2'),
  new Cage(15, 'R6C6', 'R6C7'),
];

// Start at a box crossing so each contiguous box segment is represented once.
const regionSumLines = [
  new RegionSumLine(
    'R4C2', 'R5C2', 'R6C3',
    'R7C4', 'R8C5', 'R7C6',
    'R6C7', 'R5C8', 'R4C8',
    'R3C8', 'R2C7',
    'R2C6', 'R2C5', 'R2C4',
    'R2C3', 'R3C2'
  ),
];

const dutchWhispers = [
  new Whisper(4, 'R9C3', 'R8C4', 'R8C5', 'R8C6', 'R9C7'),
  new Whisper(4, 'R9C8', 'R8C7', 'R8C6', 'R7C7', 'R6C7'),
  new Whisper(4, 'R6C3', 'R7C3', 'R8C4', 'R8C3', 'R9C2'),
];

const thermometers = [
  new Thermo('R7C5', 'R6C4', 'R5C3', 'R4C3', 'R3C3'),
  new Thermo('R3C7', 'R4C6', 'R4C5', 'R4C4'),
  new Thermo('R3C7', 'R4C7', 'R5C7', 'R6C6'),
];

const parityMarks = [
  new Given('R2C3', 1, 3, 5, 7, 9),
  new Given('R2C7', 1, 3, 5, 7, 9),
  new Given('R3C2', 1, 3, 5, 7, 9),
  new Given('R3C8', 1, 3, 5, 7, 9),
  new Given('R5C8', 1, 3, 5, 7, 9),
  new Given('R6C7', 1, 3, 5, 7, 9),
  new Given('R8C5', 1, 3, 5, 7, 9),
  new Given('R6C3', 2, 4, 6, 8),
  new Given('R8C7', 2, 4, 6, 8),
  new Given('R9C2', 2, 4, 6, 8),
  new Given('R9C7', 2, 4, 6, 8),
];

const blackKropkiDots = [
  new BlackDot('R4C2', 'R5C2'),
  new BlackDot('R2C8', 'R3C8'),
  new BlackDot('R4C6', 'R5C6'),
];

return [
  new Shape('9x9'),
  ...killerCages,
  ...regionSumLines,
  ...dutchWhispers,
  ...thermometers,
  ...parityMarks,
  ...blackKropkiDots,
];
