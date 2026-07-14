// Title: Budowa
// Author: Alaric Taqi A. (Crusader175)
// Video: https://www.youtube.com/watch?v=1leqvgtT3_w
// Source: https://sudokupad.app/yp4js8z1ck

// Chaos Construction: divide the grid into nine 9-cell orthogonally
// connected regions; each row, column, and region holds 1-9 once.
//
// Kreska: adjacent digits along a line must either be consecutive and lie
// in different regions, or have a 1:2 ratio and lie in the same region.
// (1 and 2 satisfy both digit conditions at once, so either region
// relation is allowed for that pair -- no separate encoding needed for
// that clarifying sentence.) The drawn lines step diagonally in places;
// "adjacent" means consecutive along the drawn line, not grid-orthogonal
// adjacency.

// Each line's cell path in drawn order. `closed: true` marks the two lines
// whose payload waypoints explicitly repeat the first cell (a genuine
// closing edge); the other lines are open paths.
const LINES = [
  { cells: ['R2C8', 'R2C9'], closed: false },
  { cells: ['R3C7', 'R3C6', 'R4C5', 'R5C6', 'R5C7'], closed: false },
  { cells: ['R4C6', 'R4C7'], closed: false },
  { cells: ['R6C9', 'R6C8', 'R5C8'], closed: false },
  { cells: ['R1C4', 'R1C5', 'R1C6', 'R2C7', 'R2C6', 'R2C5'], closed: true },
  { cells: ['R5C4', 'R4C4', 'R3C4', 'R3C3', 'R3C2'], closed: false },
  { cells: ['R3C1', 'R4C1', 'R5C1', 'R4C2'], closed: true },
  { cells: ['R2C2', 'R1C3', 'R1C2', 'R1C1'], closed: false },
];

function linePairs({ cells, closed }) {
  const pairs = [];
  for (let i = 1; i < cells.length; i++) pairs.push([cells[i - 1], cells[i]]);
  if (closed) pairs.push([cells[cells.length - 1], cells[0]]);
  return pairs;
}

// The chaos-construction region-label cell paired with each grid cell.
const cc = cellGraph('9x9').makeOverlay('CC');

const consecutiveKey = Pair.fnToKey((a, b) => a === b + 1 || a === b - 1, 9);
const ratioKey = Pair.fnToKey((a, b) => a === b * 2 || b === a * 2, 9);

// Each adjacent pair on a Kreska line: (consecutive AND different region)
// OR (1:2 ratio AND same region).
const kreskaPairs = LINES.flatMap(linePairs).map(([a, b]) => new Or([
  new And([
    new Pair(consecutiveKey, 'Consecutive', a, b),
    new AllDifferent(cc.at(a), cc.at(b)),
  ]),
  new And([
    new Pair(ratioKey, 'Ratio', a, b),
    new SameValues(2, cc.at(a), cc.at(b)),
  ]),
]));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  ...kreskaPairs,
];
