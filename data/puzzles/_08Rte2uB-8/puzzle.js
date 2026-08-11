// Title: Windmills of Your Mind
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=_08Rte2uB-8
// Source: https://app.crackingthecryptic.com/sudoku/mbMtqhDD3t

// Normal sudoku rules apply (default Shape('9x9') row/column/box
// all-different). Two neighbouring digits along the grey line must differ
// by at least 4: Whisper(4, ...).
//
// The line is drawn as 4 stroke entries (row,col waypoints, 0-indexed, .5 at
// cell centres): a long spiral arm (entry 0) and 3 short connectors (entries
// 1-3) that close the shape through the centre box. Entry 0 alone revisits
// the centre box on 4 separate passes, so no single ordered cell list can
// walk every drawn segment exactly once without a branch. The rule is about
// which digits are drawn as neighbours, not about a walk order, so each
// entry's waypoints are interpolated into unit grid steps and every
// resulting cell-to-cell edge gets its own Whisper(4, a, b); order and
// direction don't matter since the constraint is symmetric. This also
// sidesteps needing to pick one of several possible single-path readings of
// the branch points in the centre box.

// Waypoints copied verbatim from the drawn line entries, one row per entry,
// in drawing order.
const WINDMILL_WAYPOINT_LINES = [
  [[4.5, 4.5], [0.5, 4.5], [0.5, 0.5], [3.5, 3.5], [3.5, 5.5], [0.5, 8.5],
   [4.5, 8.5], [4.5, 5.5], [5.5, 5.5], [8.5, 8.5], [8.5, 4.5], [5.5, 4.5],
   [5.5, 3.5], [8.5, 0.5], [4.5, 0.5], [4.5, 3.5], [3.5, 3.5]],
  [[3.5, 5.5], [4.5, 5.5]],
  [[4.5, 3.5], [5.5, 3.5]],
  [[5.5, 4.5], [5.5, 5.5]],
];

function cellIdAt(row, col) {
  // makeCellId is 1-indexed; wayPoints are 0-indexed cell centres.
  return makeCellId(Math.floor(row) + 1, Math.floor(col) + 1);
}

// Every drawn hop between two consecutive waypoints is horizontal, vertical,
// or diagonal; step it cell by cell to recover the cells it actually covers.
function stepCells([r0, c0], [r1, c1]) {
  const steps = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
  const dr = (r1 - r0) / steps;
  const dc = (c1 - c0) / steps;
  const cells = [];
  for (let i = 0; i <= steps; i++) cells.push(cellIdAt(r0 + dr * i, c0 + dc * i));
  return cells;
}

// Union the edges from all 4 entries; dedupe (none turned out to overlap,
// but a shared edge would just be redundant, not wrong).
const windmillEdges = new Map();
for (const wayPoints of WINDMILL_WAYPOINT_LINES) {
  for (let i = 0; i + 1 < wayPoints.length; i++) {
    const cells = stepCells(wayPoints[i], wayPoints[i + 1]);
    for (let j = 0; j + 1 < cells.length; j++) {
      const [a, b] = [cells[j], cells[j + 1]];
      const key = a < b ? `${a}|${b}` : `${b}|${a}`;
      windmillEdges.set(key, [a, b]);
    }
  }
}

const windmillWhispers = [...windmillEdges.values()].map(
  ([a, b]) => new Whisper(4, a, b));

return [
  new Shape('9x9'),
  new Given('R7C1', 2),
  new Given('R7C4', 1),
  ...windmillWhispers,
];
