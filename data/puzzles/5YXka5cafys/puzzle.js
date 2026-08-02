// Title: Trouble
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=5YXka5cafys
// Source: https://app.crackingthecryptic.com/sudoku/3hQ4Dmd6q4

// Normal Sudoku. VR is a hidden role layer: 1 is ordinary, 2 is a Doubler,
// and 3 is a Tripler. Blue Region Sum Lines use digit * role. Each row,
// column, and box has one role-2 and one role-3 cell; those two sets each
// contain digits 1-9 once, and all marked cells are king-move separated.

const graph = cellGraph('9x9');
const cells = graph.cells();
const roles = graph.makeOverlay('VR');
const role = cell => roles.at(cell);
const interleave = line => line.flatMap(cell => [cell, role(cell)]);

// A scan of all [digit, role] pairs makes target occur exactly once in one
// requested role class.
const markedDigitMachine = (target, markedRole) => NFA.encodeSpec({
  startState: { phase: 'digit', count: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'role', digit: value, count: state.count };
    if (value < 1 || value > 3) return undefined;
    const count = state.count + (state.digit === target && value === markedRole ? 1 : 0);
    return count > 1 ? undefined : { phase: 'digit', count };
  },
  accept: state => state.phase === 'digit' && state.count === 1,
}, 9);

// Each line is split at every 3x3-box crossing. The NFA gets those as separate
// segments. One NFA fixes a candidate X, and an Or covers all possible X values;
// this avoids carrying both a first-section target and a running sum in one NFA.
const splitAtBoxes = line => {
  const sections = [[]];
  for (let i = 0; i < line.length; i++) {
    sections.at(-1).push(line[i]);
    const here = parseCellId(line[i]);
    const next = i + 1 < line.length ? parseCellId(line[i + 1]) : null;
    if (next && (Math.floor((here.row - 1) / 3) !== Math.floor((next.row - 1) / 3)
        || Math.floor((here.col - 1) / 3) !== Math.floor((next.col - 1) / 3))) sections.push([]);
  }
  return sections;
};
const regionSumMachine = (target, maxDepth) => {
  return NFA.encodeSpec({
    startState: { phase: 'digit', sum: 0 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        if (state.phase !== 'digit') return undefined;
        return state.sum === target ? { phase: 'digit', sum: 0 } : undefined;
      }
      if (state.phase === 'digit') {
        return { ...state, phase: 'role', digit: value };
      }
      if (value < 1 || value > 3) return undefined;
      const sum = state.sum + state.digit * value;
      return sum <= target ? { phase: 'digit', sum } : undefined;
    },
    accept: state => state.phase === 'digit' && state.sum === target,
    maxDepth,
  }, 9, { multiSegment: true });
};

// Blue strokes, transcribed from the four source line entries in waypoint order.
const blueLines = [
  ['R3C1', 'R2C2', 'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C2', 'R5C3', 'R5C4', 'R6C3', 'R6C2', 'R5C1'],
  ['R3C4', 'R4C4', 'R4C5', 'R4C6', 'R3C6', 'R2C7', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R2C4', 'R3C5'],
  ['R5C6', 'R5C7', 'R6C7', 'R6C6', 'R6C5', 'R6C4', 'R7C4', 'R8C4', 'R9C3', 'R9C2', 'R8C1'],
  ['R2C9', 'R3C8', 'R4C8', 'R5C8', 'R6C8'],
];

const noTouchKey = Pair.fnToKey((a, b) => a === 1 || b === 1, 9);
const seen = new Set();
const kingCellPairs = [];
for (const cell of cells) {
  for (const neighbour of graph.kingNeighbours(cell)) {
    const pairKey = [cell, neighbour].sort().join('_');
    if (seen.has(pairKey)) continue;
    seen.add(pairKey);
    kingCellPairs.push([cell, neighbour]);
  }
}
const noTouchTemplates = [
  { offset: [0, 1], template: ['R1C1', 'R1C2'], anchor: ([a]) => a },
  { offset: [1, -1], template: ['R1C2', 'R2C1'], anchor: ([a]) => graph.step(a, 0, -1) },
  { offset: [1, 0], template: ['R1C1', 'R2C1'], anchor: ([a]) => a },
  { offset: [1, 1], template: ['R1C1', 'R2C2'], anchor: ([a]) => a },
];
const noTouch = noTouchTemplates.map(({ offset: [dRow, dCol], template, anchor }) => {
  const pairs = kingCellPairs.filter(([a, b]) => {
    const from = parseCellId(a), to = parseCellId(b);
    return to.row - from.row === dRow && to.col - from.col === dCol;
  });
  return roles.makeReplicate(new Pair(noTouchKey, 'marked cells do not touch',
    role(template[0]), role(template[1])), pairs.map(pair => role(anchor(pair))));
});

return [
  new Shape('9x9'),
  roles.toVar('ordinary, doubler, tripler roles'),
  roles.makeReplicate(new Given(roles.cells()[0], 1, 2, 3), roles.cells()),

  // One doubler and one tripler in each ordinary Sudoku house.
  ...graph.rowsColumnsBoxes().flatMap(house => [
    new ContainExact('2', ...roles.at(house)),
    new ContainExact('3', ...roles.at(house)),
  ]),

  // Doubler and tripler digits are each a complete 1-9 set.
  ...[2, 3].flatMap(markedRole => Array.from({ length: 9 }, (_, i) =>
    new NFA(markedDigitMachine(i + 1, markedRole),
      `${markedRole === 2 ? 'doubler' : 'tripler'} digit ${i + 1}`, ...interleave(cells)))),

  // A marked cell may not be a king's move from any other marked cell.
  ...noTouch,

  ...blueLines.map(line => {
    const sections = splitAtBoxes(line).map(interleave);
    const depth = sections.reduce((sum, section) => sum + section.length, 0) + sections.length - 1;
    const minLength = Math.min(...sections.map(section => section.length / 2));
    return new Or(Array.from({ length: 27 * minLength }, (_, i) => i + 1).map(target =>
      new NFA(regionSumMachine(target, depth), `effective Region Sum Line X=${target}`, ...sections)));
  }),
];
