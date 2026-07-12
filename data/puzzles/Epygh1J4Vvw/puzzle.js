// Title: Oops! Bumped the Table
// Author: PhyDraLey
// Video: https://www.youtube.com/watch?v=Epygh1J4Vvw
// Source: https://sudokupad.app/vnd2slg4jx

// Each bumped dot has a direction Var. The Var selects the edge of the dot's
// current cell where the Kropki dot originally sat.
const UP = 1, RIGHT = 2, DOWN = 3, LEFT = 4;
const DIRS = [
  { value: UP, dr: -1, dc: 0, name: 'U' },
  { value: RIGHT, dr: 0, dc: 1, name: 'R' },
  { value: DOWN, dr: 1, dc: 0, name: 'D' },
  { value: LEFT, dr: 0, dc: -1, name: 'L' },
];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const dotDirectionsVar = new Var('D', 'bumped dot directions', 20);
const constraints = [
  new Shape('9x9'),
  dotDirectionsVar,
];
const add = (...items) => constraints.push(...items);

for (const [cell, value] of [
  ['R4C6', 2],
  ['R5C3', 5],
  ['R7C1', 4],
  ['R8C9', 4],
  ['R9C1', 2],
]) {
  add(new Given(cell, value));
}

const dots = [
  ['black', 'R1C1'], ['black', 'R1C2'], ['black', 'R2C1'], ['black', 'R2C2'],
  ['black', 'R1C7'], ['black', 'R1C8'], ['black', 'R1C9'],
  ['black', 'R9C7'], ['black', 'R9C6'], ['black', 'R8C6'], ['black', 'R8C7'],
  ['white', 'R8C3'], ['white', 'R5C2'], ['white', 'R4C2'],
  ['black', 'R4C9'], ['white', 'R9C2'], ['white', 'R3C7'],
  ['white', 'R4C8'], ['white', 'R5C4'], ['white', 'R3C5'],
].map(([color, cell], index) => ({ color, cell, varCell: dotDirectionsVar.cell(index + 1) }));

const sameEdge = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
const edgeKey = (cell, dir) => {
  const { row, col } = parseCellId(cell);
  const nr = row + dir.dr, nc = col + dir.dc;
  const a = [row, col], b = [nr, nc];
  const [lo, hi] = row < nr || (row === nr && col < nc) ? [a, b] : [b, a];
  return [lo[0], lo[1], hi[0], hi[1]];
};
const neighbor = (cell, dir) => graph.step(cell, dir.dr, dir.dc);

for (const dot of dots) {
  dot.candidates = DIRS
    .map(dir => ({ dir, other: neighbor(dot.cell, dir), edge: edgeKey(dot.cell, dir) }))
    .filter(candidate => candidate.other);
  add(new Given(dot.varCell, ...dot.candidates.map(candidate => candidate.dir.value)));
}

const relationMachine = (selectedDir, color) => NFA.encodeSpec({
  startState: { phase: 'dir' },
  transition: (state, value) => {
    if (state.phase === 'dir') return { phase: 'a', selected: value === selectedDir };
    if (state.phase === 'a') return { phase: 'b', selected: state.selected, a: value };
    if (!state.selected) return { done: true };
    const ok = color === 'white'
      ? Math.abs(state.a - value) === 1
      : state.a === 2 * value || value === 2 * state.a;
    return ok ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

// Two dots must not select the same original edge. This is a plain binary
// relation between the two dots' direction Vars, so it is a Pair.
const noSameEdgeKey = (dotA, dotB) => Pair.fnToKey((a, b) => {
  const ca = dotA.candidates.find(candidate => candidate.dir.value === a);
  const cb = dotB.candidates.find(candidate => candidate.dir.value === b);
  return !(ca && cb && sameEdge(ca.edge, cb.edge));
}, geometry.numValues);

for (const dot of dots) {
  for (const candidate of dot.candidates) {
    add(new NFA(
      relationMachine(candidate.dir.value, dot.color),
      `${dot.color}-${candidate.dir.name}`,
      dot.varCell,
      dot.cell,
      candidate.other,
    ));
  }
}

for (let i = 0; i < dots.length; i++) {
  for (let j = i + 1; j < dots.length; j++) {
    if (dots[i].candidates.some(a => dots[j].candidates.some(b => sameEdge(a.edge, b.edge)))) {
      add(new Pair(noSameEdgeKey(dots[i], dots[j]), 'distinct-edge', dots[i].varCell, dots[j].varCell));
    }
  }
}

return constraints;
