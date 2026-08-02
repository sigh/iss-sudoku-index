// Title: Quadrarrows
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=zU6xAz1nEfY
// Source: https://sudokupad.app/51lxch73sn

// Normal sudoku rules apply.  There are no givens.
//
// The sum of digits on an arrow must equal one of the digits in the four cells
// surrounding the connected circle.  If more than one arrow on the same circle
// have the same sum, then said sum must appear at least that many times in the
// cells surrounding the circle.
//
// Both sentences are encoded; no rule is omitted.

// Drawn data: the eight white circles sit on grid corners, so the four cells
// surrounding a circle are a 2x2 block, named here by its top-left cell.  Every
// grey shaft runs through exactly one circle, so a shaft with an arrowhead at
// each end is two arrows sharing that circle.  Each arm below runs from the
// circle outwards to its arrowhead and lists every cell whose centre the shaft
// crosses, beginning with the cell it enters on leaving the circle.
const quadrarrows = [
  {quad: 'R1C2', arms: [['R1C2'], ['R2C3', 'R3C4', 'R3C5']]},
  {quad: 'R1C7', arms: [['R1C7', 'R1C6', 'R2C5', 'R1C4'], ['R2C8', 'R3C8']]},
  {quad: 'R4C2', arms: [['R4C2', 'R3C1'], ['R4C3', 'R4C4']]},
  {quad: 'R5C5', arms: [['R6C5', 'R7C4', 'R8C4', 'R9C4']]},
  {quad: 'R5C7', arms: [['R5C8', 'R4C8', 'R3C9'], ['R6C7', 'R7C6']]},
  {quad: 'R6C8', arms: [['R6C8'], ['R6C9', 'R5C9']]},
  {quad: 'R7C6', arms: [['R8C7', 'R9C7', 'R9C6']]},
  {quad: 'R8C3', arms: [['R8C3', 'R8C2']]},
];

function quadCells(topLeft) {
  const {row, col} = parseCellId(topLeft);
  return [[0, 0], [0, 1], [1, 0], [1, 1]].map(
    ([dr, dc]) => makeCellId(row + dr, col + dc));
}

// Every way of pairing the arms with distinct surrounding cells.
function injections(items, choices) {
  if (!items.length) return [[]];
  const [first, ...rest] = items;
  return choices.flatMap((choice, index) =>
    injections(rest, choices.filter((_, other) => other !== index))
      .map((tail) => [[first, choice], ...tail]));
}

// Some pairing must hold, each arm summing to the digit of its paired cell.
// Requiring the pairing to be injective is the duplicate-sum sentence: k arms
// with a common sum consume k distinct surrounding cells, so that digit occurs
// at least k times around the circle.  Arms with unequal sums land on different
// cells regardless, so injectivity adds nothing in that case.
function quadrarrow({quad, arms}) {
  const cells = quadCells(quad);
  return new Or(injections(arms, cells).map(
    (pairing) => new And(pairing.map(
      ([arm, cell]) => new Arrow(cell, ...arm)))));
}

return [
  new Shape('9x9'),
  ...quadrarrows.map(quadrarrow),
];
