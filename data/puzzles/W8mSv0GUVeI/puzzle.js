// Title: See It, Say It, Sorted
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=W8mSv0GUVeI
// Source: https://sudokupad.app/yrlckvek4z

// Normal Sudoku rules apply (default row/column/box all-different).
//
// Seven camera icons are drawn off-grid, each aimed along a broken diagonal
// running from its edge position into the grid (cell list transcribed from
// the drawn dashed diagonal segments and camera-icon positions). For each
// camera's diagonal: "The first
// digit on a diagonal seen by a camera indicates how many times that digit
// appears on that diagonal. Any leftover digits on the diagonal (the ones
// not equal to the first digit) are sorted from lowest to highest, i.e. they
// appear in non-decreasing order moving away from the camera." Cell lists
// below are ordered nearest-camera-first, matching that reading direction.
// Two cameras (top-of-C1 and right-of-R9) aim along the same 8-cell broken
// diagonal from opposite ends, so it carries two independent instances of
// the rule (drawn as two distinct icons with two distinct dashed rays).
//
// Speech bubbles (three speech-bubble overlays) all say the same odd digit.

const CAMERA_DIAGONALS = [
  // top, above C1 -> down-right
  ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9'],
  // top, above C5 -> down-left
  ['R1C4', 'R2C3', 'R3C2', 'R4C1'],
  // top, above C6 -> down-left
  ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'],
  // top, above C7 -> down-left
  ['R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1'],
  // left, beside R4 -> down-right
  ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5'],
  // right, beside R9 -> up-left (same line as the first diagonal, opposite end)
  ['R8C9', 'R7C8', 'R6C7', 'R5C6', 'R4C5', 'R3C4', 'R2C3', 'R1C2'],
  // bottom-right corner -> up-left (main diagonal)
  ['R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1'],
];

// State: `target` is the first (nearest-camera) cell's value, 0 until set.
// `count` counts cells (including the first) equal to target, clamped at
// target+1 once it can only fail. `last` is the most recently seen leftover
// (non-target) value, 0 until the first leftover is seen; each new leftover
// must be >= it, encoding the non-decreasing sort. Accept iff a target was
// set and its final count equals it exactly.
const cameraSpec = {
  startState: { target: 0, count: 0, last: 0 },
  transition: ({ target, count, last }, value) => {
    if (target === 0) return { target: value, count: 1, last: 0 };
    if (value === target) {
      return { target, count: Math.min(count + 1, target + 1), last };
    }
    if (last !== 0 && value < last) return undefined;
    return { target, count, last: value };
  },
  accept: ({ target, count }) => target !== 0 && count === target,
};
const cameraNFA = NFA.encodeSpec(cameraSpec, 9);

const speechBubbleCells = ['R8C2', 'R4C5', 'R1C9'];

return [
  new Shape('9x9'),

  ...CAMERA_DIAGONALS.map(cells => new NFA(cameraNFA, 'Camera', cells)),

  new SameValues(3, ...speechBubbleCells),
  ...speechBubbleCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
];
