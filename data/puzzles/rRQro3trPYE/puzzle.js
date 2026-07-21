// Title: Lost in the Modhouse
// Author: Kennet's Dad
// Video: https://www.youtube.com/watch?v=rRQro3trPYE
// Source: https://sudokupad.app/buum97646q

// Each clue type is globally non-repeating: all cells belonging to that type
// are constrained together, in addition to the individual clue semantics.

const cages = [
  ['R7C3', 'R7C4', 'R8C4'],
  ['R9C7', 'R9C8', 'R9C9'],
  ['R3C7', 'R4C7', 'R4C8'],
];

const xPairs = [
  ['R2C1', 'R3C1'],
  ['R1C2', 'R1C3'],
  ['R7C2', 'R8C2'],
];

const parityLines = [
  ['R6C5', 'R6C6', 'R5C6'],
  ['R1C8', 'R1C9', 'R2C9'],
];

const renbanLines = [
  ['R1C6', 'R2C6', 'R3C6', 'R4C6'],
  ['R6C1', 'R6C2', 'R6C3', 'R6C4'],
];

const nabnerLine = ['R5C1', 'R5C2', 'R5C3'];

const entropicLines = [
  ['R3C7', 'R4C7', 'R4C8'],
  ['R7C7', 'R8C8', 'R8C9'],
];

const modularLines = [
  ['R6C7', 'R6C8', 'R6C9'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R2C3', 'R3C3', 'R3C2'],
];

const zipperLine = ['R1C7', 'R2C7', 'R2C8', 'R3C8', 'R3C9'];

const alternatingParityKey = Pair.fnToKey((a, b) => (a + b) % 2 === 1, 9);
const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);

return [
  new Shape('9x9'),

  // The middle cage has no displayed total, but its cells still participate in
  // the global non-repetition rule for cages.
  new Cage(15, ...cages[0]),
  new Cage(18, ...cages[2]),
  new AllDifferent(...cages.flat()),

  ...xPairs.map(cells => new X(...cells)),
  new AllDifferent(...xPairs.flat()),

  ...parityLines.map(cells =>
    new Pair(alternatingParityKey, 'Parity', ...cells)),
  new AllDifferent(...parityLines.flat()),

  ...renbanLines.map(cells => new Renban(...cells)),
  new AllDifferent(...renbanLines.flat()),

  new PairX(nabnerKey, 'Nabner', ...nabnerLine),
  new AllDifferent(...nabnerLine),

  ...entropicLines.map(cells => new Entropic(...cells)),
  new AllDifferent(...entropicLines.flat()),

  ...modularLines.map(cells => new Modular(3, ...cells)),
  new AllDifferent(...modularLines.flat()),

  new Zipper(...zipperLine),
  new AllDifferent(...zipperLine),
];
