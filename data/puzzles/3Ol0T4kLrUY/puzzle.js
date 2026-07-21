// Title: Skyscraper I Love You
// Author: Bobo
// Video: https://www.youtube.com/watch?v=3Ol0T4kLrUY
// Source: https://sudokupad.app/eeczcw2suq

// Each clue's first cell holds the required visibility count. The remaining
// cells are the ray, ordered away from the arrow. The state machine tracks the
// greatest height seen and increments the count only for a new maximum.
const clues = [
  ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R9C6', 'R8C5', 'R7C4', 'R6C3', 'R5C2', 'R4C1'],
  ['R6C4', 'R5C4', 'R4C4', 'R3C4', 'R2C4', 'R1C4'],
  ['R4C7', 'R4C6', 'R4C5', 'R4C4', 'R4C3', 'R4C2', 'R4C1'],
  ['R5C8', 'R5C7', 'R5C6', 'R5C5', 'R5C4', 'R5C3', 'R5C2', 'R5C1'],
  ['R6C9', 'R6C8', 'R6C7', 'R6C6', 'R6C5', 'R6C4', 'R6C3', 'R6C2', 'R6C1'],
  ['R3C8', 'R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R3C2', 'R3C1'],
  ['R2C9', 'R2C8', 'R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3', 'R2C2', 'R2C1'],
  ['R8C7', 'R7C6', 'R6C5', 'R5C4', 'R4C3', 'R3C2', 'R2C1'],
  ['R7C8', 'R6C7', 'R5C6', 'R4C5', 'R3C4', 'R2C3', 'R1C2'],
  ['R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7'],
  ['R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7'],
  ['R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1'],
  ['R8C3', 'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R2C3', 'R1C3'],
  ['R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9'],
];

const visibilityMachine = NFA.encodeSpec({
  startState: {target: null, maxSeen: 0, count: 0},
  transition: ({target, maxSeen, count}, value) => {
    if (target === null) return {target: value, maxSeen: 0, count: 0};
    const isVisible = value > maxSeen;
    const nextCount = count + (isVisible ? 1 : 0);
    if (nextCount > target) return undefined;
    return {
      target,
      maxSeen: Math.max(maxSeen, value),
      count: nextCount,
    };
  },
  accept: ({target, count}) => target !== null && count === target,
  maxDepth: 9,
}, 9);

const skyscrapers = clues.map(cells =>
  new NFA(visibilityMachine, 'in-grid skyscraper', ...cells));

return [
  new Shape('9x9'),
  ...skyscrapers,
];
