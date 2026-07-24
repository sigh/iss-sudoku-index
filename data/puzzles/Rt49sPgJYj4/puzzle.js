// Title: Cookie Crime Part 1: Hide And Sneak
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=Rt49sPgJYj4
// Source: https://sudokupad.app/sotpbtg8o1

// Chaos Construction: rows, columns, and 9 orthogonally-connected regions of
// size 9 (shape/position unknown) each contain digits 1-9 once.
//
// Blue circles (thick outline): the digit in the circle equals the number of
// cells its own region occupies in the circle's row and column, scanning out
// from the circle to the first region border (a differently-labelled
// neighbour) in each of the four directions, including the circle's own
// cell once. The 9 blue circles lie in 9 different regions (one per region).
//
// Black circles (thin outline): the same counting rule; several black
// circles may share a region.
//
// Magenta arrows: the digit in the arrow's own cell equals the number of
// region borders crossed when scanning from that cell to the grid edge in
// the arrow's direction (the outer grid edge itself is never a border). A
// cell carrying more than one arrow has that same digit equal the border
// count in every pointed direction independently (not their sum).
//
// White dots: the two digits are consecutive. Black dots: one digit is
// double the other. Not all possible dots are marked (no negative
// implication from an absent dot).

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

const BLUE_CIRCLES = [
  'R1C1', 'R1C2', 'R1C3', 'R4C1', 'R3C7', 'R6C7', 'R7C8', 'R3C4', 'R6C9',
];
const BLACK_CIRCLES = ['R5C2', 'R2C3', 'R1C5', 'R1C6', 'R9C2'];

const WHITE_DOTS = [
  ['R1C5', 'R1C6'], ['R4C1', 'R4C2'], ['R4C2', 'R5C2'], ['R5C1', 'R6C1'],
  ['R7C1', 'R7C2'], ['R6C2', 'R7C2'], ['R7C5', 'R8C5'], ['R9C8', 'R9C9'],
  ['R6C4', 'R6C5'],
];
const BLACK_DOTS = [
  ['R2C1', 'R2C2'], ['R2C2', 'R2C3'], ['R1C5', 'R2C5'], ['R3C3', 'R4C3'],
  ['R6C4', 'R7C4'], ['R7C4', 'R7C5'],
];

// [cell, dRow, dCol] for each drawn magenta arrow glyph (recovered from the
// small line-segment fragments that draw the arrowhead: the tip is the
// vertex shared by the two glyph fragments, and the direction from the
// glyph's shaft-start cell to that tip gives the pointed direction).
// SudokuPad drawing coordinates are [row, col], row first.
const ARROWS = [
  ['R1C2', 1, 0], ['R1C2', 0, 1],
  ['R5C3', -1, 0], ['R5C3', 1, 0],
  ['R3C7', 0, -1],
  ['R4C7', 0, 1],
  ['R3C6', 1, 0],
  ['R2C5', 1, 0],
];

// Counts region-border crossings from a cell to the grid edge: the scanned
// sequence is [gridDigitCell, ccCellAtOrigin, ccCell1, ccCell2, ...]. The
// first value sets the target (the arrow cell's own digit); the second sets
// the running region label; each later CC label that differs from the
// previous one is a crossed border. Accept iff the total equals the target.
const borderCountSpec = NFA.encodeSpec({
  startState: { target: null, prevLabel: null, count: 0 },
  transition: ({ target, prevLabel, count }, value) => {
    if (target === null) return { target: value, prevLabel: null, count: 0 };
    if (prevLabel === null) return { target, prevLabel: value, count: 0 };
    const hit = value !== prevLabel ? 1 : 0;
    // Clamp: target + 1 is a sink meaning "already too many borders".
    return { target, prevLabel: value, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ target, prevLabel, count }) =>
    target !== null && prevLabel !== null && count === target,
  maxDepth: 10,
}, 9);

const borderArrows = ARROWS.map(([cell, dRow, dCol]) => {
  const ray = cc.ray(cc.at(cell), dRow, dCol);
  return new NFA(borderCountSpec, 'BorderCount', cell, ...ray);
});

// Blue/black circles: run length of same-region cells from the circle along
// all four directions (auto-generated when no arms are given), shared start
// counted once -- offset 0 matches "including itself".
const circleArrows = [...BLUE_CIRCLES, ...BLACK_CIRCLES].map(
  cell => new ChaosArrow(cell, 0));

const whiteDots = WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b));
const blackDots = BLACK_DOTS.map(([a, b]) => new BlackDot(a, b));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  new AllDifferent(...cc.at(BLUE_CIRCLES)),
  ...circleArrows,
  ...borderArrows,
  ...whiteDots,
  ...blackDots,
];
