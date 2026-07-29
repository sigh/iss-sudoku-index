// Title: Twelve Spots
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=RceIm4QX-u0
// Source: https://sudokupad.app/7m4vgf6l3t

// Normal 6x6 sudoku and the three drawn sum cages are encoded. Turquoise
// spots are endpoints of six non-branching, non-crossing king-move paths.
// Each path label is its absolute digit difference (labels 1..6 mean 0..5),
// and each label occurs at exactly two spots. Extra closed components of a
// label are omitted; see the recorded omitted rule.
const NV = 7;
const UNUSED = 1, USED = 2, OFF = 7;
const shape = new Shape('6x6', NV);
const graph = cellGraph(shape);
const cells = graph.cells();
const labels = graph.makeOverlay('VL');
const spots = new Set([
  'R1C3', 'R1C6', 'R2C3', 'R2C5', 'R4C1', 'R4C6',
  'R5C2', 'R5C3', 'R5C4', 'R6C2', 'R6C3', 'R6C5',
]);

// Each king-move edge once. A step is either unused or used; the cell machine
// below supplies the degree rule, and these edge constraints supply its label
// and digit semantics.
const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
const edges = [];
const incident = new Map(cells.map(cell => [cell, []]));
for (const a of cells) {
  for (const [dr, dc] of directions) {
    const b = graph.step(a, dr, dc);
    if (!b) continue;
    const id = 'VS' + (edges.length + 1);
    edges.push({ id, a, b });
    incident.get(a).push(id);
    incident.get(b).push(id);
  }
}

const cache = new Map();
const cached = (key, build) => {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
};

// A spot has one used incident edge; an unspotted selected cell has two; an
// OFF cell has none. This is the local path rule, including no branching.
const cellSpec = isSpot => cached(`cell|${isSpot}`, () =>
  NFA.encodeSpec({
    startState: { count: 0, label: null },
    transition: (state, value) => {
      if (state.label === null) return { count: 0, label: value };
      if (value !== UNUSED && value !== USED) return undefined;
      const count = state.count + (value === USED ? 1 : 0);
      return count <= 2 ? { count, label: state.label } : undefined;
    },
    accept: state => state.label !== null && (isSpot
      ? state.label !== OFF && state.count === 1
      : state.label === OFF ? state.count === 0 : state.count === 2),
  }, NV));

const edgeSpec = (bothSpots) => cached(`edge|${bothSpots}`, () =>
  NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      if (state.k === 0) return { k: 1, step: value };
      if (state.k === 1) return { k: 2, step: state.step, la: value };
      if (state.k === 2) return { k: 3, step: state.step, la: state.la, lb: value };
      if (state.k === 3) return { k: 4, step: state.step, la: state.la, lb: state.lb, a: value };
      if (state.k !== 4) return undefined;
      if (state.step === UNUSED) return { done: true };
      if (state.step !== USED || bothSpots || state.la !== state.lb || state.la === OFF) return undefined;
      return Math.abs(state.a - value) === state.la - 1 ? { done: true } : undefined;
    },
    accept: state => state.done === true,
  }, NV));

const crossing = [];
for (let r = 1; r < 6; r++) for (let c = 1; c < 6; c++) {
  const a = makeCellId(r, c), b = makeCellId(r + 1, c + 1);
  const d = makeCellId(r, c + 1), e = makeCellId(r + 1, c);
  const x = edges.find(edge => edge.a === a && edge.b === b);
  const y = edges.find(edge => edge.a === d && edge.b === e);
  const key = Pair.fnToKey((u, v) => u === UNUSED || v === UNUSED, NV);
  crossing.push(new Pair(key, 'no diagonal crossing', x.id, y.id));
}

const labelDomains = cells.map(cell => new Given(labels.at(cell),
  ...(spots.has(cell) ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, OFF])));
const localDegrees = cells.map(cell => new NFA(
  cellSpec(spots.has(cell)),
  'turquoise path cell', labels.at(cell), ...incident.get(cell)));
const edgeRules = edges.map(({ id, a, b }) => new NFA(
  edgeSpec(spots.has(a) && spots.has(b)), 'same difference step',
  id, labels.at(a), labels.at(b), a, b));
const twoEndpoints = [1, 2, 3, 4, 5, 6].map(label =>
  new ContainExact(`${label}_${label}`, ...labels.at([...spots])));

return [
  shape,
  labels.toVar('turquoise path difference label'),
  new Var('S', 'turquoise path step', edges.length),
  graph.makeReplicate(new Given(cells[0], 1, 2, 3, 4, 5, 6)),
  ...labelDomains,
  ...twoEndpoints,
  new Sum(11, 'R1C3', 'R2C3'),
  new Sum(8, 'R1C4', 'R2C4'),
  new Sum(6, 'R6C3', 'R6C4', 'R6C5'),
  ...localDegrees,
  ...edgeRules,
  ...crossing,
];
