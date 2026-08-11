// Title: Wrench Heads
// Author: Agent
// Video: https://www.youtube.com/watch?v=wsl6IEiJYUA
// Source: https://app.crackingthecryptic.com/sudoku/MQgGNRPLQB

// Rows/columns are standard. Regions are NOT the default 3x3 boxes: each
// region is an orthogonally-connected 9-cell region whose position the
// solver must discover, so NoBoxes drops the default boxes and
// ChaosConstruction supplies the discovered ones (connectivity, size 9,
// each holding every digit once).
//
// Each arrow's arm digits sum to its circled (bulb) digit, repeats allowed
// (Arrow). Separately, for each arrow, the arm digits split into runs by
// which discovered region each cell lands in (a run is a maximal stretch of
// consecutive arm cells sharing one region); every run along that one arrow
// must total the same N. Since the run boundaries depend on the
// solver-discovered region labels, each arrow's rule is encoded as an Or
// over every possible boundary pattern along its arm (2^(arm length - 1)
// patterns): one branch per pattern, guarding which consecutive arm cells
// share a region label and asserting the resulting runs' sums are equal.
// A pattern with no boundaries (whole arm in one region) needs no sum
// equality, matching "some arrows visit only one region."
//
// "At any intersection between arrows, both arrows continue straight and
// they cannot overlap" is read as decode guidance only: the arrow paths are
// fixed drawn geometry, not solver-discovered, so nothing here is left for
// the solver to determine. The drawn crossings decode to four single shared
// cells on the long diagonal arrow (R4C4, R6C6, R7C7, R8C8), never a shared
// run, consistent with that reading.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

// Arrow arms: [bulb, ...arm], traced from the payload's arrow wayPoints
// (snapped to nearest cell centres) and matched to the ten drawn circle
// underlays (bulb = each arrow's first waypoint cell); R9C1 carries two
// separate arms.
const ARROWS = [
  ['R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['R3C4', 'R4C5', 'R5C4', 'R4C3'],
  ['R5C3', 'R4C4', 'R3C5', 'R4C6'],
  ['R2C9', 'R1C9', 'R2C8', 'R1C7'],
  ['R6C2', 'R7C2', 'R8C3'],
  ['R9C1', 'R8C2', 'R7C1'],
  ['R9C1', 'R8C2', 'R9C3'],
  ['R7C5', 'R6C6', 'R5C7'],
  ['R8C6', 'R7C7', 'R6C8', 'R6C9'],
  ['R9C7', 'R8C8', 'R7C9'],
  ['R7C8', 'R6C7', 'R7C6', 'R8C7'],
];

const sumArrows = ARROWS.map(cells => new Arrow(...cells));

// "Two CC label cells hold the same / a different region" -- one key each,
// reused across every arrow's boundary patterns below.
const sameRegionKey = Pair.fnToKey((a, b) => a === b, 9);
const diffRegionKey = Pair.fnToKey((a, b) => a !== b, 9);

function equalRegionRunSums(arm) {
  const k = arm.length;
  if (k <= 1) return [];
  const labels = cc.at(arm);
  const boundaryCount = k - 1;
  const branches = [];
  for (let mask = 0; mask < (1 << boundaryCount); mask++) {
    const guards = [];
    const runs = [[arm[0]]];
    for (let i = 0; i < boundaryCount; i++) {
      const isBoundary = (mask >> i) & 1;
      guards.push(new Pair(
        isBoundary ? diffRegionKey : sameRegionKey,
        isBoundary ? 'region change' : 'same region',
        labels[i], labels[i + 1]));
      if (isBoundary) {
        runs.push([arm[i + 1]]);
      } else {
        runs[runs.length - 1].push(arm[i + 1]);
      }
    }
    // EqualSum takes >=1 segments and requires every one to share a sum; a
    // single run (no boundary in this pattern) needs no sum constraint.
    const runSumsEqual = runs.length > 1 ? [new EqualSum(...runs)] : [];
    branches.push(new And([...guards, ...runSumsEqual]));
  }
  return [new Or(branches)];
}

const regionRunSums = ARROWS.flatMap(cells => equalRegionRunSums(cells.slice(1)));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...sumArrows,
  ...regionRunSums,
];
