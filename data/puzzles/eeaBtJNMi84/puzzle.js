// Title: High Temperatures
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=eeaBtJNMi84
// Source: https://app.crackingthecryptic.com/sudoku/rB3dmRbj7H

// Normal sudoku rules apply. Digits on thermometers increase from the bulb
// end. Each of the 5 drawn lines below has its bulb overlay on the cell at
// the line's midpoint (every line is odd-length), not at either end, so each
// line is two Thermo arms sharing that one low cell -- both arms increase
// away from it per the rules text.

// Full drawn line paths (grey lines, thickness 13) with their bulb cell,
// each bulb overlay centred exactly on its line's middle cell.
const thermoLines = [
  { bulb: 'R2C5', cells: ['R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'] },
  { bulb: 'R3C5', cells: ['R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8'] },
  { bulb: 'R5C5', cells: ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'] },
  { bulb: 'R7C5', cells: ['R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8'] },
  { bulb: 'R8C5', cells: ['R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7'] },
];

// Split each line at its bulb into two arms, both listed bulb-first, so each
// becomes an independent Thermo increasing away from the shared bulb cell.
const thermos = thermoLines.flatMap(({ bulb, cells }) => {
  const i = cells.indexOf(bulb);
  const left = cells.slice(0, i + 1).reverse();
  const right = cells.slice(i);
  return [new Thermo(...left), new Thermo(...right)];
});

return [
  new Shape('9x9'),
  new Given('R6C3', 9),
  new Given('R7C9', 4),
  ...thermos,
];
