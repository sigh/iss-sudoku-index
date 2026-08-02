// Title: Dotween
// Author: Jodawo
// Video: https://www.youtube.com/watch?v=Haof5b6JnoY
// Source: https://app.crackingthecryptic.com/sudoku/MTDHBrRB3Q

// Normal Sudoku. Every grey line has white circles at its endpoints: digits
// strictly between those endpoint digits lie on the Between Line. White Kropki
// dots join consecutive digits and black Kropki dots join a 1:2 pair. The rules
// specify only the drawn dots, so no negative Kropki constraint is added.
const betweenLines = [
  ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'],
  ['R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7'],
  ['R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7'],
  ['R6C4', 'R7C3', 'R8C2', 'R9C1'],
  ['R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R2C9', 'R2C8', 'R2C7', 'R2C6'],
  ['R8C1', 'R8C2', 'R8C3', 'R8C4'],
  ['R6C8', 'R7C8', 'R8C7', 'R8C6'],
  ['R2C4', 'R2C3', 'R3C2', 'R4C2'],
]; // Grey strokes and their endpoint circles in lines[]/overlays[].

const whiteDots = [
  ['R6C3', 'R6C4'], ['R6C4', 'R7C4'], ['R7C3', 'R7C4'],
  ['R6C3', 'R7C3'], ['R2C7', 'R2C8'], ['R1C7', 'R2C7'],
  ['R1C2', 'R2C2'],
]; // White edge dots in overlays[].

const blackDots = [
  ['R4C5', 'R5C5'], ['R5C5', 'R6C5'], ['R4C3', 'R4C4'],
  ['R6C6', 'R6C7'], ['R4C6', 'R4C7'], ['R3C6', 'R4C6'],
  ['R3C6', 'R3C7'], ['R3C7', 'R4C7'], ['R8C2', 'R8C3'],
  ['R8C3', 'R9C3'], ['R8C8', 'R9C8'],
]; // Black edge dots in overlays[].

return [
  new Shape('9x9'),
  ...betweenLines.map(cells => new Between(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
