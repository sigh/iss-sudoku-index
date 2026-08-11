// Title: July 9, 2022: Pointing Digits
// Author: clover!
// Video: https://www.youtube.com/watch?v=PHOuWUax7J8
// Source: https://tinyurl.com/yckbh4mr

// Normal sudoku rules apply. If a digit N appears in a cell with an arrow,
// the same digit must also appear N steps away in the direction the arrow
// is pointing (diagonally). This is encoded as one Pair per (arrow cell,
// cell k steps away) for every in-range k: a==k -> b==k, a!=k -> no
// constraint. Unlike some similar "echo" puzzles, there is no clause about
// smaller digits along the ray, so no Pair is emitted for a!=k.
//
// "Must also appear N steps away" presupposes that a cell N steps away
// exists: an arrow cell cannot hold a digit whose target would fall off the
// 9x9 board, so each arrow cell's own domain is capped at its distance to
// the board edge along its direction (via a candidate-limiting Given).
//
// Arrow direction decode: each arrow is a rotated left-pointing glyph
// (base orientation = west); the payload's `angle` field rotates a glyph
// clockwise on a y-down canvas (a right-pointing glyph points down at
// angle 90, up at angle 270). Combining west's base bearing with each
// glyph's `angle` gives the four diagonals below, matching the rules
// text's own diagonal example ("the next cell (diagonally)").

const arrows = [
  // [row, col, deltaRow, deltaCol] -- deltaRow/deltaCol from decoded arrow angle
  [2, 3, -1, 1],  // angle 135 -> up-right
  [2, 5, 1, 1],   // angle -135 -> down-right
  [3, 8, 1, 1],   // angle -135 -> down-right
  [4, 4, -1, -1], // angle 45 -> up-left
  [4, 6, 1, -1],  // angle -45 -> down-left
  [5, 3, -1, 1],  // angle 135 -> up-right
  [5, 7, 1, -1],  // angle -45 -> down-left
  [6, 4, -1, 1],  // angle 135 -> up-right
  [6, 6, 1, 1],   // angle -135 -> down-right
  [7, 2, -1, -1], // angle 45 -> up-left
  [8, 5, -1, -1], // angle 45 -> up-left
  [8, 7, 1, -1],  // angle -45 -> down-left
];

function pointRelation(k) {
  return (a, b) => (a === k ? b === k : true);
}

function inRange(v) {
  return v >= 1 && v <= 9;
}

function arrowConstraints([row, col, dr, dc]) {
  const arrowCell = makeCellId(row, col);
  let maxK = 0;
  const pairs = [];
  for (let k = 1; k <= 9; k++) {
    const r = row + k * dr;
    const c = col + k * dc;
    if (!inRange(r) || !inRange(c)) break;
    maxK = k;
    const targetCell = makeCellId(r, c);
    pairs.push(new Pair(
      Pair.fnToKey(pointRelation(k), 9),
      `Point${k}`,
      arrowCell, targetCell,
    ));
  }
  const domainConstraints = maxK < 9
    ? [new Given(arrowCell, ...Array.from({ length: maxK }, (_, i) => i + 1))]
    : [];
  return [...pairs, ...domainConstraints];
}

return [
  new Shape('9x9'),
  new Given('R1C5', 5),
  new Given('R3C3', 6),
  new Given('R3C7', 3),
  new Given('R4C5', 7),
  new Given('R5C1', 9),
  new Given('R5C4', 6),
  new Given('R5C6', 8),
  new Given('R5C9', 7),
  new Given('R6C5', 9),
  new Given('R7C3', 7),
  new Given('R7C7', 8),
  new Given('R9C5', 3),
  ...arrows.flatMap(arrowConstraints),
];
