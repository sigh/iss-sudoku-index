// Title: The Graveyard Of Emptiness
// Author: fjam
// Video: https://www.youtube.com/watch?v=-YXYJgRSq4E
// Source: https://sudokupad.app/9gk44l9w5x

// A nullifier flag of 1 makes the cell's effective value zero; 2 leaves its
// Sudoku digit unchanged. Path flags use 1 for on the path and 2 for off it.

const NULL = 1;
const NORMAL = 2;
const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const nullifiers = graph.makeOverlay('VN');
const path = graph.makeOverlay('VP');

const graves = [
  [[2, 1, 24], ['R3C1', 'R3C2', 'R4C1']],
  [[24, 5, 17], ['R4C2', 'R4C3', 'R5C3']],
  [[22, 10, 33], ['R5C1', 'R5C2', 'R6C1', 'R6C2', 'R6C3']],
  [[12, 9, 13], ['R1C2', 'R2C1', 'R2C2', 'R2C3']],
  [[24, 12, 10], ['R1C3', 'R1C4', 'R2C4']],
  [[18, 12, 25], ['R3C3', 'R3C4', 'R4C4', 'R4C5']],
  [[20, 7, 24], ['R1C5', 'R2C5', 'R3C5', 'R3C6']],
  [[12, 11, 17], ['R1C6', 'R1C7', 'R2C6', 'R2C7']],
  [[23, 8, 13], ['R3C7', 'R3C8', 'R3C9']],
  [[14, 11, 15], ['R1C8', 'R1C9', 'R2C8', 'R2C9']],
  [[26, 11, 24], ['R4C6', 'R5C6', 'R6C5', 'R6C6', 'R6C7']],
  [[16, 10, 18], ['R5C4', 'R5C5', 'R6C4', 'R7C4']],
  [[14, 9, 13], ['R4C7', 'R4C8', 'R5C7']],
  [[21, 9, 11], ['R4C9', 'R5C9', 'R6C9', 'R7C9']],
  [[15, 11, 18], ['R5C8', 'R6C8', 'R7C7', 'R7C8']],
  [[21, 11, 26], ['R8C8', 'R8C9', 'R9C7', 'R9C8']],
  [[13, 8, 24], ['R7C6', 'R8C6', 'R8C7', 'R9C6']],
  [[18, 10, 15], ['R7C5', 'R8C5', 'R9C5']],
  [[13, 11, 18], ['R8C3', 'R8C4', 'R9C3', 'R9C4']],
  [[16, 4, 15], ['R7C1', 'R7C2', 'R7C3']],
  [[27, 12, 26], ['R8C1', 'R8C2', 'R9C1', 'R9C2']],
];

// Reads (nullifier flag, digit) pairs and accepts one of the date's three sums.
function graveSumMachine(totals) {
  return NFA.encodeSpec({
    startState: { phase: 'flag', sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'flag') {
        return value === NULL || value === NORMAL
          ? { phase: 'digit', sum: state.sum, nullified: value === NULL }
          : undefined;
      }
      const sum = state.sum + (state.nullified ? 0 : value);
      return sum <= Math.max(...totals)
        ? { phase: 'flag', sum }
        : undefined;
    },
    accept: state => state.phase === 'flag' && totals.includes(state.sum),
  }, geometry.numValues);
}

const graveRules = graves.flatMap(([totals, cells], index) => [
  new AllDifferent(...cells),
  new NFA(graveSumMachine(totals), `grave-${index + 1}`,
    ...cells.flatMap(cell => [nullifiers.at(cell), cell])),
]);

// Exactly one nullifier appears in every row, column, and box.
const nullifierGroups = [
  ...graph.rows(),
  ...graph.columns(),
  ...graph.boxes(),
];
const nullifierRules = nullifierGroups.map(cells =>
  new ContainExact(String(NULL), ...nullifiers.at(cells)));

// Each on-path cell has degree two, except the green and red endpoints, which
// have degree one. Together with ConnectedValues this is one simple path.
const endpoints = new Set(['R1C1', 'R9C9']);
function degreeMachine(requiredDegree) {
  return NFA.encodeSpec({
    startState: { phase: 'cell' },
    transition: (state, membership) => {
      if (membership !== ON && membership !== OFF) return undefined;
      if (state.phase === 'cell') {
        return membership === ON
          ? { phase: 'neighbours', count: 0 }
          : { phase: 'off' };
      }
      if (state.phase === 'off') return { phase: 'off' };
      const count = state.count + (membership === ON ? 1 : 0);
      return count <= requiredDegree
        ? { phase: 'neighbours', count }
        : undefined;
    },
    accept: state => state.phase === 'off' || state.count === requiredDegree,
  }, geometry.numValues);
}
const pathDegrees = gridCells.map(cell => new NFA(
  degreeMachine(endpoints.has(cell) ? 1 : 2),
  'path-degree',
  ...path.at([cell, ...graph.neighbours(cell)]),
));

// If the first cell is on the path, compare its effective value with a second
// grave cell. The two directions let each on-path cell require both a lower and
// a higher effective neighbour somewhere in its grave.
function comparisonMachine(compare) {
  return NFA.encodeSpec({
    startState: { phase: 'path' },
    transition: (state, value) => {
      switch (state.phase) {
        case 'path':
          return value === OFF
            ? { phase: 'skip', left: 4 }
            : value === ON ? { phase: 'aFlag' } : undefined;
        case 'aFlag':
          return value === NULL || value === NORMAL
            ? { phase: 'aDigit', aNull: value === NULL }
            : undefined;
        case 'aDigit':
          return { phase: 'bFlag', a: state.aNull ? 0 : value };
        case 'bFlag':
          return value === NULL || value === NORMAL
            ? { phase: 'bDigit', a: state.a, bNull: value === NULL }
            : undefined;
        case 'bDigit':
          return compare(state.a, state.bNull ? 0 : value)
            ? { phase: 'done' }
            : undefined;
        case 'skip':
          return state.left > 1
            ? { phase: 'skip', left: state.left - 1 }
            : { phase: 'done' };
      }
    },
    accept: state => state.phase === 'done',
  }, geometry.numValues);
}
const greaterMachine = comparisonMachine((a, b) => a > b);
const lesserMachine = comparisonMachine((a, b) => a < b);
function compareEffective(machine, cell, other) {
  return new NFA(machine, 'path-extreme',
    path.at(cell), nullifiers.at(cell), cell, nullifiers.at(other), other);
}
const pathAvoidsExtremes = graves.flatMap(([, cells]) => cells.map(cell => {
  const others = cells.filter(other => other !== cell);
  return new And([
    new Or(others.map(other => compareEffective(greaterMachine, cell, other))),
    new Or(others.map(other => compareEffective(lesserMachine, cell, other))),
  ]);
}));

return [
  new Shape('9x9'),
  nullifiers.toVar('nullifier flags'),
  path.toVar('path membership'),
  nullifiers.makeReplicate(new Given(nullifiers.cells()[0], NULL, NORMAL)),
  path.makeReplicate(new Given(path.cells()[0], ON, OFF)),
  ...nullifierRules,
  ...graveRules,
  new Given(path.at('R1C1'), ON),
  new Given(path.at('R9C9'), ON),
  new ConnectedValues('VP', ON),
  ...pathDegrees,
  ...pathAvoidsExtremes,
];
