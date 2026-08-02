// Title: SLIDE-OKU #1b - Penguindrome
// Author: Jekyll
// Video: https://www.youtube.com/watch?v=g12UqQ1xr8s
// Source: https://sudokupad.app/ebemk89tg1

// Normal Sudoku applies. The penguin enters R1C3 from above, slides until a rock
// or board edge, turns orthogonally at each stop, never reuses an edge, and exits
// rightward after R7C9. Its route is a palindrome; each coin is black exactly when
// the route crosses its edge, otherwise white. The rock and coin coordinates are
// transcribed from the drawn board.
const rocks = new Set(['1,1', '2,6', '3,9', '4,3', '5,4', '6,7', '7,5', '8,2', '9,8']);
const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const coins = [
  [[2, 2], [2, 3]], [[2, 1], [3, 1]], [[8, 7], [8, 8]],
  [[9, 5], [9, 6]], [[5, 6], [6, 6]], [[2, 8], [2, 9]],
];

function cellId([row, col]) {
  return makeCellId(row, col);
}

function edge(a, b) {
  const first = a.join(',');
  const second = b.join(',');
  return first < second ? `${first}-${second}` : `${second}-${first}`;
}

function slide(row, col, dRow, dCol) {
  const cells = [];
  while (true) {
    const nextRow = row + dRow;
    const nextCol = col + dCol;
    if (nextRow < 1 || nextRow > 9 || nextCol < 1 || nextCol > 9 ||
        rocks.has(`${nextRow},${nextCol}`)) return cells;
    cells.push([nextRow, nextCol]);
    row = nextRow;
    col = nextCol;
  }
}

function routeEdges(cells) {
  return cells.slice(1).map((cell, index) => edge(cells[index], cell));
}

// Enumerate the finite physical routes. Repeated cells are permitted (a crossing),
// but this Set records undirected segments so an overlap in either direction is not.
function routesFrom(row, col, previousDirection, cells, usedEdges, routes) {
  if (row === 7 && col === 9 && previousDirection === 1) {
    routes.push({ cells, usedEdges });
    return;
  }
  directions.forEach(([dRow, dCol], direction) => {
    if (direction % 2 === previousDirection % 2) return;
    const moved = slide(row, col, dRow, dCol);
    if (moved.length === 0) return;
    const segment = routeEdges([[row, col], ...moved]);
    if (segment.some(segmentEdge => usedEdges.has(segmentEdge))) return;
    routesFrom(...moved.at(-1), direction, cells.concat(moved),
      new Set([...usedEdges, ...segment]), routes);
  });
}

const entrance = [[1, 3], ...slide(1, 3, 1, 0)];
const routes = [];
routesFrom(...entrance.at(-1), 0, entrance, new Set(routeEdges(entrance)), routes);

const routeConstraints = routes.map(({ cells, usedEdges }) => new And([
  new Palindrome(...cells.map(cellId)),
  ...coins.map(([a, b]) => (usedEdges.has(edge(a, b))
    ? new BlackDot(cellId(a), cellId(b))
    : new WhiteDot(cellId(a), cellId(b)))),
]));

return [
  new Shape('9x9'),
  new Or(routeConstraints),
];
