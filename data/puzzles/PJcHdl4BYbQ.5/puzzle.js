// Title: Up and Down Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=PJcHdl4BYbQ
// Source: https://tinyurl.com/4f4m6vrk

// Normal sudoku rules apply (rows, columns, boxes -- the default Shape
// groups). Along each grey line, the sequence of digits (read along the
// drawn stroke, wrapping around for the closed loop) alternately increases
// and decreases. The rules do not say which direction the first step takes,
// so both starting parities are live for each line, independently.

// Loop around the centre box: two stroke entries in the payload's `line`
// array that share endpoints (a 16-cell run, then a 2-cell closer back to
// its start), combined here into one 16-cell cycle.
const loopCells = [
  'R4C2', 'R5C2', 'R6C2', 'R7C3', 'R8C4', 'R8C5', 'R8C6', 'R7C7', 'R6C8',
  'R5C8', 'R4C8', 'R3C7', 'R2C6', 'R2C5', 'R2C4', 'R3C3',
];

// Line around the centre cell: one 7-cell open stroke.
const centreLineCells = [
  'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6', 'R5C6', 'R4C6',
];

// Alternating up/down NFA. Consumes a cell sequence in list order (not
// grid-adjacency-bound, per the Lines catalog). State tracks the previous
// digit and whether the next step must increase or decrease; the two start
// states are the two candidate parities for the line's first step, and a
// step that violates the expected direction kills that branch.
const upDownSpec = {
  startState: [{ prev: null, up: true }, { prev: null, up: false }],
  transition: ({ prev, up }, value) => {
    if (prev === null) return { prev: value, up };
    if (up ? value <= prev : value >= prev) return undefined;
    return { prev: value, up: !up };
  },
  accept: () => true,
};
const upDownNFA = NFA.encodeSpec(upDownSpec, 9);

// Closed loop: repeat the start cell at the end of the cell list so the NFA
// also scans the wrap-around step back to the first cell.
const loopUpDown = new NFA(upDownNFA, 'up-down loop', ...loopCells, loopCells[0]);
const centreUpDown = new NFA(upDownNFA, 'up-down centre', ...centreLineCells);

return [
  new Shape('9x9'),

  new Given('R1C1', 7), new Given('R1C3', 4), new Given('R1C7', 2), new Given('R1C9', 5),
  new Given('R2C2', 8), new Given('R2C4', 1), new Given('R2C8', 6),
  new Given('R3C1', 6), new Given('R3C9', 4),
  new Given('R4C5', 1), new Given('R4C8', 7),
  new Given('R5C4', 4), new Given('R5C6', 2),
  new Given('R6C2', 7), new Given('R6C5', 6),
  new Given('R7C1', 4), new Given('R7C9', 1),
  new Given('R8C2', 2), new Given('R8C6', 8), new Given('R8C8', 4),
  new Given('R9C1', 9), new Given('R9C3', 3), new Given('R9C7', 7), new Given('R9C9', 8),

  loopUpDown,
  centreUpDown,
];
