// Title: Point to Next Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=lbgLAhRoBOA
// Source: https://app.crackingthecryptic.com/sudoku/t8PmGmHHnq

// Normal sudoku rules (standard 3x3 boxes). Fifteen cells carry a small
// directional arrow mark (no line, just a direction). Rule: if an arrow
// cell holds digit d < 9, then d + 1 must appear somewhere among the cells
// strictly beyond it, along the marked direction, to the grid edge. d = 9
// imposes nothing. Unmarked cells carry no such requirement.
//
// Directions are read from each arrow's drawn tail-to-head waypoints.

const graph = cellGraph('9x9');

// Direction vectors as (dRow, dCol).
const RIGHT = [0, 1], LEFT = [0, -1], UP = [-1, 0], DOWN = [1, 0];

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

// Single-segment NFA: the first cell in the sequence is the arrow's own
// cell, the rest are the ray beyond it (excluding the arrow cell itself,
// via .slice(1) on the inclusive ray helper).
//
// State is `null` until the arrow cell's own value is read: it sets the
// state to 'ok' when that value is 9 (nothing further required), or to the
// needed value (d + 1) otherwise. Every following ray cell matching the
// needed value flips the state to 'ok'; the state is otherwise unchanged.
// The whole sequence is accepted only in state 'ok'.
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

  ...Object.entries(arrows).map(([cell, dir]) =>
    new NFA(spec, `point-${cell}`, [cell, ...graph.ray(cell, ...dir).slice(1)])),
];
