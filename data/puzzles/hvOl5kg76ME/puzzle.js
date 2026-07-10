// Title: The Neighbours Are Whispering
// Author: Pulsar & FischmitFahrrad
// Video: https://www.youtube.com/watch?v=hvOl5kg76ME
// Source: https://sudokupad.app/euq3xbt4hm

// Doublers are deterministic: a cell is doubled exactly when its digit equals
// its 1-9 position inside its 3x3 box. Doubled values are used only for the
// Whispering Neighbours rule.

const graph = cellGraph('9x9');

const CAGES = [
  ['R1C2', 'R2C2', 'R2C3', 'R2C4', 'R3C3', 'R3C4'],
  ['R4C9', 'R5C9'],
];

const positionInBox = (cell) => {
  const { row, col } = parseCellId(cell);
  return ((row - 1) % 3) * 3 + ((col - 1) % 3) + 1;
};

const effectiveValue = (value, position) => value === position ? 2 * value : value;

const exactOneDoublerKey = (positions) => NFA.encodeSpec({
  startState: { index: 0, count: 0 },
  transition: ({ index, count }, value) => {
    if (index >= positions.length) return undefined;
    const nextCount = count + (value === positions[index] ? 1 : 0);
    if (nextCount > 1) return undefined;
    return { index: index + 1, count: nextCount };
  },
  accept: ({ index, count }) => index === positions.length && count === 1,
}, 9);

const exactOneDigitDoubledKey = (digit) => NFA.encodeSpec({
  startState: 0,
  transition: (count, value) => {
    const nextCount = count + (value === digit ? 1 : 0);
    return nextCount <= 1 ? nextCount : undefined;
  },
  accept: (count) => count === 1,
}, 9);

const whisperKeys = new Map();
const whisperKey = (positionA, positionB) => {
  const cacheKey = `${positionA},${positionB}`;
  if (!whisperKeys.has(cacheKey)) {
    whisperKeys.set(cacheKey, Pair.fnToKey(
      (a, b) => Math.abs(effectiveValue(a, positionA) - effectiveValue(b, positionB)) >= 5,
      9,
    ));
  }
  return whisperKeys.get(cacheKey);
};

const gatedKey = Pair.fnToKey((a, b) => Math.abs(a - b) < 5, 9);

const constraints = [new Shape('9x9')];
const cells = graph.cells();

for (const top of graph.column('R1C1')) {
  const row = graph.row(top);
  constraints.push(new NFA(
    exactOneDoublerKey(row.map(positionInBox)),
    'one doubler in row',
    ...row,
  ));
}

for (const top of graph.row('R1C1')) {
  const column = graph.column(top);
  constraints.push(new NFA(
    exactOneDoublerKey(column.map(positionInBox)),
    'one doubler in column',
    ...column,
  ));
}

for (let digit = 1; digit <= 9; digit++) {
  constraints.push(new NFA(
    exactOneDigitDoubledKey(digit),
    `digit ${digit} doubled once`,
    ...cells.filter(cell => positionInBox(cell) === digit),
  ));
}

for (const cell of cells) {
  const positionA = positionInBox(cell);
  constraints.push(new Or(graph.neighbours(cell).map(neighbour =>
    new Pair(
      whisperKey(positionA, positionInBox(neighbour)),
      'whispering neighbours',
      cell,
      neighbour,
    )
  )));
}

const cageIndex = new Map();
for (let i = 0; i < CAGES.length; i++) {
  for (const cell of CAGES[i]) cageIndex.set(cell, i);
}

const seenBorders = new Set();
for (const cell of cageIndex.keys()) {
  for (const neighbour of graph.neighbours(cell)) {
    if (cageIndex.get(neighbour) === cageIndex.get(cell)) continue;
    const edge = [cell, neighbour].sort().join('-');
    if (seenBorders.has(edge)) continue;
    seenBorders.add(edge);
    constraints.push(new Pair(gatedKey, 'gated community border', cell, neighbour));
  }
}

return constraints;
