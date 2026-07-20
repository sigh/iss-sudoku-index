// Title: Escape the Foggy Liar
// Author: PhoenixAki
// Video: https://www.youtube.com/watch?v=Efx8_I_DhQ4
// Source: https://sudokupad.app/eiqitcx105

// Fog and the small green edge arrows are UI-only decoration.
// Liar flags are 1 for a truthful cage and 2 for a lying cage.

const liarCages = [
  { total: 3, cells: ['R1C1'] },
  { total: 28, cells: ['R1C2', 'R1C3', 'R1C4', 'R1C5'] },
  { total: 11, cells: ['R1C6', 'R1C7', 'R1C8'] },
  { total: 3, cells: ['R1C9'] },
  { total: 1, cells: ['R8C2'] },
  { total: 3, cells: ['R9C1'] },
  { total: 7, cells: ['R3C3', 'R4C3', 'R5C3'] },
  { total: 3, cells: ['R9C9'] },
  { total: 11, cells: ['R7C9', 'R8C9'] },
  { total: 13, cells: ['R5C9', 'R6C9'] },
];

const liarFlagVars = new Var('LC', 'liar cage flags', liarCages.length);
const liarFlags = liarFlagVars.cells();

function liarCageConstraint({ total, cells }, index) {
  if (cells.length === 1) {
    const key = Pair.fnToKey((flag, digit) =>
      (flag === 1 && digit === total) || (flag === 2 && digit !== total), 9);
    return new Pair(key, `liar cage ${index + 1}`, liarFlags[index], cells[0]);
  }

  const machine = NFA.encodeSpec({
    startState: { flag: 0, sum: 0 },
    transition: ({ flag, sum }, value) => {
      if (flag === 0) return { flag: value, sum: 0 };
      return { flag, sum: sum + value };
    },
    accept: ({ flag, sum }) =>
      (flag === 1 && sum === total) || (flag === 2 && sum !== total),
    // One flag followed by every cell in this cage.
    maxDepth: cells.length + 1,
  }, 9);

  return new NFA(machine, `liar cage ${index + 1}`, liarFlags[index], ...cells);
}

const liarCageRules = liarCages.flatMap((cage, index) => [
  ...(cage.cells.length > 1 ? [new AllDifferent(...cage.cells)] : []),
  liarCageConstraint(cage, index),
]);

const topLineFlags = liarFlags.slice(0, 4);
const lowerLeftLineFlags = liarFlags.slice(4, 7);
const rightLineFlags = liarFlags.slice(7, 10);

return [
  new Shape('9x9'),

  liarFlagVars,
  ...liarFlags.map(flag => new Given(flag, 1, 2)),
  ...liarCageRules,
  // sum(flags) - R5C5 = number of cages on the line, so the excess
  // contributed by value-2 flags is exactly the central digit.
  new Sum(topLineFlags.length, ...topLineFlags, ['R5C5', -1]),
  new Sum(lowerLeftLineFlags.length, ...lowerLeftLineFlags, ['R5C5', -1]),
  new Sum(rightLineFlags.length, ...rightLineFlags, ['R5C5', -1]),

  // Untouched cages always tell the truth.
  new Cage(6, 'R2C9', 'R3C9', 'R4C9'),
  new Cage(9, 'R5C1', 'R6C1', 'R7C1'),
  new Cage(3, 'R9C8'),

  new Whisper(5, 'R6C5', 'R5C5', 'R4C4', 'R3C4', 'R2C4'),
  new Whisper(5, 'R5C5', 'R4C6'),

  new Arrow('R3C6', 'R3C5', 'R4C5', 'R5C6', 'R6C6'),
  new Arrow('R5C7', 'R6C8', 'R7C8', 'R8C8'),
  new Arrow('R7C6', 'R8C6', 'R8C7'),
  new Arrow('R9C5', 'R9C6', 'R9C7'),

  new BlackDot('R3C4', 'R3C5'),
  new BlackDot('R5C3', 'R5C4'),
  new V('R6C1', 'R7C1'),
  new X('R8C4', 'R9C4'),

  new Thermo('R7C4', 'R8C4', 'R9C4'),
  new Thermo('R3C7', 'R3C8'),
];
