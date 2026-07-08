// Count Some Dominoes by mellowrobinson
// https://sudokupad.app/27qnv0oduh
// https://www.youtube.com/watch?v=jgATrHS3pBg
//
// Partial encoding: chaos construction, the given, and X/V clues. The
// region-local domino-count clues are omitted; see notes.md.

const graph = cellGraph('9x9');

const vClues = [
  ['R1C1', 'R1C2'],
  ['R1C3', 'R2C3'],
  ['R2C1', 'R3C1'],
  ['R3C2', 'R3C3'],
  ['R8C3', 'R8C4'],
];

const xClues = [
  ['R3C6', 'R3C7'],
  ['R5C2', 'R5C3'],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  new Given('R1C5', 6),
  ...vClues.map(cells => new V(...cells)),
  ...xClues.map(cells => new X(...cells)),
];
