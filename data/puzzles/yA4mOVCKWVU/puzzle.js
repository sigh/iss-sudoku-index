// Title: The Green Machine
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=yA4mOVCKWVU
// Source: https://app.crackingthecryptic.com/TLG44bqNgH

// Each listed stroke contributes its adjacent pairs to the >=5 green-line rule.
const greenLines = [
  ['R9C4', 'R8C5', 'R9C6'],
  ['R8C6', 'R9C7', 'R8C8', 'R7C9'],
  ['R8C6', 'R7C7', 'R6C8', 'R7C9'],
  ['R7C5', 'R6C4', 'R7C3', 'R8C4', 'R9C3', 'R8C2'],
  ['R6C2', 'R7C1', 'R8C2'],
  ['R1C1', 'R2C1'],
  ['R1C8', 'R1C9'],
  ['R1C4', 'R2C5', 'R1C6'],
  ['R3C5', 'R4C6', 'R3C7', 'R2C6', 'R1C7', 'R2C8', 'R3C9', 'R4C8'],
  ['R6C6', 'R5C5', 'R4C4', 'R3C3'],
  ['R3C3', 'R2C4', 'R1C3', 'R2C2', 'R3C1', 'R4C2'],
  ['R3C3', 'R4C2'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 1),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
];
