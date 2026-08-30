// Title: May 18, 2022: Isodoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=6oz1O-Cp95Q
// Source: https://tinyurl.com/yxwhqkn8

// Rules: fill the grid with the digits 1 to 8; each 2x4 region contains every
// digit once each; each "row" and "column" contains 1 to 8 once each, a row or
// column continuing onto the adjoining surface when it reaches the edge of one.
//
// The board is the three visible faces of a cube, drawn isometrically. Three
// cube edges meet at the near corner; their directions are e0, e1 and e2, and
// each face is a 4x4 rhombus spanned by two of them:
//   surface 1 spans e0 and e1, surface 2 spans e1 and e2, surface 3 spans e2
//   and e0,
// so surfaces 1 and 3 share the e0 edge, surfaces 1 and 2 the e1 edge, and
// surfaces 2 and 3 the e2 edge. 48 cells in all, each digit six times.
//
// A cell is fixed by its two step counts, 0-3, along its surface's directions.
// Nothing in the rules is a grid row, column or box, so the encoding is on a
// Raw grid that states every rule itself; the 48 cells are laid out as 12x4,
// four grid rows per surface, with each surface's two step counts used as the
// grid row and grid column below.
const ROW_DIR = ['e1', 'e1', 'e0'];
const COL_DIR = ['e0', 'e2', 'e2'];

const STEPS = [0, 1, 2, 3];

// cell(surface, row, col), all three 0-indexed; makeCellId is 1-indexed and
// handles the base-17 ids that grid rows 10-12 need.
const cell = (f, r, c) => makeCellId(f * 4 + r + 1, c + 1);

// The four cells of surface f whose step along direction d is i: a grid row of
// that surface when d is its row direction, a grid column when d is its column
// direction.
const faceLine = (f, d, i) =>
  ROW_DIR[f] === d ? STEPS.map(c => cell(f, i, c))
                   : STEPS.map(r => cell(f, r, i));

// The twelve printed digits on the three surfaces, as
// [surface, step along ROW_DIR, step along COL_DIR, digit].
const givens = [
  [0, 0, 0, 4], [0, 3, 0, 1], [0, 3, 1, 2], [0, 3, 2, 3],
  [1, 0, 0, 5], [1, 0, 3, 1], [1, 1, 3, 8], [1, 2, 3, 7],
  [2, 0, 0, 7], [2, 3, 0, 4], [2, 3, 1, 5], [2, 3, 2, 6],
].map(([f, r, c, v]) => new Given(cell(f, r, c), v));

// Six 2x4 regions. A heavy line halves each surface, running from the midpoint
// of one cube edge to the midpoint of the opposite side: on surface 1 from 2e0
// to 2e0+4e1, on surface 2 from 2e1 to 2e1+4e2, on surface 3 from 2e2 to
// 2e2+4e0. Each cuts the surface's steps along one direction into {0,1} and
// {2,3}.
const CUT_DIR = ['e0', 'e1', 'e2'];
const regions = [0, 1, 2].flatMap(f =>
  [[0, 1], [2, 3]].map(
    half => new AllDifferent(...half.flatMap(i => faceLine(f, CUT_DIR[f], i)))));

// Twelve lines of eight cells, four in each of three directions. A line runs
// straight across the cube surface, perpendicular to the cube edge it crosses,
// so it holds its step along that edge's direction and takes four cells on each
// of the two surfaces sharing the edge.
const SHARED_EDGES = [
  ['e0', 0, 2], // surfaces 1 and 3 share the e0 edge
  ['e1', 0, 1], // surfaces 1 and 2 share the e1 edge
  ['e2', 1, 2], // surfaces 2 and 3 share the e2 edge
];
const lines = SHARED_EDGES.flatMap(([d, fa, fb]) =>
  STEPS.map(i => new AllDifferent(...faceLine(fa, d, i), ...faceLine(fb, d, i))));

return [
  new Shape('12x4', 8, 'Raw'),
  ...givens,
  ...regions,
  ...lines,
];
