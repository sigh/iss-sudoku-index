// Title: Synesthesia
// Author: pieguy
// Video: https://www.youtube.com/watch?v=M3jN1OrHzGw
// Source: https://app.crackingthecryptic.com/2x8n015o8v

// Normal Sudoku rules apply. Adjacent digits on each coloured line differ by at
// least its colour's threshold: blue 2, pink 3, orange 4, green 5, yellow 6,
// and red 7. Line paths are transcribed from the coloured drawn lines.
const blueLines = [
  ['R2C2', 'R2C3', 'R3C3', 'R3C2', 'R4C2', 'R4C3'],
];
const pinkLines = [
  ['R3C5', 'R3C6'],
  ['R2C5', 'R2C6', 'R3C6', 'R4C6', 'R4C5'],
];
const orangeLines = [
  ['R2C8', 'R3C8', 'R3C9'],
  ['R2C9', 'R3C9', 'R4C9'],
];
const greenLines = [
  ['R6C3', 'R6C2', 'R7C2', 'R7C3', 'R8C3', 'R8C2'],
];
const yellowLines = [
  ['R7C5', 'R7C6', 'R8C6', 'R8C5'],
  ['R6C6', 'R7C5', 'R8C5'],
];
const redLines = [
  ['R6C8', 'R6C9', 'R7C9', 'R8C9'],
];

const whispers = (difference, lines) =>
  lines.map(cells => new Whisper(difference, ...cells));

return [
  new Shape('9x9'),
  new Given('R1C1', 5),
  new Given('R1C3', 8),
  new Given('R2C4', 4),
  ...whispers(2, blueLines),
  ...whispers(3, pinkLines),
  ...whispers(4, orangeLines),
  ...whispers(5, greenLines),
  ...whispers(6, yellowLines),
  ...whispers(7, redLines),
];
