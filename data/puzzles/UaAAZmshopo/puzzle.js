// Title: Fog of war 35
// Author: Colleen Bridges
// Video: https://www.youtube.com/watch?v=UaAAZmshopo
// Source: https://sudokupad.app/wm7f10e5fh

// Normal Sudoku; every listed cage is either its distinct-digit killer sum or
// its stated look-and-say digit count. Green lines are whispers, grey lines
// are arithmetic sequences, dots have their usual Kropki meanings, and each
// 3x3 box has opposite-corner sums of 10 or 11.

// Its state keeps the previous digit and, after the first pair, their common step.
const sequenceNFA = NFA.encodeSpec({
  startState: { previous: null, step: null },
  transition: ({ previous, step }, value) => {
    if (previous === null) return { previous: value, step: null };
    if (step === null) return { previous: value, step: value - previous };
    if (value - previous !== step) return undefined;
    return { previous: value, step };
  },
  accept: ({ previous }) => previous !== null,
}, 9);

const cageType = (clue, cells) => new Or([
  new Cage(clue, ...cells),
  new LookAndSay(clue, ...cells),
]);

const diagonalPairKey = Pair.fnToKey(
  (left, right) => left + right === 10 || left + right === 11,
  9,
);
const graph = cellGraph('9x9');
const boxDiagonalPairs = graph.boxes().flatMap(box => [
  [box[0], box[8]],
  [box[2], box[6]],
]);

return [
  cageType(24, ['R1C4', 'R1C5', 'R1C6']),
  cageType(12, ['R7C6', 'R8C6', 'R9C6']),
  cageType(14, ['R8C2', 'R9C2', 'R9C3']),
  cageType(28, ['R3C7', 'R4C6', 'R4C7']),
  cageType(23, ['R6C2', 'R7C2', 'R7C3']),

  new BlackDot('R6C7', 'R6C8'),
  new WhiteDot('R1C5', 'R1C6'),
  new WhiteDot('R4C7', 'R4C8'),
  new WhiteDot('R6C9', 'R7C9'),
  new WhiteDot('R2C6', 'R3C6'),

  new Whisper(5, 'R9C5', 'R8C5', 'R7C6', 'R6C6'),
  new Whisper(5, 'R4C6', 'R4C7', 'R5C8', 'R5C9', 'R4C9', 'R3C8', 'R2C8'),
  new Whisper(5, 'R5C4', 'R4C3', 'R4C2', 'R3C1'),
  new NFA(sequenceNFA, 'sequence', ['R3C6', 'R3C5', 'R2C5', 'R1C5']),
  new NFA(sequenceNFA, 'sequence', ['R4C8', 'R5C7', 'R6C8']),

  ...boxDiagonalPairs.map(([left, right]) =>
    new Pair(diagonalPairKey, 'box diagonal sum', left, right)),
];
