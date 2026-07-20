// Title: Zombie Drome
// Author: R. Mullinix
// Video: https://www.youtube.com/watch?v=7znvmkbh6gI
// Source: https://sudokupad.app/1pdzuv445k

// VZ is 1 for a normal cell and 2 for a zombie. VV stores the value used
// by every drawn clue: digit + VZ - 1. Shape is widened to include value
// 10, while the main grid is restricted back to Sudoku digits 1-9.

const graph = cellGraph('9x9');
const zombies = graph.makeOverlay('VZ');
const values = graph.makeOverlay('VV');
const gridCells = graph.cells();
const zombieAt = (cell) => zombies.at(cell);
const valueAt = (cell) => values.at(cell);

const gridDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9),
);
const zombieDomain = zombies.makeReplicate(
  new Given(zombies.cells()[0], 1, 2),
);

// value = digit + zombieFlag - 1.
const valueLinks = gridCells.map(cell =>
  new Sum(-1, valueAt(cell), [cell, -1], [zombieAt(cell), -1]));

// Flags in {1,2} sum to 10 exactly when a nine-cell house has one zombie.
const oneZombiePerHouse = [
  ...graph.rows(),
  ...graph.columns(),
  ...graph.boxes(),
].map(house => new Sum(10, ...zombies.at(house)));

// At most one zombie may contain each raw digit. There are nine zombies,
// so these nine restrictions make their digits a permutation of 1-9.
const interleaved = gridCells.flatMap(cell => [cell, zombieAt(cell)]);
const distinctZombieDigits = Array.from({length: 9}, (_, i) => i + 1).map(digit => {
  const machine = NFA.encodeSpec({
    startState: {phase: 0, matches: false, seen: false},
    transition: (state, input) => {
      if (state.phase === 0) {
        return {phase: 1, matches: input === digit, seen: state.seen};
      }
      if (state.matches && input === 2) {
        if (state.seen) return undefined;
        return {phase: 0, matches: false, seen: true};
      }
      return {phase: 0, matches: false, seen: state.seen};
    },
    accept: state => state.phase === 0,
  }, 10);
  return new NFA(machine, `zombie-digit-${digit}-unique`, ...interleaved);
});

const palindrome = [
  'R8C5', 'R7C4', 'R6C4', 'R5C3', 'R4C2',
  'R3C2', 'R3C3', 'R3C4', 'R2C5', 'R1C6',
];

const cages = [
  [17, ['R1C5', 'R2C5']],
  [24, ['R7C6', 'R8C6', 'R9C6']],
  [25, ['R7C1', 'R8C1', 'R9C1']],
  [7, ['R2C7', 'R2C8', 'R2C9']],
];

const xClues = [
  ['R3C4', 'R3C5'],
  ['R4C8', 'R4C9'],
];

const whiteDots = [
  ['R7C6', 'R7C7'],
  ['R8C1', 'R8C2'],
  ['R4C9', 'R5C9'],
];

const blackDots = [
  ['R3C2', 'R3C3'],
  ['R3C3', 'R3C4'],
  ['R8C7', 'R8C8'],
  ['R2C8', 'R3C8'],
];

return [
  new Shape('9x9', 10),
  zombies.toVar('zombie flags'),
  values.toVar('effective values'),

  gridDomain,
  zombieDomain,
  ...valueLinks,
  ...oneZombiePerHouse,
  ...distinctZombieDigits,

  new Palindrome(...values.at(palindrome)),
  ...cages.map(([total, cells]) => new Sum(total, ...values.at(cells))),
  ...xClues.map(([a, b]) => new X(valueAt(a), valueAt(b))),
  ...whiteDots.map(([a, b]) => new WhiteDot(valueAt(a), valueAt(b))),
  ...blackDots.map(([a, b]) => new BlackDot(valueAt(a), valueAt(b))),
];
