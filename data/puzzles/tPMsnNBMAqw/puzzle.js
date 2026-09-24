// Title: Hitpoint Arrows
// Author: damo_89
// Video: https://www.youtube.com/watch?v=tPMsnNBMAqw
// Source: https://sudokupad.app/f94f3zm4s1

// Rules: normal sudoku. A digit on an arrow is the sum of all digits along the
// arrow's direction that are the "correct" number of steps away, i.e. the digit
// k steps from the arrow cell counts when it equals k (the adjacent cell is
// step 1, per the rules' worked example 32947 -> 2 + 4 = 6).

// Arrow cell -> the (dRow, dCol) step its arrow points along, read from the
// drawn arrow glyphs (shaft plus chevron tip).
const arrows = {
  // Small diagonal arrows drawn in a cell corner.
  R1C1: [1, 1],
  R3C1: [1, 1],
  R7C1: [-1, 1],
  R5C8: [1, -1],
  R7C7: [-1, -1],
  R9C9: [-1, -1],
  // Orthogonal arrows drawn across the cell centre.
  R1C4: [1, 0],
  R3C4: [0, 1],
  R3C5: [0, 1],
  R4C2: [0, 1],
  R4C3: [0, 1],
  R9C6: [-1, 0],
};

// Input: the arrow cell, then the ray cells in step order. State: the
// remaining quota (arrow digit minus hits so far) and the current step.
const spec = NFA.encodeSpec({
  startState: { quota: null, step: 0 },
  transition: ({ quota, step }, value) => {
    if (quota === null) return { quota: value, step: 0 };
    // A ray on a 9x9 grid has at most 8 cells; reject a longer input.
    if (step === 8) return undefined;
    const k = step + 1;
    const q = quota - (value === k ? value : 0);
    if (q < 0) return undefined;
    return { quota: q, step: k };
  },
  accept: ({ quota }) => quota === 0,
}, 9);

const graph = cellGraph('9x9');

return [
  new Shape('9x9'),
  ...Object.entries(arrows).map(([cell, [dr, dc]]) =>
    new NFA(spec, 'HPA', cell, ...graph.ray(cell, dr, dc).slice(1))),
];
