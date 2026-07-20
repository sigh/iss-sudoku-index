// Title: Colour Coordinated Differences
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=lCIHkjKxL08
// Source: https://sudokupad.app/mlt4l6zcak

// Each entry records the digit supplying the target row (shaft), the digit
// supplying the target column (head), and the arrow's colour rule.
const arrows = [
  { color: 'black', shaft: 'R1C2', head: 'R1C1' },
  { color: 'black', shaft: 'R2C1', head: 'R2C2' },
  { color: 'green', shaft: 'R4C3', head: 'R5C3' },
  { color: 'green', shaft: 'R6C3', head: 'R5C2' },
  { color: 'black', shaft: 'R6C4', head: 'R5C4' },
  { color: 'pink', shaft: 'R7C5', head: 'R6C6' },
  { color: 'green', shaft: 'R8C5', head: 'R7C6' },
  { color: 'green', shaft: 'R9C6', head: 'R8C7' },
  { color: 'green', shaft: 'R9C9', head: 'R9C8' },
  { color: 'pink', shaft: 'R6C7', head: 'R6C8' },
  { color: 'black', shaft: 'R6C9', head: 'R7C9' },
  { color: 'pink', shaft: 'R4C7', head: 'R5C7' },
  { color: 'green', shaft: 'R5C9', head: 'R4C8' },
  { color: 'black', shaft: 'R2C5', head: 'R2C4' },
  { color: 'pink', shaft: 'R1C4', head: 'R1C5' },
  { color: 'pink', shaft: 'R1C7', head: 'R1C8' },
  { color: 'green', shaft: 'R4C9', head: 'R4C8' },
  { color: 'black', shaft: 'R9C5', head: 'R8C4' },
];

const arrowCells = arrows.flatMap(({ shaft, head }) => [shaft, head]);

// For each possible target coordinate, scan all arrows. A matching coordinate
// must put its digit difference in this target, and a second match is rejected.
const targetRules = [];
for (let targetRow = 1; targetRow <= 9; targetRow++) {
  for (let targetCol = 1; targetCol <= 9; targetCol++) {
    // Every colour rule forces unequal arrow digits, so diagonal coordinates
    // can never be targeted and need no lookup constraint.
    if (targetRow === targetCol) continue;
    const targetCell = makeCellId(targetRow, targetCol);
    const machine = NFA.encodeSpec({
      startState: {
        phase: 'target', target: null, shaftMatches: false, seen: false,
      },
      transition: (state, value) => {
        if (state.phase === 'target') {
          return {
            phase: 'shaft', target: value, shaftMatches: false, seen: false,
          };
        }
        if (state.phase === 'shaft') {
          return {
            phase: 'head',
            target: state.target,
            shaftMatches: value === targetRow,
            seen: state.seen,
          };
        }

        const matches = state.shaftMatches && value === targetCol;
        if (matches && (state.seen || state.target !== Math.abs(targetRow - targetCol))) {
          return undefined;
        }
        return {
          phase: 'shaft',
          target: state.target,
          shaftMatches: false,
          seen: state.seen || matches,
        };
      },
      accept: state => state.phase === 'shaft',
    }, 9);
    targetRules.push(new NFA(
      machine,
      'coordinate target',
      targetCell,
      ...arrowCells,
    ));
  }
}

// Generic pairs also cover the arrows drawn diagonally across a cell corner.
const colorKeys = {
  black: Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, 9),
  green: Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, 9),
  pink: Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9),
};
const colorRules = arrows.map(({ color, shaft, head }) => new Pair(
  colorKeys[color],
  `${color} arrow`,
  shaft,
  head,
));

return [
  new Shape('9x9'),
  ...colorRules,
  ...targetRules,
];
