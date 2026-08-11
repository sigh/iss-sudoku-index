// Title: Hot Mist
// Author: HeBro
// Video: https://www.youtube.com/watch?v=aG_oQQl9oVE
// Source: https://app.crackingthecryptic.com/sudoku/dP3mJDBHMh

// Normal sudoku rules apply. Along thermometers, digits must increase from
// the bulb. Each thermometer's cell list below starts at its bulb (the cell
// carrying the drawn circular overlay).
const thermos = [
  ['R1C1', 'R1C2', 'R2C2', 'R3C2'],
  ['R2C1', 'R2C2', 'R2C3', 'R3C3'],
  ['R1C5', 'R2C5', 'R3C5', 'R3C4'],
  ['R1C6', 'R2C6', 'R2C5', 'R2C4'],
  ['R2C9', 'R2C8', 'R2C7', 'R1C7'],
  ['R3C9', 'R3C8', 'R2C8', 'R1C8'],
  ['R6C8', 'R5C9', 'R4C8'],
  ['R5C6', 'R5C5', 'R6C5'],
  ['R4C2', 'R5C2', 'R6C2', 'R6C1'],
  ['R4C3', 'R5C3', 'R5C2', 'R5C1'],
  ['R8C3', 'R8C2', 'R8C1', 'R7C1'],
  ['R9C3', 'R9C2', 'R8C2', 'R7C2', 'R7C3'],
  ['R8C4', 'R9C5', 'R8C6'],
  ['R7C7', 'R7C8', 'R8C8', 'R9C8'],
  ['R8C7', 'R8C8', 'R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...thermos.map((cells) => new Thermo(...cells)),
];
