// Title: Beautiful Day
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=WNCFU6z1SxM
// Source: https://sudokupad.app/1c1i6cf4wu

// Normal 9x9 sudoku, no givens, plus:
//  - Digits along an arrow sum to the digit in that arrow's circle. Each of the
//    four arrows is drawn in its own colour and no colour is repeated, so the
//    rules' "arrows of the same colour are connected" joins nothing here.
//  - Digits separated by a white dot are consecutive; digits separated by a
//    black dot are in a 1:2 ratio. Not all dots are given: no negative
//    constraint.
//  - One cell of the grid is the "motivation": digits increase as they move
//    away from it in every straight-line direction, vertical, horizontal and
//    diagonal, until they reach the edge of the grid.
// The fog cover and its lit starting area are solving UI and set no condition
// on the finished grid, so they are not encoded.

const SIZE = 9;
const INDICES = Array.from({ length: SIZE }, (_, i) => i + 1);
// The eight straight-line directions the motivation rule names.
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

// Cells from (row, col) outwards in one direction, stopping at the grid edge.
// The starting cell is included: the rule measures the increase from the
// motivation cell itself, "as they move away from this point ... until they
// reach the edge of the grid".
const rayFrom = (row, col, dRow, dCol) => {
  const cells = [];
  for (let r = row, c = col;
    r >= 1 && r <= SIZE && c >= 1 && c <= SIZE;
    r += dRow, c += dCol) {
    cells.push(makeCellId(r, c));
  }
  return cells;
};

// The motivation cell is not drawn anywhere, so it is a disjunction over every
// cell it could be. Each alternative asserts all eight of that cell's rays at
// once; a ray of one cell (a direction that leaves the grid immediately) says
// nothing and is dropped.
const motivationOptions = INDICES.flatMap(
  row => INDICES.map(
    col => new And(
      DIRECTIONS
        .map(([dRow, dCol]) => rayFrom(row, col, dRow, dCol))
        .filter(ray => ray.length > 1)
        .map(ray => new Thermo(...ray)))));

return [
  new Shape('9x9'),

  // Circle cell first, then the arm, for each of the four drawn arrows.
  new Arrow('R1C6', 'R2C5', 'R1C4', 'R2C4'),
  new Arrow('R7C2', 'R6C1', 'R5C1'),
  new Arrow('R5C4', 'R6C3', 'R7C3'),
  new Arrow('R2C3', 'R3C4', 'R4C4', 'R3C3', 'R3C2', 'R4C1'),

  // The six drawn edge dots.
  new BlackDot('R1C2', 'R2C2'),
  new BlackDot('R2C2', 'R3C2'),
  new BlackDot('R2C6', 'R2C7'),
  new BlackDot('R5C2', 'R5C3'),
  new WhiteDot('R3C3', 'R3C4'),
  new WhiteDot('R2C6', 'R3C6'),

  new Or(motivationOptions),
];
