// Title: July 1, 2023: Renban Walls
// Author: clover!
// Video: https://www.youtube.com/watch?v=1ApDRSPPpvg
// Source: https://tinyurl.com/4wybsbmr

// Normal sudoku rules apply.
//
// Nine vertical "renban walls" each straddle one box-internal column
// boundary for a run of 2-3 rows. For each wall: the cells touching its
// left side form a set of consecutive digits, the cells touching its right
// side form a set of consecutive digits, and all cells touching the wall
// together also form a set of consecutive digits -- each independently, in
// any order (Renban's semantics). Wall extents (column pair, row range)
// are recovered from the drawn wall art: paired 2-cell row segments plus
// 4-cell row-connectors bridging them into one continuous run.

const walls = [
  { left: ['R4C1', 'R5C1', 'R6C1'], right: ['R4C2', 'R5C2', 'R6C2'] },
  { left: ['R8C1', 'R9C1'], right: ['R8C2', 'R9C2'] },
  { left: ['R3C2', 'R4C2', 'R5C2'], right: ['R3C3', 'R4C3', 'R5C3'] },
  { left: ['R2C3', 'R3C3', 'R4C3'], right: ['R2C4', 'R3C4', 'R4C4'] },
  { left: ['R1C4', 'R2C4', 'R3C4'], right: ['R1C5', 'R2C5', 'R3C5'] },
  { left: ['R3C8', 'R4C8'], right: ['R3C9', 'R4C9'] },
  { left: ['R5C7', 'R6C7', 'R7C7'], right: ['R5C8', 'R6C8', 'R7C8'] },
  { left: ['R6C6', 'R7C6', 'R8C6'], right: ['R6C7', 'R7C7', 'R8C7'] },
  { left: ['R7C5', 'R8C5', 'R9C5'], right: ['R7C6', 'R8C6', 'R9C6'] },
];

// Each wall contributes three Renban groups: left side, right side, and
// the union of both sides.
const wallConstraints = walls.flatMap(({ left, right }) => [
  new Renban(...left),
  new Renban(...right),
  new Renban(...left, ...right),
]);

return [
  new Shape('9x9'),

  // Givens, transcribed from the puzzle's stored grid values.
  new Given('R1C4', 1),
  new Given('R1C7', 4),
  new Given('R2C3', 5),
  new Given('R2C8', 9),
  new Given('R3C2', 3),
  new Given('R3C9', 5),
  new Given('R4C1', 1),
  new Given('R5C7', 5),
  new Given('R6C6', 3),
  new Given('R7C1', 9),
  new Given('R7C5', 1),
  new Given('R8C2', 7),
  new Given('R9C3', 3),

  ...wallConstraints,
];
