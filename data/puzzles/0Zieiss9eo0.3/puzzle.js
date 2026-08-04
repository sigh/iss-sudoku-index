// Title: Emitter Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=0Zieiss9eo0
// Source: https://tinyurl.com/4mbna2cj

// Normal sudoku rules apply. The four circled givens (R6C2=7, R2C4=8,
// R4C8=9, R8C6=6) are "emitters". Each has one drawn line per orthogonal
// direction; the digits on a line sum to at most the emitter's value, and
// the line is as long as possible, i.e. the cell just past the line (if any)
// would push the sum over the emitter's value were it included. A direction
// with no drawn line means that adjacent cell alone already exceeds the
// emitter's value.
//
// emitterLine(threshold, armCells, nextCell) builds one NFA per line:
// armCells are the line's cells in order away from the emitter; nextCell is
// the cell just beyond the line, when the grid doesn't end there. The NFA
// state {i, sum} tracks how many arm cells have been read and their running
// sum; a transition that would push the arm sum over threshold is rejected
// outright (sum only grows, so this is equivalent to checking the total),
// and reading nextCell is only accepted if it would have exceeded threshold
// too. `i` reaching the full segment length is what "accept" checks.
const emitterLine = (threshold, armCells, nextCell) => {
  const armLen = armCells.length;
  const hasNext = nextCell !== undefined;
  const totalLen = armLen + (hasNext ? 1 : 0);
  const spec = NFA.encodeSpec({
    startState: { i: 0, sum: 0 },
    transition: ({ i, sum }, value) => {
      if (i < armLen) {
        const newSum = sum + value;
        if (newSum > threshold) return undefined;
        return { i: i + 1, sum: newSum };
      }
      // Consuming the cell just past the line: the line is only maximal if
      // this cell would have broken the budget.
      if (sum + value <= threshold) return undefined;
      return { i: i + 1, sum };
    },
    accept: ({ i }) => i === totalLen,
    // Bounds state creation to this line's fixed, short length (<= 3 here);
    // without it the compiler explores `i` incrementing forever.
    maxDepth: totalLen,
  }, 9);
  const cells = hasNext ? [...armCells, nextCell] : armCells;
  return new NFA(spec, 'Emitter', ...cells);
};

const emitterLines = [
  // R6C2 = 7. Left has no drawn line -> R6C1 must exceed 7, encoded as a
  // candidate restriction below instead of an NFA.
  emitterLine(7, ['R6C3', 'R6C4'], 'R6C5'),
  emitterLine(7, ['R7C2', 'R8C2'], 'R9C2'),
  emitterLine(7, ['R5C2', 'R4C2'], 'R3C2'),

  // R2C4 = 8. Up ends at the grid edge (R1C4), so there is no next cell.
  emitterLine(8, ['R3C4', 'R4C4'], 'R5C4'),
  emitterLine(8, ['R1C4']),
  emitterLine(8, ['R2C3', 'R2C2'], 'R2C1'),
  emitterLine(8, ['R2C5', 'R2C6'], 'R2C7'),

  // R4C8 = 9. Right ends at the grid edge (R4C9), so there is no next cell.
  emitterLine(9, ['R4C7', 'R4C6'], 'R4C5'),
  emitterLine(9, ['R4C9']),
  emitterLine(9, ['R3C8', 'R2C8'], 'R1C8'),
  emitterLine(9, ['R5C8', 'R6C8'], 'R7C8'),

  // R8C6 = 6. Down ends at the grid edge (R9C6), so there is no next cell.
  // Right's arm cells are R8C7, R8C8: the source draws this line as one
  // stroke R8C8-R8C7-R8C6-R8C5 that re-touches R8C5 (the left line's own
  // first cell, already covered below) rather than a fifth distinct line.
  emitterLine(6, ['R7C6', 'R6C6'], 'R5C6'),
  emitterLine(6, ['R9C6']),
  emitterLine(6, ['R8C5', 'R8C4'], 'R8C3'),
  emitterLine(6, ['R8C7', 'R8C8'], 'R8C9'),
];

return [
  new Shape('9x9'),

  new Given('R1C2', 9),
  new Given('R2C4', 8),
  new Given('R2C7', 9),
  new Given('R2C9', 3),
  new Given('R3C2', 6),
  new Given('R3C3', 8),
  new Given('R4C5', 4),
  new Given('R4C8', 9),
  new Given('R5C4', 3),
  new Given('R5C5', 1),
  new Given('R5C6', 9),
  new Given('R6C2', 7),
  new Given('R6C5', 2),
  new Given('R7C7', 3),
  new Given('R7C8', 7),
  new Given('R8C1', 7),
  new Given('R8C3', 9),
  new Given('R8C6', 6),
  new Given('R9C8', 5),

  // R6C2 (=7) has no drawn line to the left, so R6C1 must exceed 7.
  new Given('R6C1', 8, 9),

  ...emitterLines,
];
