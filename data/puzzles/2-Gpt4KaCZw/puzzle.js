// Title: Region Sum Cages
// Author: Abed Hawila
// Video: https://www.youtube.com/watch?v=2-Gpt4KaCZw
// Source: https://app.crackingthecryptic.com/sudoku/FB378fm267

// Normal sudoku rules apply on a plain 9x9 grid (default row/col/box groups).
//
// Every cell is shaded grey (a wall) or green (the cave); the shading is not
// given anywhere and is entirely a solver discovery. Two shading rules are
// encoded:
//   - "all other (green) cells form an orthogonally connected area (the
//     cave)" -> the green cells are one ConnectedValues region.
//   - "Grey cells may not form 2x2 blocks" -> every 2x2 window contains at
//     least one green cell.
// "A cell with a clue must be part of the cave" -> each of the 14 clue cells'
// shade is given as green.
//
// OMITTED: "all grey cells (the walls) are orthogonally connected to the
// edge" allows several separate wall components (the rules go on to speak of
// "each wall (ie group of connected grey squares)" in the plural), each of
// which must independently reach the border. ISS's ConnectedValues only
// asserts a single region per value, so it cannot express border-reachability
// for an unbounded number of components.
//
// OMITTED: "grey walls act as Region Sum lines: each wall (ie group of
// connected grey squares) must visit at least two boxes and the sum of the
// digits in each box must be equal." The walls are an unanchored (no clue
// pins which cells are which wall) and unbounded (no cap on wall count)
// partition of the grey cells, each needing its own per-box-visited equal-sum
// predicate, which has no known ISS encoding.
//
// The visibility-sum clues ARE encoded in full:
//   - "A number in the top left corner of a cell indicates the sum of the
//     digits that are seen from this cell looking to the north, south, east,
//     and west. The cell with the clue counts once in this sum. Walls
//     obstruct the view." For each clue, one NFA scans outward in all four
//     directions over an interleaved [shade, digit, shade, digit, ...]
//     sequence per direction (multi-segment, one segment per direction plus
//     one for the clue's own cell), carrying a running "still visible" flag
//     and a clamped running sum; the automaton accepts only when the final
//     sum matches the clue. Three clues ("<15", ">30", ">35" in the source)
//     are drawn as inequalities rather than exact totals, so their NFAs use
//     "<"/">" accept conditions instead of "=".
//   - Three of the fourteen clue texts are literally the inequality strings
//     "<15", ">30", ">35" (all in column 1); the rules prose never explains
//     the "<"/">" prefix, but no other reading of that drawn text is
//     available, so it is taken at face value as a bound on the same
//     visibility sum rather than an exact total.
//
// OMITTED: "Within the field of vision of a clue, digits may not repeat."
// Digits seen to the north/south share the clue's column, and digits seen to
// the east/west share its row, so within either half the rule is already
// forced by ordinary sudoku column/row all-different. The only residual case
// is a digit seen vertically equalling a digit seen horizontally (excluding
// the shared clue cell) -- a much narrower, genuinely extra constraint that
// is not encoded here.

const GREEN = 1;
const GREY = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either green or grey.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], GREEN, GREY));

// No 2x2 block of shade cells may be all-grey: replicate one "green is
// present in this 2x2" Quad to every block origin.
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noGreyBlock = shade.makeReplicate(
  new Quad(shade.at(gridCells[0]), GREEN),
  shade.at(blockOrigins));

// The cave (green cells) is a single orthogonally connected region.
const caveConnected = new ConnectedValues('VS', GREEN);

// Visibility-sum clues: cell, comparator ('eq'/'lt'/'gt'), target value.
// Cell ids and clue text transcribed from the drawn corner-text badges, one
// per clue cell.
const CLUES = [
  { cell: 'R3C1', cmp: 'lt', value: 15 },
  { cell: 'R7C1', cmp: 'gt', value: 30 },
  { cell: 'R9C1', cmp: 'gt', value: 35 },
  { cell: 'R9C9', cmp: 'eq', value: 20 },
  { cell: 'R7C9', cmp: 'eq', value: 11 },
  { cell: 'R7C7', cmp: 'eq', value: 26 },
  { cell: 'R5C6', cmp: 'eq', value: 36 },
  { cell: 'R5C4', cmp: 'eq', value: 34 },
  { cell: 'R5C2', cmp: 'eq', value: 33 },
  { cell: 'R6C3', cmp: 'eq', value: 10 },
  { cell: 'R4C3', cmp: 'eq', value: 9 },
  { cell: 'R2C3', cmp: 'eq', value: 26 },
  { cell: 'R3C8', cmp: 'eq', value: 32 },
  { cell: 'R4C7', cmp: 'eq', value: 27 },
];

// Every clue cell must be part of the cave (green).
const clueInCave = CLUES.map(c => new Given(shade.at(c.cell), GREEN));

// Clamp the running sum where further growth can no longer change the
// accept verdict: one past the exact target, or at the inequality bound
// itself (which becomes a single "at least/at most here" sink state).
function capFor(cmp, value) {
  if (cmp === 'eq') return value + 1;
  if (cmp === 'lt') return value;
  return value + 1; // 'gt'
}

function acceptFnFor(cmp, value) {
  if (cmp === 'eq') return sum => sum === value;
  if (cmp === 'lt') return sum => sum < value;
  return sum => sum > value; // 'gt'
}

// One interleaved-segment scan per direction: [shade_1, digit_1, shade_2,
// digit_2, ...] nearest cell first, skipping directions with no cells (a
// clue on the grid edge). ray() includes the origin cell, so slice(1) drops
// it -- the clue's own cell is handled as its own one-pair segment below.
function directionSegments(cell) {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // N, S, W, E
  return dirs
    .map(([dr, dc]) => graph.ray(cell, dr, dc).slice(1))
    .filter(cells => cells.length > 0)
    .map(cells => cells.flatMap(c => [shade.at(c), c]));
}

// The automaton reads a [shade, digit] pair at a time. Reading a shade value
// narrows "still visible" (open) to false forever once a grey cell is hit;
// reading a digit adds it to the running sum only while still open. A
// SEGMENT_BREAK (between the clue's own segment and each direction, and
// between directions) resets "open" to true -- each direction is judged
// independently from the clue cell -- but the sum keeps accumulating across
// the whole clue. `accept` runs once, on the final state.
function visibilityConstraint(clue) {
  const cap = capFor(clue.cmp, clue.value);
  const accept = acceptFnFor(clue.cmp, clue.value);
  const spec = NFA.encodeSpec({
    startState: { open: true, sum: 0, phase: 'shade' },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        return { open: true, sum: state.sum, phase: 'shade' };
      }
      if (state.phase === 'shade') {
        return {
          open: state.open && value === GREEN,
          sum: state.sum,
          phase: 'digit',
        };
      }
      const sum = state.open ? Math.min(state.sum + value, cap) : state.sum;
      return { open: state.open, sum, phase: 'shade' };
    },
    accept: state => accept(state.sum),
  }, geometry.numValues, { multiSegment: true });

  const ownSegment = [shade.at(clue.cell), clue.cell];
  return new NFA(spec, `sight-${clue.cell}`,
    ownSegment, ...directionSegments(clue.cell));
}

const visibilityClues = CLUES.map(visibilityConstraint);

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  noGreyBlock,
  caveConnected,
  ...clueInCave,
  ...visibilityClues,
];
