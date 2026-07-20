// Title: Flower Petals
// Author: gregui
// Video: https://www.youtube.com/watch?v=X2e6JsSPvWQ
// Source: https://sudokupad.app/ml7mbpvpxj

// Each flower centre equals the count of odd orthogonal neighbours.
const graph = cellGraph('9x9');

const flowerMachine = NFA.encodeSpec({
  startState: { target: null, oddCount: 0 },
  transition: ({ target, oddCount }, value) => {
    if (target === null) return { target: value, oddCount };
    const nextCount = oddCount + (value % 2);
    return nextCount <= target ? { target, oddCount: nextCount } : undefined;
  },
  accept: ({ target, oddCount }) => target !== null && oddCount === target,
  // One centre followed by at most four petals.
  maxDepth: 5,
}, 9);

const flowerCentres = [
  'R1C9', 'R2C2', 'R4C6', 'R5C1', 'R6C9', 'R7C7',
];
const flowers = flowerCentres.map(centre => new NFA(
  flowerMachine,
  'Odd petals',
  centre,
  ...graph.neighbours(centre),
));

const whispers = [
  new Whisper(5, 'R5C1', 'R6C2', 'R7C2', 'R8C2', 'R9C2'),
  new Whisper(5, 'R2C2', 'R3C3', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4'),
  new Whisper(5, 'R4C4', 'R3C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R1C9'),
  new Whisper(5, 'R6C4', 'R5C5', 'R4C6'),
  new Whisper(5, 'R7C7', 'R8C6', 'R9C6'),
  new Whisper(5, 'R9C9', 'R8C9', 'R7C9', 'R6C9'),
];

const blackDots = [
  new BlackDot('R3C8', 'R3C9'),
  new BlackDot('R9C3', 'R9C4'),
  new BlackDot('R4C3', 'R4C4'),
];

return [
  new Shape('9x9'),
  new Given('R2C2', 4),
  new Given('R4C6', 4),
  new Given('R5C1', 2),
  new Given('R9C8', 5),
  ...flowers,
  ...whispers,
  ...blackDots,
];
