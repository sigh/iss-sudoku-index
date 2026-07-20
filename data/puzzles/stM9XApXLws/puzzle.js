// Title: Rapuzzle, Rapuzzle, Let Down Your Sausage
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=stM9XApXLws
// Source: https://sudokupad.app/wxbluqtoso

// Standard sudoku and anti-knight. Gray tower cells are fortress cells:
// each is greater than every orthogonally adjacent non-tower cell.
// The six drawn sausages form one ordered chain. Linked sausage sums differ
// by 6, and R4C2 counts chain cells of the parity opposite to its own digit.

const graph = cellGraph('9x9');

// The roof covers R1C2; the roof/body covers this 8x3 block.
const towerCells = ['R1C2', ...graph.block('R2C1', 8, 3)];
const towerSet = new Set(towerCells);
const towerFortress = towerCells.flatMap(tower =>
  graph.neighbours(tower)
    .filter(neighbour => !towerSet.has(neighbour))
    .map(neighbour => new GreaterThan(tower, neighbour))
);

const sausages = [
  ['R4C2', 'R4C3', 'R4C4'],
  ['R5C3'],
  ['R5C4', 'R6C3'],
  ['R7C4', 'R8C5', 'R7C6'],
  ['R8C6'],
  ['R8C7', 'R9C8'],
];
const chainLength = sausages.length;

const sausageDifference = (left, right) => new Or([
  new Sum(
    chainLength,
    ...left.map(cell => [cell, 1]),
    ...right.map(cell => [cell, -1]),
  ),
  new Sum(
    chainLength,
    ...right.map(cell => [cell, 1]),
    ...left.map(cell => [cell, -1]),
  ),
]);

const linkedSausageSums = sausages.slice(1).map((sausage, index) =>
  sausageDifference(sausages[index], sausage)
);

const face = 'R4C2';
const chainCells = [...new Set(sausages.flat())];
const faceParityCountSpec = NFA.encodeSpec({
  startState: { phase: 'face', face: 0, count: 0 },
  transition: ({ phase, face, count }, value) => {
    if (phase === 'face') return { phase: 'count', face: value, count: 0 };
    const nextCount = count + ((value - face) % 2 !== 0 ? 1 : 0);
    if (nextCount > face) return undefined;
    return { phase: 'count', face, count: nextCount };
  },
  accept: ({ phase, face, count }) => phase === 'count' && count === face,
  maxDepth: chainCells.length,
}, 9);

return [
  new Shape('9x9'),
  new Given('R1C5', 2),
  new AntiKnight(),
  ...towerFortress,
  ...linkedSausageSums,
  new NFA(
    faceParityCountSpec,
    'face digit = opposite-parity count on sausage chain',
    face,
    ...chainCells.filter(cell => cell !== face),
  ),
];
