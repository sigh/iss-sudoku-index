// Title: Quadrants
// Author: Daniel Hanson
// Video: https://www.youtube.com/watch?v=VuY_xH2ILY0
// Source: https://sudokupad.app/1b7rrbig2u

const SIZE = 9;
const graph = cellGraph("9x9");

function cell(r, c) {
  return makeCellId(r, c);
}

function quadrant(r1, r2, c1, c2) {
  const cells = new Set();
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      cells.add(cell(r, c));
    }
  }
  return cells;
}

function allAdjacentEdges(cells) {
  const edges = [];
  for (const a of [...cells].sort()) {
    const { row, col } = parseCellId(a);
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const b = cell(row + dr, col + dc);
      if (cells.has(b)) edges.push([a, b]);
    }
  }
  return edges;
}

function edgeKey(edge) {
  return [...edge].sort().join("-");
}

function absentEdges(cells, marked) {
  const markedKeys = new Set(marked.map(edgeKey));
  return allAdjacentEdges(cells).filter(edge => !markedKeys.has(edgeKey(edge)));
}

function knightEdges(cells) {
  const edges = [];
  for (const a of [...cells].sort()) {
    const { row, col } = parseCellId(a);
    for (const [dr, dc] of [[1, 2], [2, 1], [-1, 2], [2, -1]]) {
      const b = cell(row + dr, col + dc);
      if (cells.has(b)) edges.push([a, b]);
    }
  }
  return edges;
}

function pairwise(name, fn, edges) {
  const key = Pair.fnToKey(fn, SIZE);
  const grouped = new Map();
  for (const [a, b] of edges) {
    const ac = parseCellId(a);
    const bc = parseCellId(b);
    const offset = `${bc.row - ac.row},${bc.col - ac.col}`;
    if (!grouped.has(offset)) grouped.set(offset, []);
    grouped.get(offset).push(a);
  }

  return [...grouped].map(([offset, starts]) => {
    starts.sort();
    const [dr, dc] = offset.split(",").map(Number);
    const origin = starts[0];
    const { row, col } = parseCellId(origin);
    return new Replicate([new Pair(key, name, origin, cell(row + dr, col + dc))],
      Replicate.encodeTargetCells(starts, origin, graph), origin);
  });
}

const nw = quadrant(1, 6, 1, 6);
const ne = quadrant(1, 6, 4, 9);
const sw = quadrant(4, 9, 1, 6);
const se = quadrant(4, 9, 4, 9);

const blackDots = [
  [cell(2, 6), cell(3, 6)],
  [cell(2, 7), cell(3, 7)],
  [cell(5, 9), cell(6, 9)],
  [cell(6, 5), cell(6, 6)],
];

const whiteDots = [
  [cell(4, 4), cell(4, 5)],
  [cell(5, 2), cell(6, 2)],
  [cell(6, 2), cell(6, 3)],
  [cell(7, 4), cell(8, 4)],
  [cell(8, 2), cell(9, 2)],
  [cell(8, 5), cell(8, 6)],
  [cell(9, 1), cell(9, 2)],
  [cell(9, 5), cell(9, 6)],
];

const vMarks = [
  [cell(4, 4), cell(5, 4)],
  [cell(7, 8), cell(7, 9)],
  [cell(9, 7), cell(9, 8)],
];

const xMarks = [
  [cell(4, 8), cell(4, 9)],
  [cell(5, 5), cell(6, 5)],
  [cell(5, 8), cell(5, 9)],
  [cell(6, 7), cell(6, 8)],
  [cell(7, 5), cell(8, 5)],
  [cell(7, 6), cell(7, 7)],
  [cell(8, 6), cell(8, 7)],
];

return [
  ...pairwise("NW knight move", (a, b) => a !== b, knightEdges(nw)),

  ...blackDots.map(edge => new BlackDot(...edge)),
  ...pairwise("NE no absent black dot", (a, b) => a !== 2 * b && b !== 2 * a,
    absentEdges(ne, blackDots)),

  ...whiteDots.map(edge => new WhiteDot(...edge)),
  ...pairwise("SW no absent white dot", (a, b) => Math.abs(a - b) !== 1,
    absentEdges(sw, whiteDots)),

  ...vMarks.map(edge => new V(...edge)),
  ...xMarks.map(edge => new X(...edge)),
  ...pairwise("SE no absent V or X", (a, b) => a + b !== 5 && a + b !== 10,
    absentEdges(se, [...vMarks, ...xMarks])),
];
