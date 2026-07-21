// Title: TDF Odd Mountain Stage
// Author: palpot
// Video: https://www.youtube.com/watch?v=qBbAtCyR6AA
// Source: https://sudokupad.app/7qo4oi3fi3

// Each rider cell equals the number of odd digits along that rider's path.
// The target is scanned first and is deliberately repeated when the rider
// shares a cell with the path.
const scoreMachine = NFA.encodeSpec({
  startState: { target: null, oddCount: 0 },
  transition: ({ target, oddCount }, value) => {
    if (target === null) return { target: value, oddCount };
    const nextCount = oddCount + (value % 2);
    return nextCount <= target ? { target, oddCount: nextCount } : undefined;
  },
  accept: ({ target, oddCount }) => target !== null && oddCount === target,
  // One score cell followed by the nine cells of its path.
  maxDepth: 10,
}, 9);

const yellowPath = [
  'R1C9', 'R2C8', 'R3C7', 'R2C6', 'R1C5',
  'R2C4', 'R3C3', 'R2C2', 'R3C1',
];
const greenPath = [
  'R3C9', 'R4C8', 'R5C7', 'R4C6', 'R3C5',
  'R4C4', 'R5C3', 'R4C2', 'R5C1',
];
const redPath = [
  'R5C9', 'R6C8', 'R7C7', 'R6C6', 'R5C5',
  'R6C4', 'R7C3', 'R6C2', 'R7C1',
];
const tealPath = [
  'R7C9', 'R8C8', 'R9C7', 'R8C6', 'R7C5',
  'R8C4', 'R9C3', 'R8C2', 'R9C1',
];

const riders = [
  ['R3C7', yellowPath],
  ['R4C6', greenPath],
  ['R4C5', redPath],
  ['R8C2', tealPath],
];
const scores = riders.map(([rider, path]) => new NFA(
  scoreMachine,
  'odd digits on rider path',
  rider,
  ...path,
));

const alternateParity = Pair.fnToKey((a, b) => (a + b) % 2 === 1, 9);
const descending = Pair.fnToKey((a, b) => a > b, 9);

return [
  new Shape('9x9'),
  new Given('R9C4', 8),
  new Given('R9C6', 2),
  ...scores,
  new Pair(descending, 'stage ranking', 'R3C7', 'R4C6', 'R4C5', 'R8C2'),
  new Whisper(4, ...yellowPath),
  new Whisper(5, ...greenPath),
  new Pair(alternateParity, 'alternating parity', ...redPath),
  new Modular(3, ...tealPath),
];
