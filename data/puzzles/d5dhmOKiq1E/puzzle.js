// Title: Ocotillo Blossoms
// Author: cheerfuljanb
// Video: https://www.youtube.com/watch?v=d5dhmOKiq1E
// Source: https://sudokupad.app/5nbjs9e11i

// Normal Sudoku applies. Green lines are German whispers (difference at least
// 5); orange lines are Dutch whispers (difference at least 4). Black and white
// dots are 1:2-ratio and consecutive Kropki dots, respectively. X and V markers
// sum to 10 and 5. The red blossoms and yellow sun are explicitly cosmetic.
const greenWhispers = [
  ['R6C9', 'R6C8', 'R5C7', 'R4C6', 'R4C5', 'R3C4', 'R3C3', 'R3C2', 'R4C1'],
  ['R2C3', 'R2C4', 'R2C5', 'R1C6', 'R1C7', 'R2C8', 'R3C9'],
];
const orangeWhispers = [
  ['R8C5', 'R7C4', 'R6C4', 'R5C3', 'R4C3'],
  ['R6C4', 'R5C4'],
  ['R4C7', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C5'],
  ['R7C6', 'R6C5'],
  ['R9C4', 'R8C3', 'R7C2', 'R6C2', 'R5C1'],
  ['R9C7', 'R8C8', 'R7C8', 'R6C7'],
  ['R7C8', 'R6C8', 'R5C8'],
];

// Drawn Kropki and XV edges, transcribed from the payload geometry.
const blackDots = [
  ['R5C1', 'R6C1'],
  ['R7C2', 'R7C3'],
  ['R7C3', 'R7C4'],
];
const whiteDots = [
  ['R4C8', 'R4C9'],
  ['R6C3', 'R7C3'],
  ['R2C6', 'R3C6'],
  ['R4C2', 'R5C2'],
  ['R6C5', 'R7C5'],
  ['R3C7', 'R3C8'],
  ['R9C4', 'R9C5'],
  ['R5C2', 'R6C2'],
  ['R2C5', 'R3C5'],
  ['R3C5', 'R4C5'],
];
const xMarkers = [
  ['R9C6', 'R9C7'],
  ['R5C9', 'R6C9'],
  ['R3C1', 'R3C2'],
  ['R1C5', 'R2C5'],
  ['R8C9', 'R9C9'],
];
const vMarkers = [['R2C8', 'R3C8']];

return [
  new Shape('9x9'),
  new Given('R1C4', 7),
  new Given('R5C9', 1),
  new Given('R9C5', 3),
  ...greenWhispers.map(cells => new Whisper(5, ...cells)),
  ...orangeWhispers.map(cells => new Whisper(4, ...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...xMarkers.map(cells => new X(...cells)),
  ...vMarkers.map(cells => new V(...cells)),
];
