// Title: Line Dancing
// Author: Dr Logic
// Video: https://www.youtube.com/watch?v=jVCndIR58y4
// Source: https://sudokupad.app/7d1rkyffv3

// Normal Sudoku; red parity, lavender zipper, pink renban and green whisper
// lines. Digits cannot repeat across lines sharing an inner group colour.
// Black and white edge dots give ratios and consecutive digits respectively.
// Paths transcribed from the seven broad coloured lines; thin inner strokes
// identify white, blue, red and black groups respectively.
const parity = ['R4C1','R4C2','R4C3','R3C4','R2C4','R1C4'];
const zippers = [
  ['R9C5','R8C6','R7C6','R6C7','R6C8','R6C9'],
  ['R9C8','R8C8','R8C9'],
  ['R2C2','R3C3','R4C4'],
];
const whispers = [
  ['R2C8','R3C8','R4C8'],
  ['R9C1','R9C2','R9C3'],
];
const renban = ['R9C6','R8C5','R7C5','R6C5','R6C6','R5C6','R5C7','R5C8','R5C9'];
const groups = [
  [...parity, ...zippers[2]],
  [...zippers[0], ...zippers[1]],
  whispers.flat(),
  renban,
];
// Edge dots transcribed from the six filled black/white circles.
const blackDots = [['R1C6','R1C7'],['R4C5','R4C6'],['R5C2','R6C2']];
const whiteDots = [['R7C1','R8C1'],['R4C7','R5C7'],['R9C3','R9C4']];
return [
  new Shape('9x9'),
  // The single printed given.
  new Given('R6C6', 9),
  new Modular(2, ...parity),
  ...zippers.map(cells => new Zipper(...cells)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
  new Renban(...renban),
  ...groups.map(cells => new AllDifferent(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
