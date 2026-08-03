// Title: Tatamidoku
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=BED9Muor-1I
// Source: https://app.crackingthecryptic.com/sudoku/pbb4pNb3T4

// Rules encoded here:
//  - Normal sudoku: rows, columns and the drawn 3x3 boxes.
//  - Adjacent digits on a green line differ by 5 or more.
//  - The grid is cut into non-overlapping rectangular regions tiling all 81
//    cells, each holding exactly one small clue. Digits do not repeat within a
//    region and sum to that region's small clue; a clue drawn as a bare "?"
//    states no total. The digit in the clue cell gives the region's shape:
//    1-4 wider than tall, 5 square, 6-9 taller than wide.
//  - Four regions cannot share the same cell corner.
// Nothing is omitted.

const graph = cellGraph('9x9');

// The 19 small clues, from the little text labels drawn in the top-left corner
// of a cell. `total` is the printed number, or null for a bare "?".
const clues = [
  { cell: 'R1C4', total: null },
  { cell: 'R2C1', total: null },
  { cell: 'R2C7', total: 15 },
  { cell: 'R3C2', total: null },
  { cell: 'R4C3', total: 21 },
  { cell: 'R4C4', total: 36 },
  { cell: 'R4C6', total: null },
  { cell: 'R4C8', total: 37 },
  { cell: 'R5C2', total: 15 },
  { cell: 'R5C9', total: null },
  { cell: 'R6C3', total: null },
  { cell: 'R6C6', total: null },
  { cell: 'R7C1', total: null },
  { cell: 'R7C3', total: null },
  { cell: 'R8C5', total: 21 },
  { cell: 'R8C8', total: 6 },
  { cell: 'R9C2', total: null },
  { cell: 'R9C7', total: 16 },
  { cell: 'R9C8', total: null },
];
const clueCells = new Set(clues.map(c => c.cell));

// Digits do not repeat within a region, so an n-cell region's total lies
// between 1+2+...+n and 9+8+...+(10-n); a printed total therefore rules out
// most region sizes before the search starts.
const sizeCanTotal = (n, total) => total === null ||
  (n * (n + 1) / 2 <= total && total <= n * (19 - n) / 2);

// Every rectangle that could be a clue's region: on the grid, covering the
// clue, holding no second clue, at most 9 cells (digits 1-9 cannot repeat in
// it), and of a size its printed total can be made from.
const candidateRects = ({ cell, total }) => {
  const { row, col } = parseCellId(cell);
  const rects = [];
  for (let height = 1; height <= 9; height++) {
    for (let width = 1; height * width <= 9; width++) {
      if (!sizeCanTotal(height * width, total)) continue;
      for (let top = Math.max(1, row - height + 1); top <= row; top++) {
        for (let left = Math.max(1, col - width + 1); left <= col; left++) {
          const cells = graph.block(makeCellId(top, left), height, width);
          if (cells === null) continue;
          if (cells.filter(c => clueCells.has(c)).length !== 1) continue;
          rects.push({ top, left, height, width, cells });
        }
      }
    }
  }
  return rects;
};

const rects = clues.map(candidateRects);

// Region labels. Each grid cell carries the label of the region covering it, so
// two regions can never claim the same cell: a cell in both would need two
// label values at once. Two clues need distinct labels only when some candidate
// rectangle of one can overlap some candidate rectangle of the other; otherwise
// geometry already keeps them apart and a shared label loses nothing. Greedy
// colouring of that conflict graph (densest clue first) fits inside the grid's
// own 1-9 range, so no widened Shape is needed.
const rectSets = rects.map(rs => rs.map(({ cells }) => new Set(cells)));
const canMeet = (i, j) => rectSets[i].some(
  a => rectSets[j].some(b => [...b].some(cell => a.has(cell))));
const conflicts = clues.map(
  (_, i) => clues.map((_, j) => i !== j && canMeet(i, j)));
const degrees = conflicts.map(row => row.filter(Boolean).length);
const labels = new Array(clues.length);
for (const i of clues.map((_, i) => i).sort((a, b) => degrees[b] - degrees[a])) {
  const used = new Set(conflicts[i].map((meets, j) => meets ? labels[j] : null));
  let label = 1;
  while (used.has(label)) label++;
  labels[i] = label;
}
const numLabels = Math.max(...labels);
if (numLabels > 9) throw new Error(`need ${numLabels} region labels, only 9 fit`);

