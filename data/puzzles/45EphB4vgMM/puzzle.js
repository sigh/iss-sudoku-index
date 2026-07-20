// Title: Squishdomefel
// Author: Peter the Dog
// Video: https://www.youtube.com/watch?v=45EphB4vgMM
// Source: https://sudokupad.app/H9Jr4pGLNr

// Digits 1-9 fill the 7x7 grid. Blue boundary cells belong to every
// overlapping 3x3 region that touches them.
const regionStarts = [1, 3, 5];
const regions = regionStarts.flatMap(row => regionStarts.map(col =>
  new AllDifferent(...Array.from({length: 9}, (_, index) =>
    makeCellId(row + Math.floor(index / 3), col + index % 3)))));

const cages = [
  new Cage(30, 'R1C1', 'R1C2', 'R2C2', 'R2C1'),
  new Cage(14, 'R6C1', 'R6C2', 'R7C2', 'R7C1'),
];

const parity = [
  new Given('R4C2', 1, 3, 5, 7, 9),
  new Given('R5C1', 1, 3, 5, 7, 9),
  new Given('R6C4', 2, 4, 6, 8),
];

const whispers = [
  new Whisper(5, 'R2C4', 'R1C5'),
  new Whisper(5, 'R6C6', 'R6C7', 'R7C7', 'R7C6', 'R6C6'),
];

const renbans = [
  new Renban('R6C6', 'R7C7'),
  new Renban('R6C7', 'R7C6'),
  new Renban('R5C4', 'R6C4', 'R6C3'),
];

const blackDots = [
  new BlackDot('R1C6', 'R1C7'),
  new BlackDot('R1C6', 'R2C6'),
  new BlackDot('R2C2', 'R3C2'),
];

return [
  new Shape('7x7', 9),
  new NoBoxes(),
  ...regions,
  ...cages,
  ...parity,
  ...whispers,
  ...renbans,
  ...blackDots,
];
