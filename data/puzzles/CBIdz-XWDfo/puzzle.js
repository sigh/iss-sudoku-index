// Title: odd minesweeper
// Author: fezzy
// Video: https://www.youtube.com/watch?v=CBIdz-XWDfo
// Source: https://sudokupad.app/zwjpx8pg0t

// Rules encoded here:
//   Normal sudoku rules apply (9x9, standard boxes, no given digits).
//   A white dot joins consecutive digits.
//   A black dot joins digits with a 1:2 ratio.
//   A digit in a large circle is the count of odd digits a king's move away
//   from the circle, within that 3x3 box.
// Not encoded, and not a final-grid rule: the fog, which hides cells during
// play and clears around correctly placed digits.
// The dots are not declared exhaustive by the rules, so unmarked adjacent pairs
// carry no restriction and plain WhiteDot/BlackDot (not StrictKropki) are used.
// The circles are drawn as empty shapes with no printed digit, so "a digit in a
// large circle" is the digit the solver places in the circled cell.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Drawn data: the cell each of the 14 large circles is centred on.
const circles = [
  'R1C3', 'R1C4', 'R2C4', 'R3C3',
  'R4C1', 'R4C2', 'R4C7', 'R5C7',
  'R7C1', 'R7C4', 'R7C6', 'R8C1',
  'R9C7', 'R9C9',
];

// Drawn data: the cell pair each of the 13 white dots sits between.
const whiteDots = [
  ['R1C2', 'R1C3'], ['R1C4', 'R2C4'], ['R2C4', 'R2C5'], ['R2C1', 'R2C2'],
  ['R2C1', 'R3C1'], ['R3C1', 'R3C2'], ['R4C1', 'R5C1'], ['R1C7', 'R2C7'],
  ['R4C8', 'R4C9'], ['R4C8', 'R5C8'], ['R5C5', 'R5C6'], ['R7C2', 'R7C3'],
  ['R9C7', 'R9C8'],
];

// Drawn data: the cell pair each of the 8 black dots sits between.
const blackDots = [
  ['R1C3', 'R2C3'], ['R1C5', 'R2C5'], ['R4C1', 'R4C2'], ['R5C1', 'R6C1'],
  ['R6C4', 'R6C5'], ['R8C1', 'R8C2'], ['R8C3', 'R9C3'], ['R9C5', 'R9C6'],
];

// The king's-move neighbourhood the circle counts over: the up-to-8 king
// neighbours of the circled cell, kept only where they stay inside the circled
// cell's own 3x3 box. The circled cell is not one of its own king neighbours,
// so it never counts itself.
const boxes = graph.boxes();
const inBoxKingNeighbours = (cell) => {
  const box = boxes.find((cells) => cells.includes(cell));
  return graph.kingNeighbours(cell).filter((n) => box.includes(n));
};

// One machine per circle, reading the circled cell as segment 1 and its in-box
// king neighbours as segment 2. `target` is the circled digit, captured from
// the first symbol; `count` tallies odd neighbours and saturates at target + 1,
// a sink meaning "already more odd neighbours than the circle claims".
const oddCountSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (value === SEGMENT_BREAK) return { target, count };
    if (target === null) return { target: value, count: 0 };
    const isOdd = value % 2;
    return { target, count: Math.min(count + isOdd, target + 1) };
  },
  accept: ({ target, count }) => target !== null && count === target,
  // 1 circled cell + 1 SEGMENT_BREAK + at most 8 king neighbours.
  maxDepth: 10,
}, shape, { multiSegment: true });

return [
  shape,
  ...whiteDots.map((cells) => new WhiteDot(...cells)),
  ...blackDots.map((cells) => new BlackDot(...cells)),
  ...circles.map((cell) => new NFA(
    oddCountSpec, `odd-count-${cell}`, [cell], inBoxKingNeighbours(cell))),
];
