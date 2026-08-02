// Title: Minmax Mosaic
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=Dq3t_nZCOAI
// Source: https://app.crackingthecryptic.com/sudoku/DQJ3QHr6gN

// Normal Sudoku plus both marked main diagonals. Each listed cage has distinct
// digits and its smallest plus largest digit equal to its drawn top-left clue.
const minmax = (target, ...cells) => {
  // The state is the set of digits seen so far. Re-reading a bit rejects a
  // repeat; the final set supplies the cage minimum and maximum.
  const spec = NFA.encodeSpec({
    startState: 0,
    transition: (mask, value) => {
      const bit = 1 << (value - 1);
      return (mask & bit) ? undefined : mask | bit;
    },
    accept: mask => {
      const minimum = 32 - Math.clz32(mask & -mask);
      const maximum = 32 - Math.clz32(mask);
      return minimum + maximum === target;
    },
  }, 9);
  return new NFA(spec, `minmax-${target}`, cells);
};

// Cage coordinates and labels are transcribed from the drawn cage outlines.
const cages = [
  minmax(15, 'R1C1', 'R1C2', 'R2C1'),
  minmax(12, 'R2C2', 'R2C3', 'R3C2'),
  minmax(5, 'R8C1', 'R9C1', 'R9C2'),
  minmax(8, 'R7C2', 'R8C2', 'R8C3'),
  minmax(14, 'R8C9', 'R9C8', 'R9C9'),
  minmax(13, 'R7C8', 'R8C7', 'R8C8'),
  minmax(9, 'R1C8', 'R1C9', 'R2C9'),
  minmax(8, 'R2C7', 'R2C8', 'R3C8'),
  minmax(11, 'R3C1', 'R4C1', 'R4C2', 'R5C1'),
  minmax(8, 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R7C1'),
  minmax(9, 'R8C4', 'R8C5', 'R9C3', 'R9C4'),
  minmax(12, 'R8C6', 'R9C5', 'R9C6', 'R9C7'),
  minmax(7, 'R5C9', 'R6C8', 'R6C9', 'R7C9'),
  minmax(10, 'R3C9', 'R4C8', 'R4C9', 'R5C8'),
  minmax(12, 'R1C6', 'R1C7', 'R2C5', 'R2C6'),
  minmax(9, 'R1C3', 'R1C4', 'R1C5', 'R2C4'),
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...cages,
];
