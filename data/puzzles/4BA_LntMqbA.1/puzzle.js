// Title: Nov 24, 2021: Quad Max
// Author: clover!
// Video: https://www.youtube.com/watch?v=4BA_LntMqbA
// Source: https://tinyurl.com/b2vu85wp

// Normal sudoku. Each of the 14 quad markers is a diagonal-arrow circle
// drawn at a 2x2-cell intersection; the arrow's compass direction points at
// one specific corner cell of the block, which holds the largest digit of
// the four -- the other three hold strictly smaller digits (which may
// repeat each other, subject to the ordinary row/column/box rules). Nothing
// is omitted.

// Strict-max scan: the first cell in each list is the direction-pointed
// target; each remaining cell must be strictly less than it.
const targetMaxSpec = NFA.encodeSpec({
  startState: { phase: 'target' },
  transition: (state, value) => {
    if (state.phase === 'target') return { phase: 'rest', target: value };
    return value < state.target ? state : undefined;
  },
  accept: state => state.phase === 'rest',
}, 9);

// Quad markers, provenance: the payload's 14 `circle` overlays. Each entry
// is [targetCell, ...otherThreeCells]; targetCell is the corner cell named
// by the marker's arrow direction (NW/NE/SE/SW -> top-left/top-right/
// bottom-right/bottom-left corner of its 2x2 block).
const quads = [
  ['R2C1', 'R2C2', 'R3C1', 'R3C2'],
  ['R2C5', 'R2C6', 'R3C5', 'R3C6'],
  ['R3C3', 'R3C4', 'R4C3', 'R4C4'],
  ['R1C8', 'R1C9', 'R2C8', 'R2C9'],
  ['R7C6', 'R7C7', 'R8C6', 'R8C7'],
  ['R8C8', 'R8C9', 'R9C8', 'R9C9'],
  ['R1C2', 'R1C1', 'R2C1', 'R2C2'],
  ['R8C2', 'R8C1', 'R9C1', 'R9C2'],
  ['R4C6', 'R4C5', 'R5C5', 'R5C6'],
  ['R6C8', 'R5C7', 'R5C8', 'R6C7'],
  ['R7C3', 'R6C2', 'R6C3', 'R7C2'],
  ['R4C8', 'R3C7', 'R3C8', 'R4C7'],
  ['R9C4', 'R8C4', 'R8C5', 'R9C5'],
  ['R6C4', 'R5C4', 'R5C5', 'R6C5'],
];

return [
  new Shape('9x9'),

  new Given('R1C6', 1),
  new Given('R2C1', 5),
  new Given('R2C5', 7),
  new Given('R3C3', 3),
  new Given('R3C7', 8),
  new Given('R4C2', 4),
  new Given('R4C6', 5),
  new Given('R6C4', 8),
  new Given('R6C8', 4),
  new Given('R7C3', 7),
  new Given('R7C7', 4),
  new Given('R8C5', 4),
  new Given('R8C9', 7),
  new Given('R9C4', 5),

  ...quads.map((cells, i) =>
    new NFA(targetMaxSpec, `quad-max-${i}`, ...cells)),
];
