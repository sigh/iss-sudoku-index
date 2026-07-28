// Title: The King
// Author: Justin Vitanza
// Video: https://www.youtube.com/watch?v=HtCmvyzepgQ
// Source: https://sudokupad.app/7wu3gxtfgz

// Normal Sudoku rules apply. For each law-abiding digit X, exactly X cells
// holding X have an equal king neighbour. Exactly two digit values are
// rebellious, so none of their instances has an equal king neighbour.
const graph = cellGraph('9x9');
const cells = graph.cells();
const ON = 1;
const OFF = 2;
const digits = Array.from({ length: 9 }, (_, i) => i + 1);
const hasEqualKingNeighbour = graph.makeOverlay('VH');

// Each overlay value records whether its grid cell has at least one equal-valued
// king neighbour; the NFA reads the cell, its flag, then all of those neighbours.
const localKingMachine = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'flag', digit: value };
    if (state.phase === 'flag') return { phase: 'neighbours', digit: state.digit, marked: value === ON, match: false };
    return { ...state, match: state.match || value === state.digit };
  },
  accept: state => state.phase === 'neighbours' && state.marked === state.match,
  maxDepth: 10,
}, 9);

// VK1..VK9 correspond to digit values. ON marks a rebellious digit and OFF a
// law-abiding one. Each target NFA counts marked occurrences of its own digit.
const rebelVars = new Var('VK', 'rebellious digit', 9);
const rebellious = rebelVars.cells();
function targetKingMachine(digit) {
  return NFA.encodeSpec({
    startState: { phase: 'rebel', count: 0 },
    transition: (state, value) => {
      if (state.phase === 'rebel') return { phase: 'grid', rebel: value, count: 0 };
      if (state.phase === 'grid') return { phase: 'flag', rebel: state.rebel, count: state.count, isTarget: value === digit };
      const count = state.count + (state.isTarget && value === ON ? 1 : 0);
      return count > digit ? undefined : { phase: 'grid', rebel: state.rebel, count };
    },
    accept: state => state.phase === 'grid' && state.count === (state.rebel === ON ? 0 : digit),
    maxDepth: 163,
  }, 9);
}

return [
  new Shape('9x9'),
  new Given('R2C1', 2), new Given('R2C8', 9), new Given('R4C5', 6),
  new Given('R5C3', 4), new Given('R5C8', 7), new Given('R6C4', 3),
  new Given('R7C2', 1), new Given('R7C6', 5), new Given('R8C4', 1),

  hasEqualKingNeighbour.toVar('equal king neighbour'),
  rebelVars,
  hasEqualKingNeighbour.makeReplicate(new Given(hasEqualKingNeighbour.cells()[0], ON, OFF)),
  ...rebellious.map(cell => new Given(cell, ON, OFF)),
  new ContainExact('1_1', ...rebellious),
  ...cells.map(cell => new NFA(localKingMachine, 'equal king neighbour',
    cell, hasEqualKingNeighbour.at(cell), ...graph.kingNeighbours(cell))),
  ...digits.map((digit, index) => new NFA(targetKingMachine(digit), 'King law',
    rebellious[index], ...cells.flatMap(cell => [cell, hasEqualKingNeighbour.at(cell)]))),
];
