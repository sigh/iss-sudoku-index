// Title: Frost-E
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=MhQ5ToUEfuw
// Source: https://app.crackingthecryptic.com/sudoku/B72Gn24nmq

// Normal Sudoku rules apply. R8C7 is even. Each ordinary purple path is a
// renban; every cyclic five-cell window of the large purple loop is a renban.
// Purple paths are transcribed from the drawn lines in the source.
const ordinaryRenbans = [
  ['R8C2', 'R8C1', 'R9C1', 'R9C2'],
  ['R2C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'],
  ['R1C7', 'R2C8', 'R2C9'],
  ['R3C4', 'R3C3', 'R4C3', 'R4C4'],
  ['R3C6', 'R3C7', 'R4C7', 'R4C6'],
  ['R4C5', 'R5C6'],
  ['R5C3', 'R6C4', 'R7C5', 'R7C6', 'R6C7'],
];
const largeLoop = [
  'R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2',
  'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C8',
];
const cyclicLoop = [...largeLoop, ...largeLoop.slice(0, 4)];
const largeLoopWindows = largeLoop.map((_, start) => new Renban(...cyclicLoop.slice(start, start + 5)));

return [
  new Shape('9x9'),
  new Given('R1C8', 1),
  new Given('R2C1', 2),
  new Given('R8C2', 8),
  new Given('R8C7', 2, 4, 6, 8),
  ...ordinaryRenbans.map(cells => new Renban(...cells)),
  ...largeLoopWindows,
];
