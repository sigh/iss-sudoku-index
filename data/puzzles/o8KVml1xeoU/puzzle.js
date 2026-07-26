// Title: Domino Flat Mates
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=o8KVml1xeoU
// Source: https://sudokupad.app/12bkbyft2r

// Digits 0-8 (not 1-9) once each in every row, column, and 3x3 box --
// Shape('9x9', '0-8') below.
//
// V/X marks: a drawn "V" between two adjacent cells means they sum to 5; a
// drawn "X" means they sum to 10. "Not all Vs and Xs are necessarily given"
// -- absence of a mark is not a constraint, so only the drawn edges below
// are encoded.
//
// Domino Flat Mates (the title rule): every horizontal domino -- any two
// row-adjacent cells, marked or not -- whose digits sum to 5 must have
// either the two cells directly above it summing to 1, or the two cells
// directly below it summing to 9 (either or both; at a grid edge, only the
// side that exists can satisfy the rule). One NFA per horizontal domino
// enforces this below.
//
// Fog-of-war reveal state ("the grid is partially covered in fog...") is
// solving UI, not a final-grid rule -- omitted. The three-cell "foglight"
// cage (R1C2-R2C2-R3C2) is that same UI's light-source marker, not a clue
// -- omitted.

const shape = new Shape('9x9', '0-8');

// V/X edges, transcribed from the drawn edge-centred marks between the two
// adjacent cells each sits on.
const vPairs = [
  ['R1C1', 'R1C2'], ['R2C2', 'R2C3'], ['R3C1', 'R3C2'], ['R5C2', 'R5C3'],
  ['R7C1', 'R7C2'], ['R9C3', 'R9C4'], ['R7C5', 'R7C6'], ['R1C7', 'R2C7'],
];
const xPairs = [
  ['R3C2', 'R4C2'], ['R8C6', 'R9C6'], ['R1C4', 'R2C4'], ['R2C8', 'R3C8'],
  ['R6C9', 'R7C9'], ['R5C5', 'R6C5'], ['R4C3', 'R4C4'],
];
const vClues = vPairs.map(cells => new V(...cells));
const xClues = xPairs.map(cells => new X(...cells));

// Build one NFA for a single horizontal domino, grouping its cells with
// whichever of the row-above / row-below dominoes exist as 2-cell segments
// (multiSegment; SEGMENT_BREAK separates them), in the fixed order [domino,
// above?, below?]. `targets` holds each segment's required sum in that same
// order (5 for the domino itself, 1 for above, 9 for below). State collapses
// each finished segment straight to a "hit its target" boolean (`hits`)
// rather than carrying the raw sum, which keeps the compiled state count
// small. Accept iff the domino doesn't sum to 5 (hits[0] false), or an
// existing side hit its target.
function dominoFlatMate(domCells, aboveCells, belowCells) {
  const segments = [domCells];
  const targets = [5];
  if (aboveCells) { segments.push(aboveCells); targets.push(1); }
  if (belowCells) { segments.push(belowCells); targets.push(9); }
  const totalCells = segments.reduce((n, s) => n + s.length, 0);

  const spec = NFA.encodeSpec({
    startState: { groupIdx: 0, pending: null, hits: [] },
    transition: ({ groupIdx, pending, hits }, value) => {
      if (value === SEGMENT_BREAK) return { groupIdx: groupIdx + 1, pending: null, hits };
      if (pending === null) return { groupIdx, pending: value, hits };
      const hit = (pending + value) === targets[groupIdx];
      return { groupIdx, pending: null, hits: [...hits, hit] };
    },
    accept: ({ hits }) => !hits[0] || hits.slice(1).some(Boolean),
    // Bounds state growth: without it, the compiled state space would keep
    // growing across repeated SEGMENT_BREAKs instead of stopping once this
    // domino's fixed cell count is consumed.
    maxDepth: totalCells + segments.length - 1,
  }, shape, { multiSegment: true });

  return new NFA(spec, 'domino flat mates', ...segments);
}

const dominoFlatMates = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 8; c++) {
    const domCells = [makeCellId(r, c), makeCellId(r, c + 1)];
    const aboveCells = r > 1
      ? [makeCellId(r - 1, c), makeCellId(r - 1, c + 1)] : null;
    const belowCells = r < 9
      ? [makeCellId(r + 1, c), makeCellId(r + 1, c + 1)] : null;
    dominoFlatMates.push(dominoFlatMate(domCells, aboveCells, belowCells));
  }
}

return [
  shape,
  ...vClues,
  ...xClues,
  ...dominoFlatMates,
];
