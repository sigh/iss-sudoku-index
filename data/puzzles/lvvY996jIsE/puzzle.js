// Title: Shapes
// Author: Thomas Occhipinti
// Video: https://www.youtube.com/watch?v=lvvY996jIsE
// Source: https://app.crackingthecryptic.com/sudoku/gtTmd2Qgd3

// Rules encoded here:
//   Normal sudoku rules apply. The grid has no given digits.
//   X and V join two cells adding up to 10 (X) or 5 (V). Not all Xs and Vs are
//     shown, so undrawn edges carry no information: X/V, not StrictXV.
//   Orange cells are all different and sum to the 2-digit total given in the
//     orange-centred pill in the top row; the same is true for purple and green.
//
// The three pills are empty rounded outlines, each drawn around one pair of
// top-row cells with a small orange / green / purple square at its centre
// naming the colour it reports. No number is printed in any pill, so the
// "2-digit total" it gives is the number read from the two cells it encloses --
// a PillArrow whose pill is that cell pair and whose arm is the colour's cells.
// R1C7 is both a purple cell and the tens digit of the purple total.

// Shaded cells, read from the grid art, one list per colour.
const orange = ['R2C9', 'R3C4', 'R4C6', 'R7C1', 'R8C5', 'R9C3', 'R9C5'];
const green = ['R3C3', 'R3C6', 'R4C7', 'R5C4', 'R6C1', 'R7C3', 'R9C6'];
const purple = ['R1C7', 'R4C1', 'R4C4', 'R5C7', 'R6C2', 'R7C9', 'R8C1', 'R9C4'];

// Pill cell pairs in the top row, keyed by the colour of the square at the
// pill's centre. Tens digit first.
const pills = {
  orange: ['R1C1', 'R1C2'],
  green: ['R1C4', 'R1C5'],
  purple: ['R1C7', 'R1C8'],
};

// Edges carrying an X (sum 10) and a V (sum 5).
const xEdges = [
  ['R2C8', 'R3C8'], ['R3C4', 'R4C4'], ['R3C6', 'R4C6'], ['R4C2', 'R5C2'],
  ['R4C7', 'R5C7'], ['R6C1', 'R7C1'], ['R6C5', 'R6C6'], ['R9C3', 'R9C4'],
  ['R9C5', 'R9C6'],
];
const vEdges = [
  ['R6C1', 'R6C2'], ['R8C5', 'R9C5'],
];

const colourSets = [
  [orange, pills.orange],
  [green, pills.green],
  [purple, pills.purple],
];

return [
  new Shape('9x9'),

  ...colourSets.map(([cells]) => new AllDifferent(...cells)),
  // PillArrow(2, ...) reads the two pill cells as a 2-digit number and equates
  // it with the sum of the remaining cells.
  ...colourSets.map(([cells, pill]) => new PillArrow(2, ...pill, ...cells)),

  ...xEdges.map((edge) => new X(...edge)),
  ...vEdges.map((edge) => new V(...edge)),
];
