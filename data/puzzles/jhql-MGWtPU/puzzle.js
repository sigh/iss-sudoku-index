// Title: BYO Arrows
// Author: Celery
// Video: https://www.youtube.com/watch?v=jhql-MGWtPU
// Source: https://app.crackingthecryptic.com/vzcs2pu8w6

// Normal Sudoku. The drawn circles are counting circles and arrow bulbs. Each
// circle chooses one orthogonal two-cell arm. The arm digits sum to its bulb,
// and two chosen arms cannot use the same cell. A choice Var stores the path
// number for each circle; values 1-12 cover the largest local path list.

const g = cellGraph('9x9');
const circles = [
  'R3C3', 'R2C2', 'R1C1', 'R4C2', 'R5C2', 'R6C1', 'R9C1',
  'R7C3', 'R9C5', 'R1C5', 'R1C7', 'R3C9', 'R5C8', 'R7C9',
  'R8C8', 'R8C7', 'R7C6', 'R5C4', 'R6C4',
];
const circleSet = new Set(circles);
const givens = [['R3C4', 3], ['R4C7', 3], ['R7C2', 4]];
const givenSet = new Set(givens.map(([cell]) => cell));
const choices = new Var('S', 'arrow path choice', circles.length);
const choiceCells = choices.cells();

// The path table is derived from the drawn circle cells and the stated
// orthogonal two-cell length: one step from the bulb, then one from that cell.
const paths = circles.map(bulb => g.neighbours(bulb)
  .filter(first => !circleSet.has(first) && !givenSet.has(first))
  .flatMap(first => g.neighbours(first)
    .filter(second => !circleSet.has(second) && !givenSet.has(second))
    .map(second => [first, second])));

const choiceDomains = paths.map((pathList, index) =>
  new Given(choiceCells[index], ...pathList.map((_, pathIndex) => pathIndex + 1))
);

const arrows = paths.map((pathList, index) => new Or(pathList.map((arm, pathIndex) =>
  new And([new Given(choiceCells[index], pathIndex + 1), new Arrow(circles[index], ...arm)])
)));

// For each two bulbs, reject precisely the pairs of selected paths that reuse
// an arm cell. Adjacent but separate arrow paths remain legal.
const noCollision = [];
for (let left = 0; left < paths.length; left++) {
  for (let right = left + 1; right < paths.length; right++) {
    const key = Pair.fnToKey((a, b) => {
      const armA = paths[left][a - 1];
      const armB = paths[right][b - 1];
      return !armA || !armB || !armA.some(cell => armB.includes(cell));
    }, 12);
    noCollision.push(new Pair(key, 'separate arrows', choiceCells[left], choiceCells[right]));
  }
}

return [
  new Shape('9x9', 12),
  choices,
  g.makeReplicate(new Given(g.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new CountingCircles(...circles),
  ...choiceDomains,
  ...arrows,
  ...noCollision,
];
