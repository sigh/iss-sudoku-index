// Title: 8'
// Author: ICHTUES & Florian Wortmann
// Video: https://www.youtube.com/watch?v=RSa9r7ohxn8
// Source: https://sudokupad.app/sde0yq3oj3

// On each lavender line, mirrored digits sum to the line's centre digit.
const lines = [
  ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1'],
  ['R2C4', 'R2C3', 'R2C2', 'R3C2', 'R4C2'],
  ['R3C5', 'R3C4', 'R3C3', 'R4C3', 'R5C3'],
  ['R4C6', 'R4C5', 'R4C4', 'R5C4', 'R6C4'],
  ['R6C8', 'R6C7', 'R6C6', 'R7C6', 'R8C6'],
  ['R9C8', 'R9C9', 'R8C9'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
];

const lavenderSums = lines.flatMap(line => {
  const centreIndex = (line.length - 1) / 2;
  const centre = line[centreIndex];
  return line.slice(0, centreIndex).map((cell, index) =>
    new Arrow(centre, cell, line[line.length - 1 - index]));
});

return [
  new Shape('9x9'),
  new Given('R2C6', 8),
  new Diagonal(-1), // NW-SE marked diagonal.
  ...lavenderSums,
];
