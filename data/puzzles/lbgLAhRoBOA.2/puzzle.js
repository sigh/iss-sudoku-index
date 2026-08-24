// Title: Point to Next Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=lbgLAhRoBOA
// Source: https://app.crackingthecryptic.com/sudoku/t8PmGmHHnq

// Normal sudoku rules apply (standard 3x3 boxes). Fifteen cells carry a small
// directional mark: "An arrow points to the next highest number. So if 8 is in
// an arrow cell, 9 must appear somewhere in the direction in which the arrow
// points."
//
// Encoded: for an arrow cell holding d, d + 1 appears in at least one cell
// strictly beyond it along the marked direction, out to the grid edge. The
// scope is the whole ray because the rules sentence says the digit must appear
// "somewhere in the direction", naming no nearer limit.
//
// Two relaxations, both deliberate:
//   * d = 9 imposes nothing. The rules text never says what an arrow on a 9
//     means; the reading on which "points to the next highest number" fails
//     for a cell with no higher digit, and so bars 9 from all fifteen arrow
//     cells, is not encoded.
//   * Nothing constrains which cells lie between the arrow and its d + 1. The
//     reading on which the first ray cell exceeding d must itself be d + 1 is
//     not encoded; the rules text says only that d + 1 appears.
// Cells without a mark carry no requirement.

const graph = cellGraph('9x9');

// Direction vectors as (dRow, dCol).
const RIGHT = [0, 1], LEFT = [0, -1], UP = [-1, 0], DOWN = [1, 0];

// Transcribed from the fifteen drawn arrow marks, each a short stroke centred
// in one cell; the direction is the stroke's tail-to-head sense.
const arrows = {
  R1C6: RIGHT,
  R2C4: RIGHT,
  R2C5: RIGHT,
  R2C6: RIGHT,
  R3C3: RIGHT,
  R3C7: LEFT,
  R4C9: DOWN,
  R5C1: UP,
  R5C7: DOWN,
  R7C2: DOWN,
  R7C3: RIGHT,
  R7C8: DOWN,
  R7C9: DOWN,
  R8C7: RIGHT,
  R9C4: LEFT,
};

// One machine per arrow, scanning the arrow cell followed by its ray.
//
// `null` is the start state, before the arrow cell's own digit has been read.
// Reading that digit d records what the ray owes: 'ok' already when d is 9
// (nothing is owed), otherwise `{need: d + 1}`. A later ray cell holding the
// owed value switches to 'ok', which is the only accepting state.
const spec = NFA.encodeSpec({
  startState: null,
  transition: (state, value) => {
    if (state === null) {
      return value === 9 ? 'ok' : { need: value + 1 };
    }
    if (state === 'ok') return 'ok';
    return value === state.need ? 'ok' : state;
  },
  accept: (state) => state === 'ok',
}, 9);

return [
  new Shape('9x9'),

  // Givens, from the drawn grid.
  new Given('R1C1', 1), new Given('R1C2', 2), new Given('R1C3', 3),
  new Given('R1C7', 7), new Given('R1C8', 8), new Given('R1C9', 9),
  new Given('R4C2', 6), new Given('R4C8', 2),
  new Given('R5C2', 7), new Given('R5C8', 3),
  new Given('R6C2', 8), new Given('R6C8', 4),
  new Given('R8C4', 9), new Given('R8C5', 5), new Given('R8C6', 1),

  // `graph.ray` is inclusive of its origin, so the arrow cell is passed once
  // as the head of the scan and dropped from the tail.
  ...Object.entries(arrows).map(([cell, dir]) =>
    new NFA(spec, `point-${cell}`, [cell, ...graph.ray(cell, ...dir).slice(1)])),
];
