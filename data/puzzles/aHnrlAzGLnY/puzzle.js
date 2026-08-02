// Title: Klappstuhl
// Author: ICHTUES
// Video: https://www.youtube.com/watch?v=aHnrlAzGLnY
// Source: https://app.crackingthecryptic.com/sudoku/BJ4djnjq82

// Normal Sudoku rules apply. Each outside circle is a Sandwich clue, and its
// one-cell arrow arm makes that clue total equal to the arrow-tip digit.
// `sandwich-arrow` reads the tip first, then its row or column: its NFA state
// records the tip digit and the sum strictly between the 1 and 9 markers.
const sandwichArrow = NFA.encodeSpec({
  startState: { target: null, phase: 'before', sum: 0 },
  transition({ target, phase, sum }, value) {
    // The first segment is the arrow tip, not part of the Sandwich line.
    if (target === null) return { target: value, phase: 'before', sum: 0 };
    if (value === SEGMENT_BREAK) return { target, phase, sum };
    if (phase === 'before') {
      return value === 1 || value === 9
        ? { target, phase: 'inside', sum: 0 }
        : { target, phase, sum };
    }
    if (phase === 'inside') {
      if (value === 1 || value === 9) return { target, phase: 'after', sum };
      const nextSum = sum + value;
      return nextSum <= target
        ? { target, phase, sum: nextSum }
        : undefined;
    }
    return { target, phase, sum };
  },
  accept: ({ target, phase, sum }) => target !== null && phase === 'after' && sum === target,
  // One tip cell, a segment break, then the nine-cell Sandwich line.
  maxDepth: 11,
}, 9, { multiSegment: true });

// Drawn circle locations supply the Sandwich rows/columns; each paired short
// arrow's only in-grid tip is the first segment below.
const sandwichArrows = [
  ['R1C8', ['R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8']],
  ['R1C8', ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9']],
  ['R1C8', ['R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R8C7', 'R9C7']],
  ['R5C1', ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9']],
  ['R5C1', ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9']],
  ['R5C1', ['R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9']],
  ['R6C1', ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9']],
  ['R4C1', ['R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9']],
  ['R3C1', ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9']],
  ['R1C6', ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5']],
];

return [
  new Shape('9x9'),
  new Given('R8C2', 4),
  ...sandwichArrows.map(([tip, line]) => new NFA(sandwichArrow, 'sandwich-arrow', [tip], line)),
];
