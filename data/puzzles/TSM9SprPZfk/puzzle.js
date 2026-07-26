// Title: Dicedoku 2
// Author: Sudokun
// Video: https://www.youtube.com/watch?v=TSM9SprPZfk
// Source: https://sudokupad.app/4k3mhqwkta

// Normal sudoku (default 3x3 boxes, matching the drawn regions). No givens.
// Five dashed 6-cell cages, each shaped like a die net (rules: "Every cage
// must fold into a valid normal dice, where opposing faces sum to 7"): the
// two net cells that meet each other when the net is folded into a cube must
// sum to 7. Seven edge dots: white = consecutive, black = 1:2 ratio (dot
// colour read from the payload's fill/background, not the border). Not
// every adjacent pair in a cage is dotted.

// Cage cell lists, transcribed from the drawn cage outlines (SudokuPad
// payload `cages`). List order is irrelevant; net adjacency is recomputed
// below from the cells' own grid positions.
const cages = [
  ['R2C3', 'R3C2', 'R3C3', 'R3C4', 'R4C3', 'R5C3'],
  ['R5C1', 'R6C1', 'R6C2', 'R7C2', 'R8C2', 'R8C3'],
  ['R7C4', 'R7C5', 'R8C5', 'R8C6', 'R9C6', 'R9C7'],
  ['R4C9', 'R5C9', 'R6C8', 'R6C9', 'R7C8', 'R8C8'],
  ['R2C7', 'R3C6', 'R3C7', 'R3C8', 'R4C7', 'R5C7'],
];

// Fold a cage's flat net into a die and return its 3 opposite-face cell
// pairs. This simulates physically rolling a die across the net: each grid
// step (N/S/E/W) between two net-adjacent cells rotates an abstract die (six
// generic face ids on U/D/N/S/E/W, opposite pairs (1,6)/(2,5)/(3,4)) exactly
// the way a real cube rolls in that direction. Walking the net's cell
// adjacency from an arbitrary start assigns every cell a "Down" (printed)
// face id; two cells whose ids sum to 7 are the two faces that come to rest
// opposite each other once the net is folded up. This is well-defined only
// because the net has no cycles (6 cells, 5 shared edges -- checked below),
// which is what a die net's outline is drawn as.
function foldDieOppositePairs(cellIds) {
  const cells = cellIds.map(id => {
    const { row, col } = parseCellId(id);
    return [row, col];
  });
  const key = ([r, c]) => `${r},${c}`;
  const index = new Map(cells.map((rc, i) => [key(rc), i]));

  // Roll direction -> new [Up, Down, North, South, East, West] from old.
  const rollTable = {
    N: ([U, D, N, S, E, W]) => [S, N, U, D, E, W],
    S: ([U, D, N, S, E, W]) => [N, S, D, U, E, W],
    E: ([U, D, N, S, E, W]) => [W, E, N, S, U, D],
    W: ([U, D, N, S, E, W]) => [E, W, N, S, D, U],
  };
  const steps = [[-1, 0, 'N'], [1, 0, 'S'], [0, 1, 'E'], [0, -1, 'W']];

  const state = new Array(cells.length);
  const visited = new Array(cells.length).fill(false);
  state[0] = [1, 6, 2, 5, 3, 4];
  visited[0] = true;
  let edgeCount = 0;
  const stack = [0];
  while (stack.length) {
    const i = stack.pop();
    const [r, c] = cells[i];
    for (const [dr, dc, dir] of steps) {
      const j = index.get(key([r + dr, c + dc]));
      if (j === undefined) continue;
      edgeCount++;
      if (visited[j]) continue;
      state[j] = rollTable[dir](state[i]);
      visited[j] = true;
      stack.push(j);
    }
  }
  if (edgeCount !== 2 * (cells.length - 1)) {
    throw new Error(`cage ${cellIds} is not a simple tree-shaped net`);
  }

  const downOf = i => state[i][1];
  const pairs = [];
  const used = new Array(cells.length).fill(false);
  for (let i = 0; i < cells.length; i++) {
    if (used[i]) continue;
    for (let j = i + 1; j < cells.length; j++) {
      if (used[j]) continue;
      if (downOf(i) + downOf(j) === 7) {
        pairs.push([cellIds[i], cellIds[j]]);
        used[i] = used[j] = true;
        break;
      }
    }
  }
  return pairs;
}

const sum7 = Pair.fnToKey((a, b) => a + b === 7, 9);

return [
  new Shape('9x9'),

  // Each cage: all six digits distinct, plus the three folded opposite-face
  // pairs sum to 7. Sum-to-7 pairs of distinct digits from 1-9 are only
  // (1,6), (2,5), (3,4), so three disjoint sum-7 pairs together with
  // all-different over the six cells force exactly the digits 1-6, each
  // once -- a valid normal die.
  ...cages.flatMap(cells => [
    new AllDifferent(...cells),
    ...foldDieOppositePairs(cells).map(([a, b]) =>
      new Pair(sum7, 'opposite die faces sum to 7', a, b)),
  ]),

  // White dots: consecutive digits.
  new WhiteDot('R8C9', 'R9C9'),
  new WhiteDot('R8C1', 'R9C1'),
  new WhiteDot('R1C5', 'R2C5'),

  // Black dots: 1:2 ratio.
  new BlackDot('R1C9', 'R2C9'),
  new BlackDot('R1C1', 'R2C1'),
  new BlackDot('R6C5', 'R6C6'),
  new BlackDot('R1C5', 'R1C6'),
];
