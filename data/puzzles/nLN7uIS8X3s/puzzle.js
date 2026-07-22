// Title: Friday The 13th (1980-2025)
// Author: Jodawo
// Video: https://www.youtube.com/watch?v=nLN7uIS8X3s
// Source: https://sudokupad.app/9c6on7okjr

// Each variant sandwich has total 13. On line N its two crusts are N and 10-N.
// Standard Sudoku uniqueness guarantees each crust occurs exactly once on its line.
const variantSandwich = (lineNumber) => {
  const crustA = lineNumber;
  const crustB = 10 - lineNumber;
  return NFA.encodeSpec({
    startState: { phase: 0, sum: 0 },
    transition: ({ phase, sum }, value) => {
      const isCrust = value === crustA || value === crustB;
      if (phase === 0) return isCrust ? { phase: 1, sum: 0 } : { phase, sum };
      if (phase === 1) {
        if (isCrust) return sum === 13 ? { phase: 2, sum } : undefined;
        return sum + value <= 13 ? { phase, sum: sum + value } : undefined;
      }
      return { phase, sum };
    },
    accept: ({ phase }) => phase === 2,
    maxDepth: 9,
  }, 9);
};

const row = (r) => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const col = (c) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));

const cages = [
  new Cage(13, 'R3C1', 'R4C1', 'R5C1'),
  new Cage(13, 'R8C3', 'R8C4', 'R8C5'),
  new Cage(13, 'R6C4', 'R6C5', 'R6C6'),
  new Cage(13, 'R4C3', 'R4C4', 'R4C5'),
  new Cage(13, 'R2C5', 'R2C6'),
  new Cage(13, 'R6C3', 'R7C3'),
  new Cage(13, 'R4C7', 'R5C7', 'R6C7', 'R7C7'),
  new Cage(13, 'R9C2', 'R9C3', 'R9C4'),
  new Cage(13, 'R1C5', 'R1C6', 'R1C7'),
  new Cage(13, 'R1C9', 'R2C9', 'R3C9'),
  new Cage(13, 'R5C3', 'R5C4', 'R5C5'),
  new Cage(13, 'R9C6', 'R9C7', 'R9C8'),
  new Cage(13, 'R2C1', 'R2C2'),
];

const sandwiches = [
  new NFA(variantSandwich(2), 'variant sandwich 13', row(2)),
  new NFA(variantSandwich(4), 'variant sandwich 13', row(4)),
  new NFA(variantSandwich(8), 'variant sandwich 13', row(8)),
  new NFA(variantSandwich(1), 'variant sandwich 13', col(1)),
  new NFA(variantSandwich(3), 'variant sandwich 13', col(3)),
  new NFA(variantSandwich(7), 'variant sandwich 13', col(7)),
];

// Every filling is its own drawn 13-cage. Since all digits are positive and
// both totals are 13, the filling must be exactly that cage; its flanking cells
// therefore contain the two crust digits (in either order).
const fillingBounds = [
  new Given('R2C4', 2, 8), new Given('R2C7', 2, 8),
  new Given('R4C2', 4, 6), new Given('R4C6', 4, 6),
  new Given('R8C2', 2, 8), new Given('R8C6', 2, 8),
  new Given('R2C1', 1, 9), new Given('R6C1', 1, 9),
  new Given('R5C3', 3, 7), new Given('R8C3', 3, 7),
  new Given('R3C7', 3, 7), new Given('R8C7', 3, 7),
];

return [
  new Shape('9x9'),
  ...cages,
  ...sandwiches,
  ...fillingBounds,
];
