// Title: Beautiful Day
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=gN7kkt1-JqU
// Source: https://sudokupad.app/1c1i6cf4wu

// Rules encoded below:
//   * Normal sudoku: 1-9 once each per row, column and 3x3 box.
//   * Digits along an arrow sum to the digit in that arrow's circle.
//   * Digits separated by a white dot are consecutive; by a black dot, in a
//     1:2 ratio. The rules say not all dots are given and that there is no
//     negative constraint, so unmarked edges are left unrestricted.
//   * One cell of the grid is the "motivation": digits increase as they move
//     away from it in every straight-line direction - vertically,
//     horizontally and diagonally - out to the edge of the grid. No mark says
//     which cell it is.
//
// Not encoded, and not conditions on the finished grid: the fog that hides the
// board while solving, and the FOGLIGHT area that starts uncovered. "Each
// arrow has its own colour. Arrows of the same colour are connected" names the
// device that pairs a shaft with its circle while fog covers part of the
// figure; each of the four colours is drawn as one connected arrow from its own
// circle, so it adds no condition here.

const graph = cellGraph('9x9');

// Arrows, circle first then the arm in drawn stroke order. Transcribed from the
// four coloured arrow strokes, each beginning on the rim of the circle sharing
// its colour.
const arrows = [
  ['R1C6', 'R2C5', 'R1C4', 'R2C4'],                  // purple
  ['R7C2', 'R6C1', 'R5C1'],                          // pink
  ['R5C4', 'R6C3', 'R7C3'],                          // green
  ['R2C3', 'R3C4', 'R4C4', 'R3C3', 'R3C2', 'R4C1'],  // orange
];

// Kropki dots, transcribed from the edge-centred dot marks: black-filled dots
// first, then the white-filled ones.
const blackDots = [
  ['R1C2', 'R2C2'],
  ['R2C2', 'R3C2'],
  ['R2C6', 'R2C7'],
  ['R5C2', 'R5C3'],
];
const whiteDots = [
  ['R3C3', 'R3C4'],
  ['R2C6', 'R3C6'],
];

// The eight straight-line directions the motivation rule lists: the four
// orthogonal ones and the four diagonal ones.
const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

// The motivation cell is not drawn, so every cell of the grid is a candidate.
// Each branch takes one candidate and states the whole rule for it: a
// thermometer bulbed at that cell running out to the grid edge along each of
// the eight directions, which is "increasing as you move away from this point
// ... until they reach the edge". graph.ray() includes the candidate itself, so
// it is the bulb; a ray of one cell means the candidate is already on the edge
// in that direction and carries no comparison. The Or is the rules' "one cell
// in the grid is your ... motivation".
const motivation = new Or(
  graph.cells().map(cell => new And(
    directions
      .map(([dR, dC]) => graph.ray(cell, dR, dC))
      .filter(ray => ray.length > 1)
      .map(ray => new Thermo(...ray))
  ))
);

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...blackDots.map(pair => new BlackDot(...pair)),
  ...whiteDots.map(pair => new WhiteDot(...pair)),
  motivation,
];
