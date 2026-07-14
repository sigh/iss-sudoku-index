// Title: Icy Escape
// Author: Chloe
// Video: https://www.youtube.com/watch?v=sDmi3HvD_rU
// Source: https://sudokupad.app/pz0m04p9ag

// Normal sudoku rules apply.
//
// The path slides from an arrow-marked entrance to an arrow-marked exit,
// travelling in a straight line until stopped by a rock or the cave wall
// (the grid boundary, since the only two openings in the wall are the
// marked entrance/exit), at which point it turns 90 degrees. Given the
// fixed rocks and fixed entrance/exit cells+directions, every straight run
// is forced; the only real choices are which of the two perpendicular
// headings to take at each rock/wall bounce. That makes the whole set of
// physically legal routes enumerable in advance -- the rules never say the
// route can't cross its own earlier track (a cell may be sled through
// twice, from two different headings, e.g. once heading up and later
// heading right through the same cell), so a route is only cut off when it
// would repeat an exact (cell, heading) it has already used, which is the
// point a further explored path would run forever. The solver only has to
// pick digits consistent with sudoku and with whichever one of the
// enumerated routes is real. "Adjacent digits along the path differ by at
// least 5" is then a Whisper(5, ...) applied along each candidate route,
// wrapped in Or.
//
// Entrance: arrow outside the grid left of R9C1, pointing right -> path
// starts at R9C1 sliding right.
// Exit: arrow outside the grid right of R1C9, pointing right (away) ->
// path ends at R1C9, having arrived sliding right, then exits.
// Rocks (may not be visited; force a turn when the next cell in the
// current slide direction is one of these): R2C1, R2C6, R3C3, R4C9, R5C2,
// R5C4, R5C7, R6C5, R7C6, R8C4, R8C8, R9C3, R9C5.

const ROCKS = new Set([
  'R2C1', 'R2C6', 'R3C3', 'R4C9', 'R5C2',
  'R5C4', 'R5C7', 'R6C5', 'R7C6', 'R8C4',
  'R8C8', 'R9C3', 'R9C5',
]);
const START = 'R9C1', START_DIR = [0, 1];   // enters sliding right
const END = 'R1C9', END_DIR = [0, 1];       // exits sliding right
const DIRS = [[0, 1], [0, -1], [-1, 0], [1, 0]]; // R, L, U, D
// Perpendicular turn options for each direction (no reversing: sliding
// backward over the cell just left is not a physical slide, and would
// re-enter an already-visited cell anyway).
const PERP = new Map([
  ['0,1', [[-1, 0], [1, 0]]],
  ['0,-1', [[-1, 0], [1, 0]]],
  ['-1,0', [[0, 1], [0, -1]]],
  ['1,0', [[0, 1], [0, -1]]],
]);

function cellAt(row, col) {
  if (row < 1 || row > 9 || col < 1 || col > 9) return null;
  const id = makeCellId(row, col);
  return ROCKS.has(id) ? null : id;
}

// Enumerate every slide route from START/START_DIR to END/END_DIR under
// the rock/wall-bounce physics above. A route may cross its own earlier
// track (revisit a cell under a different heading); it is only pruned once
// it would repeat an exact (cell, heading) pair, which is the signature of
// an infinite loop rather than a new route.
function enumerateRoutes() {
  const routes = [];
  const { row: sr, col: sc } = parseCellId(START);
  const startKey = `${sr},${sc},${START_DIR}`;
  const startState = { row: sr, col: sc, dir: START_DIR, path: [START], seen: new Set([startKey]) };

  function walk(state) {
    const { row, col, dir, path, seen } = state;
    if (makeCellId(row, col) === END && dir[0] === END_DIR[0] && dir[1] === END_DIR[1]) {
      routes.push(path.slice());
      return;
    }
    const nr = row + dir[0], nc = col + dir[1];
    const nextId = cellAt(nr, nc);
    if (nextId !== null) {
      // Forced continuation: no rock/wall ahead, so no choice is made here.
      const key = `${nr},${nc},${dir}`;
      if (seen.has(key)) return; // would repeat a (cell, heading) -> infinite loop
      seen.add(key);
      path.push(nextId);
      walk({ row: nr, col: nc, dir, path, seen });
      path.pop();
      seen.delete(key);
      return;
    }
    // Blocked ahead (rock or cave wall): free to turn onto either
    // perpendicular heading that leads to an in-bounds, rock-free cell not
    // already reached under that same new heading.
    for (const turnDir of PERP.get(`${dir[0]},${dir[1]}`)) {
      const tr = row + turnDir[0], tc = col + turnDir[1];
      const turnId = cellAt(tr, tc);
      if (turnId === null) continue;
      const key = `${tr},${tc},${turnDir}`;
      if (seen.has(key)) continue;
      seen.add(key);
      path.push(turnId);
      walk({ row: tr, col: tc, dir: turnDir, path, seen });
      path.pop();
      seen.delete(key);
    }
  }

  walk(startState);
  return routes;
}

const routes = enumerateRoutes();

return [
  new Shape('9x9'),

  // Every enumerated candidate route gets the along-path Whisper(5); Or
  // picks whichever one is the real path.
  new Or(routes.map(route => new Whisper(5, ...route))),

  // Independent Kropki black dots (2:1 ratio), unrelated to the path.
  new BlackDot('R8C2', 'R8C3'),
  new BlackDot('R3C1', 'R3C2'),
  new BlackDot('R7C7', 'R7C8'),
  new BlackDot('R4C4', 'R5C4'),
  new BlackDot('R5C8', 'R6C8'),
  new BlackDot('R2C3', 'R3C3'),
  new BlackDot('R1C4', 'R1C5'),
  new BlackDot('R8C1', 'R8C2'),
  new BlackDot('R1C7', 'R2C7'),
  new BlackDot('R5C6', 'R5C7'),
  new BlackDot('R4C7', 'R5C7'),
];
