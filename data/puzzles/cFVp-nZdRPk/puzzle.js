// Title: Arrow Dynamics
// Author: Newjoyku
// Video: https://www.youtube.com/watch?v=cFVp-nZdRPk
// Source: https://sudokupad.app/or42ce5os1

// Normal 9x9 Sudoku. Arrow circles equal the sums of their shafts. Each turquoise
// Index Line is read from its diamond: its Nth digit is the position of digit N.
// The NFA reads a designated Nth cell, then the whole line, and checks that the
// indicated position contains N. Applying it for every N also makes the line a
// permutation of 1 through 9.
const indexLine = (cells) => cells.flatMap((cell, index) => {
  const digit = index + 1;
  const spec = NFA.encodeSpec({
    startState: { phase: 'target', target: null, position: 0 },
    transition: ({ phase, target, position }, value) => {
      if (phase === 'target') return { phase: 'line', target: value, position: 0 };
      if (value === SEGMENT_BREAK) return { phase, target, position: 0 };
      const nextPosition = position + 1;
      if (nextPosition === target && value !== digit) return undefined;
      return { phase, target, position: nextPosition };
    },
    accept: ({ phase, position }) => phase === 'line' && position === cells.length,
    maxDepth: cells.length + 2,
  }, 9, { multiSegment: true });
  return [new NFA(spec, `index-${digit}`, [cell], cells)];
});

const indexLines = [
  // Turquoise path beginning at the diamond in R1C5.
  ['R1C5', 'R1C4', 'R1C3', 'R1C2', 'R2C2', 'R2C1', 'R3C1', 'R4C1', 'R4C2'],
  // Turquoise path beginning at the diamond in R5C9.
  ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R8C8', 'R9C8', 'R9C7', 'R9C6', 'R8C6'],
];

return [
  new Shape('9x9'),
  // Arrow shafts transcribed from the seven circled arrows.
  new Arrow('R1C9', 'R1C8', 'R1C7', 'R1C6'),
  new Arrow('R1C9', 'R2C9', 'R3C9', 'R4C9'),
  new Arrow('R9C1', 'R8C1', 'R7C1', 'R6C1'),
  new Arrow('R9C1', 'R9C2', 'R9C3', 'R9C4'),
  new Arrow('R3C3', 'R4C4', 'R5C5', 'R6C6'),
  new Arrow('R7C7', 'R7C6', 'R8C5'),
  new Arrow('R5C8', 'R4C8', 'R3C7'),
  ...indexLines.flatMap(indexLine),
];