// Which of a cell's own two walls (right side, bottom side) are region borders,
// packed into one value per cell so that "four regions meet here" can be read
// off the three cells around a grid corner:
//   1 = neither, 2 = right only, 3 = bottom only, 4 = both.
const wallCode = (rightWall, bottomWall) => 1 + (rightWall ? 1 : 0) + (bottomWall ? 2 : 0);
const NO_RIGHT_WALL = [1, 3];
const NO_BOTTOM_WALL = [1, 2];
const NOT_BOTH_WALLS = [1, 2, 3];

const region = graph.makeOverlay('VR');
const walls = graph.makeOverlay('VW');
const areaVar = new Var('A', 'Region size', clues.length);
const areaCell = (i) => areaVar.cell(i + 1);

// Four regions share the grid corner between cells R{r}C{c}, R{r}C{c+1},
// R{r+1}C{c} and R{r+1}C{c+1} exactly when all four cell edges meeting there
// are region borders: the NW cell's right and bottom walls, the NE cell's
// bottom wall, and the SW cell's right wall. (The SE cell adds nothing -- its
// top and left walls are the same two edges.) Forbid that combination.
const range8 = [1, 2, 3, 4, 5, 6, 7, 8];
const wallRow = range8.concat(9).map(row => walls.row(row));
const noFourAtCorner = range8.flatMap(row => range8.map(col => new Or([
  new Given(wallRow[row - 1][col - 1], ...NOT_BOTH_WALLS),
  new Given(wallRow[row - 1][col], ...NO_BOTTOM_WALL),
  new Given(wallRow[row][col - 1], ...NO_RIGHT_WALL),
])));

return [
  new Shape('9x9'),
  region.toVar('Region'),
  walls.toVar('Walls'),
  areaVar,

  // Pick one candidate rectangle per clue. Committing to a rectangle stamps the
  // clue's label on every cell it covers, marks each covered cell's right and
  // bottom walls, records the rectangle's cell count in the clue's area Var,
  // restricts the clue cell's own digit to the range its width/height
  // comparison allows, and keeps the region's digits distinct -- via Cage with
  // a printed total, and (only when the rectangle spans more than one row and
  // column, so rows and columns do not already separate its cells) via
  // AllDifferent without one.
  ...clues.map(({ cell, total }, i) => new Or(
    rects[i].map(({ top, left, height, width, cells }) => new And([
      ...cells.map(c => new Given(region.at(c), labels[i])),
      ...cells.map(c => new Given(walls.at(c), wallCode(
        parseCellId(c).col === left + width - 1,
        parseCellId(c).row === top + height - 1))),
      new Given(areaCell(i), height * width),
      new Given(cell,
        ...(width > height ? [1, 2, 3, 4]
          : width === height ? [5]
            : [6, 7, 8, 9])),
      ...(total !== null ? [new Cage(total, ...cells)]
        : height > 1 && width > 1 ? [new AllDifferent(...cells)] : []),
    ]))
  )),
  // The rectangles are pairwise disjoint by the labels above, so requiring the
  // 19 tracked areas to total 81 is what makes them cover every cell.
  new Sum(81, ...clues.map((_, i) => areaCell(i))),
  ...noFourAtCorner,

  // Green lines. Each drawn stroke is its own Whisper; the strokes that share
  // R8C4 contribute exactly the same adjacent pairs whether or not they are one
  // branching path.
  new Whisper(5, 'R7C4', 'R8C4'),
  new Whisper(5, 'R9C4', 'R8C4'),
  new Whisper(5, 'R4C8', 'R5C9'),
  new Whisper(5, 'R5C3', 'R6C4', 'R7C3'),
  new Whisper(5, 'R8C6', 'R7C5', 'R8C4', 'R9C5'),
  new Whisper(5, 'R7C7', 'R8C7', 'R9C8', 'R9C9', 'R8C9', 'R7C8'),
  new Whisper(5, 'R5C6', 'R5C5'),
];
