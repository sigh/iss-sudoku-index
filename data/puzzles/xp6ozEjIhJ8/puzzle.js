// Title: Modularrows
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=xp6ozEjIhJ8
// Source: https://sudokupad.app/nozibzvmcc

// Normal sudoku rules apply.
//
// Modular arrows: a digit on an arrow counts how many cells in the indicated
// direction have the same remainder mod-3 as itself, including itself. Each
// arrow lives entirely inside its origin cell; the ray it counts runs from
// the origin cell to the edge of the grid along the indicated direction,
// including the origin cell itself.
//
// Encoded as one NFA per arrow, scanned along its ray starting at the origin
// cell. The first value read fixes the target (the origin digit) and its
// mod-3 remainder; each later cell contributes to the running count only when
// its remainder matches. The ray accepts when the final count equals the
// origin digit. Pruning: once the count exceeds the target it can only grow,
// so the branch dies immediately instead of waiting for the ray to finish.

const graph = cellGraph('9x9');

// Origin cell -> (dRow, dCol) step of the arrow's direction.
const arrows = {
  R1C1: [1, 1],
  R3C3: [0, 1],
  R3C4: [1, -1],
  R3C8: [1, 0],
  R3C9: [1, 0],
  R4C4: [1, 1],
  R5C5: [1, 1],
  R5C7: [-1, -1],
  R6C1: [1, 1],
  R6C4: [-1, 1],
  R6C6: [1, 1],
  R6C8: [-1, -1],
  R8C9: [-1, -1],
  R9C1: [-1, 1],
  R9C2: [0, 1],
};

const modularArrowSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) {
      // The origin cell sets the target digit; it always matches itself.
      return { target: value, count: 1 };
    }
    const next = count + ((value % 3) === (target % 3) ? 1 : 0);
    if (next > target) return [];   // count can only grow from here: dead end
    return { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, 9);

const modularArrows = Object.entries(arrows).map(([origin, [dRow, dCol]]) =>
  new NFA(modularArrowSpec, 'MA', ...graph.ray(origin, dRow, dCol)));

return [
  new Shape('9x9'),
  ...modularArrows,
];
