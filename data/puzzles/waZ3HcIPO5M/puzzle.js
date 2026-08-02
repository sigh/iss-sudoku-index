// Title: Ferris Wheel
// Author: Jobo
// Video: https://www.youtube.com/watch?v=waZ3HcIPO5M
// Source: https://app.crackingthecryptic.com/sudoku/N4nH3m2ftL

// Normal sudoku rules apply. Grey-bulb thermometers increase from bulb to tip.
// Digits between each pair of endpoint circles are strictly between the endpoints.
// The green closed wheel is a difference-5 whisper; purple lines are renbans.
// White dots are consecutive pairs and X marks sum to 10. Line crossings share
// only their common grid cell.
const thermometers = [
  ['R2C5', 'R1C5'], ['R3C3', 'R2C3'], ['R3C7', 'R2C7'],
  ['R7C3', 'R6C3'], ['R7C7', 'R6C7'], ['R5C8', 'R4C8'],
  ['R8C5', 'R7C5'], ['R5C2', 'R4C2'],
];

const betweenLines = [
  ['R4C5', 'R5C4', 'R6C3', 'R7C2', 'R8C1'],
  ['R8C9', 'R7C8', 'R6C7', 'R5C6', 'R4C5'],
];

const greenWheel = [
  'R1C5', 'R1C4', 'R2C3', 'R3C2', 'R4C2', 'R5C2', 'R6C3', 'R7C4',
  'R7C5', 'R7C6', 'R6C7', 'R5C8', 'R4C8', 'R3C8', 'R2C7', 'R1C6', 'R1C5',
];

return [
  new Shape('9x9'),
  ...thermometers.map((cells) => new Thermo(...cells)),
  ...betweenLines.map((cells) => new Between(...cells)),
  new Whisper(5, ...greenWheel),
  new Renban('R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'),
  new Renban('R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8'),
  new WhiteDot('R4C4', 'R5C4'),
  new WhiteDot('R4C6', 'R5C6'),
  new WhiteDot('R5C4', 'R5C5'),
  new WhiteDot('R5C5', 'R5C6'),
  new WhiteDot('R7C9', 'R8C9'),
  new Sum(10, 'R8C3', 'R8C4'),
  new Sum(10, 'R8C6', 'R8C7'),
];
