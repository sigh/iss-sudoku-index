// Title: Killer Construction
// Author: ahaupt
// Video: https://www.youtube.com/watch?v=aUOvCejkJtU
// Source: https://cracking-the-cryptic.web.app/sudoku/njQnT9RpTR

// Rules:
//  - Every row and every column contains each digit 1-9 exactly once.
//  - There are no boxes. Instead the grid splits into nine orthogonally
//    connected regions of nine cells, each holding 1-9 exactly once. The
//    regions are not drawn; the solver must discover them.
//  - A number in the top left of a cell is the sum of the digits that can be
//    seen from that cell looking north, south, east and west. Only cells of
//    the clue cell's own region are seen: a cell belonging to another region
//    blocks the view in that direction (and everything beyond it). The clue
//    cell itself is included in the sum, counted once.
// Nothing is omitted.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

// Clue cell -> the number printed in its top-left corner.
const VIEW_CLUES = [
  ['R1C1', 44], ['R1C8', 43],
  ['R3C4', 25], ['R3C6', 26],
  ['R4C3', 12], ['R4C7', 28],
  ['R6C7', 22],
  ['R7C3', 13], ['R7C5', 5],
  ['R8C1', 40], ['R8C8', 41],
  ['R9C7', 26],
];

const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// One NFA per clue. Each cell contributes two symbols, region label first and
// digit second, so the machine knows whether to add the digit before it reads
// it. Segment 0 is the clue cell itself (it fixes the region to match against
// and seeds the sum); the remaining segments are the four rays, each ordered
// outwards from the clue cell so that the first foreign label in a ray blocks
// everything behind it.
//
// State fields:
//   region  - the clue cell's region label, null before segment 0 is read.
//   sum     - digits accumulated so far, rejected once it passes the clue.
//   blocked - this ray has already met a cell outside the region.
//   include - null while a region label is expected; otherwise whether the
//             digit about to be read is visible and must be added.
function visibleSumNfa(cell, target) {
  const lanes = c => [cc.at(c), c];
  const arms = DIRECTIONS
    .map(([dRow, dCol]) => graph.ray(cell, dRow, dCol).slice(1))
    .filter(arm => arm.length > 0);

  const spec = NFA.encodeSpec({
    startState: { region: null, sum: 0, blocked: false, include: null },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        return { region: state.region, sum: state.sum, blocked: false, include: null };
      }
      if (state.include === null) {
        // Reading a region label.
        if (state.region === null) {
          return { region: value, sum: 0, blocked: false, include: true };
        }
        const inSight = !state.blocked && value === state.region;
        return {
          region: state.region, sum: state.sum,
          blocked: !inSight, include: inSight,
        };
      }
      // Reading a digit.
      const sum = state.include ? state.sum + value : state.sum;
      if (sum > target) return undefined;
      return { region: state.region, sum: sum, blocked: state.blocked, include: null };
    },
    accept: state =>
      state.include === null && state.region !== null && state.sum === target,
  }, 9, { multiSegment: true });

  return new NFA(spec, `view-${cell}`, lanes(cell), ...arms.map(arm => arm.flatMap(lanes)));
}

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),

  new Given('R3C8', 1),

  ...VIEW_CLUES.map(([cell, target]) => visibleSumNfa(cell, target)),
];
