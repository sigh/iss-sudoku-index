// Title: Miracle-Once Again
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=xOf3MJcq_Cg
// Source: https://sudokupad.app/NbqQ2HhP4P

// Standard 9x9 Sudoku. Place circles so box m has m circles; circled digits
// count all circles carrying that digit; circles are downward-closed in each
// column. 9s are anti-king, anti-knight, and every 9 shares a diagonal with a 9.
// The VC overlay stores circle membership: 1 is circled and 2 is uncircled.

const ON = 1;
const OFF = 2;
const graph = cellGraph('9x9');
const circles = graph.makeOverlay('VC');
const cells = graph.cells();

// Scans a box's membership flags and accepts exactly target circled cells.
const boxCountSpec = (target) => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => {
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { count: next };
  },
  accept: ({ count }) => count === target,
}, 9);

// Scans grid digit/membership pairs. For digit target, exactly target circled
// cells carry target; all other digits are irrelevant to this machine.
const digitCountSpec = (target) => NFA.encodeSpec({
  startState: { digit: null, count: 0 },
  transition: ({ digit, count }, value) => {
    if (digit === null) return { digit: value, count };
    const next = count + (digit === target && value === ON ? 1 : 0);
    return next > target ? undefined : { digit: null, count: next };
  },
  accept: ({ digit, count }) => digit === null && count === target,
}, 9);

// A diagonal ray contains at least one 9.
const diagonalNineSpec = NFA.encodeSpec({
  startState: { sawNine: false },
  transition: ({ sawNine }, value) => ({ sawNine: sawNine || value === 9 }),
  accept: ({ sawNine }) => sawNine,
}, 9);

const circleDomains = [
  circles.makeReplicate(new Given(circles.cells()[0], ON, OFF)),
];

// Circle membership is downward-closed: an on cell forces its below neighbour on.
const downwardClosure = circles.makeReplicate(new Pair(
  Pair.fnToKey((top, bottom) => top !== ON || bottom === ON, 9),
  'downward circle', circles.at('R1C1'), circles.at('R2C1'),
), circles.cells().slice(0, 72));

const boxCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(target => new NFA(
  boxCountSpec(target), `box ${target} circles`, ...circles.at(graph.box(target)),
));

const digitCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(target => new NFA(
  digitCountSpec(target), `digit ${target} circles`,
  ...cells.flatMap(cell => [cell, circles.at(cell)]),
));

const diagonalNines = cells.map(cell => {
  const rays = [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([dRow, dCol]) => {
    const ray = [];
    let next = graph.step(cell, dRow, dCol);
    while (next) {
      ray.push(next);
      next = graph.step(next, dRow, dCol);
    }
    return ray;
  });
  // If the cell is not 9, no ray condition is required; otherwise one ray has a 9.
  return new Or([
    new Given(cell, 1, 2, 3, 4, 5, 6, 7, 8),
    ...rays.filter(ray => ray.length).map(ray => new NFA(diagonalNineSpec, 'diagonal 9', ...ray)),
  ]);
});

return [
  new Shape('9x9'),
  circles.toVar('circles'),
  ...circleDomains,
  downwardClosure,
  ...boxCounts,
  ...digitCounts,
  new AntiKing(),
  new AntiKnight(),
  ...diagonalNines,
];
