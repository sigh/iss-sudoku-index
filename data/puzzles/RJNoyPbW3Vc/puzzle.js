// Title: TDF Stage 1
// Author: palpot
// Video: https://www.youtube.com/watch?v=RJNoyPbW3Vc
// Source: https://app.crackingthecryptic.com/d70u447pn4

// Normal Sudoku applies. The four rider paths use their stated local rules; their
// scores strictly decrease Yellow, Green, Red, Grey. Scores are stored one higher
// than the stated point total because ISS Vars range from 1 to 9. No negative
// Kropki/XV rule applies: the rules say not all marks are given.
const yellow = ['R2C1', 'R1C2', 'R2C3', 'R2C4', 'R2C5', 'R1C6', 'R2C7', 'R3C8', 'R3C9'];
const green = ['R4C1', 'R3C2', 'R4C3', 'R4C4', 'R4C5', 'R3C6', 'R4C7', 'R5C8', 'R5C9'];
const red = ['R6C1', 'R5C2', 'R6C3', 'R6C4', 'R6C5', 'R5C6', 'R6C7', 'R7C8', 'R7C9'];
const grey = ['R8C1', 'R7C2', 'R8C3', 'R8C4', 'R8C5', 'R7C6', 'R8C7', 'R9C8', 'R9C9'];

// Each machine reads its score Var first, then its drawn path. Its state keeps
// the previous path digit and the running number of scoring events.
const yellowSpec = NFA.encodeSpec({
  startState: { target: null, count: 0, prev: null },
  transition: ({ target, count, prev }, value) => {
    if (target === null) return { target: value - 1, count: 0, prev: null };
    if (prev !== null && Math.abs(prev - value) < 4) return undefined;
    return { target, count: count + (value === 5 ? 1 : 0), prev: value };
  },
  accept: ({ target, count, prev }) => target !== null && prev !== null && count === target,
  maxDepth: 10,
}, 9);
const greenSpec = NFA.encodeSpec({
  startState: { target: null, count: 0, prev: null },
  transition: ({ target, count, prev }, value) => {
    if (target === null) return { target: value - 1, count: 0, prev: null };
    if (prev !== null && Math.abs(prev - value) < 5) return undefined;
    return { target, count: count + (value === 4 || value === 6 ? 1 : 0), prev: value };
  },
  accept: ({ target, count, prev }) => target !== null && prev !== null && count === target,
  maxDepth: 10,
}, 9);
const redSpec = NFA.encodeSpec({
  startState: { target: null, count: 0, prev: null },
  transition: ({ target, count, prev }, value) => {
    if (target === null) return { target: value - 1, count: 0, prev: null };
    if (prev !== null && (prev - value) % 2 === 0) return undefined;
    return { target, count: count + (prev !== null && Math.abs(prev - value) === 1 ? 1 : 0), prev: value };
  },
  accept: ({ target, count, prev }) => target !== null && prev !== null && count === target,
  maxDepth: 10,
}, 9);
// A separate, fixed-target machine for each grey score keeps the state compact:
// the native SumLine handles the independent partition-into-10 rule.
const greyScoreSpec = target => NFA.encodeSpec({
  startState: { count: 0, a: null, b: null },
  transition: ({ count, a, b }, value) => {
    const nextCount = count + (a !== null && b !== null && a + b + value === 10 ? 1 : 0);
    if (nextCount > target) return undefined;
    return { count: nextCount, a: b, b: value };
  },
  accept: ({ count }) => count === target,
  maxDepth: 9,
}, 9);
const greyScores = Array.from({ length: 8 }, (_, score) => new And([
  new Given('VT', score + 1),
  new NFA(greyScoreSpec(score), `grey ${score}-point score`, grey),
]));

const greaterKey = Pair.fnToKey((a, b) => a > b, 9);

return [
  new Shape('9x9'),
  new Var('Y', 'Yellow score'), new Var('G', 'Green score'),
  new Var('R', 'Red score'), new Var('T', 'Grey score'),
  new Given('VY', 1, 2, 3, 4, 5, 6),
  new Given('VG', 1, 2, 3, 4, 5, 6),
  new Given('VR', 1, 2, 3, 4, 5, 6, 7, 8, 9),
  new Given('VT', 1, 2, 3, 4, 5, 6, 7, 8),
  new NFA(yellowSpec, 'yellow Dutch Whisper and 5 score', ['VY', ...yellow]),
  new NFA(greenSpec, 'green German Whisper and 4/6 score', ['VG', ...green]),
  new NFA(redSpec, 'red parity and consecutive-pair score', ['VR', ...red]),
  new SumLine(10, ...grey),
  new Or(greyScores),
  new Pair(greaterKey, 'stage ranking', 'VY', 'VG'),
  new Pair(greaterKey, 'stage ranking', 'VG', 'VR'),
  new Pair(greaterKey, 'stage ranking', 'VR', 'VT'),
  // White dots from the drawn Kropki clues.
  new WhiteDot('R6C2', 'R6C1'), new WhiteDot('R1C2', 'R2C2'),
  new WhiteDot('R6C8', 'R7C8'), new WhiteDot('R3C6', 'R3C5'),
  // X from the drawn XV clue.
  new X('R5C4', 'R4C4'),
];
