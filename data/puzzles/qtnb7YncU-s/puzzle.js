// Title: Spider and Fly
// Author: Lucy Audrin
// Video: https://www.youtube.com/watch?v=qtnb7YncU-s
// Source: https://app.crackingthecryptic.com/sudoku/7bDfD9pp6d
//
// Normal sudoku rules apply. Along thermometers digits must increase from the
// bulb end. The pair of cells marked with a black dot have a ratio of 1:2.
//
// The grey circles are thermometer bulbs; twelve thermometers radiate from
// six bulb cells, drawn to look like spider legs. Cell order below is the
// drawn stroke's cell sequence (bulb first); several legs step diagonally
// between waypoints rather than running orthogonally the whole way, but
// Thermo binds consecutive cells by list order, not by grid adjacency.

const thermoLegs = [
  // Bulb R4C6.
  ['R4C6', 'R3C7', 'R2C7', 'R1C6', 'R1C5', 'R1C4', 'R2C3', 'R3C3', 'R4C4'],
  // Bulb R5C6 (three legs).
  ['R5C6', 'R4C7', 'R3C8'],
  ['R5C6', 'R5C7', 'R4C8'],
  ['R5C6', 'R6C7', 'R5C8'],
  // Bulb R6C6.
  ['R6C6', 'R7C7', 'R6C8'],
  // Bulb R6C5 (three legs).
  ['R6C5', 'R7C5'],
  ['R6C5', 'R7C6'],
  ['R6C5', 'R7C4'],
  // Bulb R6C4.
  ['R6C4', 'R7C3', 'R6C2'],
  // Bulb R5C4 (three legs).
  ['R5C4', 'R6C3', 'R5C2'],
  ['R5C4', 'R5C3', 'R4C2'],
  ['R5C4', 'R4C3', 'R3C2'],
];

return [
  new Shape('9x9'),
  ...thermoLegs.map(cells => new Thermo(...cells)),
  // Black dot on the shared edge R9C4/R9C5: ratio 1:2, the only marked pair.
  new BlackDot('R9C4', 'R9C5'),
];
