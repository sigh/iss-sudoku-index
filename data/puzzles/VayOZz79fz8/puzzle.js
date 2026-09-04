// Title: Drop Area
// Author: John Bulten
// Video: https://www.youtube.com/watch?v=VayOZz79fz8

// Rules encoded here (US Puzzle Championship 2018, puzzle 11):
//  - Divide the 9x19 grid into 18 "holes" (regions), numbered 1 through 18,
//    each with (180-degree) rotational symmetry, and with area equal to the
//    hole number. 1 + 2 + ... + 18 = 171 = 9 x 19, so the holes tile the grid.
//  - Some cells contain a flag number, which is equal to the number of the
//    hole that contains it. Not all holes contain a flagged cell (4 and 10
//    do not).
//  - A hole is a single orthogonally connected region (the instruction
//    sheet's worked example draws every hole as one connected piece).
// Nothing is omitted.
//
// Board model. Every ISS Shape dimension caps at 16, so the 19-row board is
// not a Shape. It is carried by Var groups declared '19x9' (their declared
// column count, 9, is what the cap checks), whose own 2D adjacency is what
// ConnectedValues uses. A throwaway 1x1 Raw Shape supplies the shared value
// range (15 values, leaving room for the multi-segment NFA break symbol) and
// is pinned so it adds nothing to the search.
//
// Labels. A cell's hole number is its label. One layer holds at most 15
// values, so the label is split over two layers: HL carries holes 1-14
// (15 = "labelled on HH"), HH carries holes 15-18 as 11-14 (15 = "labelled
// on HL"), and one Pair per cell makes exactly one layer carry the label.
// ConnectedValues(layer, label, size) then states connectivity and area
// together, and a flag is a Given on its cell. Holes 11-14 and 15-18 share
// layer values (18 labels do not fit 15 values without sharing), so two
// holes can build the same machine for a shared candidate centre; ISS then
// serialises them as one line with several cell groups, which parse back
// into separate machines.
//
// Symmetry. Each hole's centre of symmetry is a point of the half-integer
// lattice, stored per hole in doubled coordinates: R = 2 x centre row (2..38)
// and C = 2 x centre column (2..18), each split as 15 x (hi - 1) + lo. For
// hole k with centre c the mirror of cell x is 2c - x, and one NFA per
// (hole, candidate centre) checks the mirror rule, vacuously accepting unless
// the hole's centre Vars spell that candidate. Two facts keep the bank
// finite and the check local; both are plain arithmetic on a connected
// k-cell set S that is symmetric about c:
//   (i)  every cell x of S satisfies |x - c| <= (k - 1) / 2 (Manhattan): x and
//        its mirror are both in S, so S holds a path between them of at least
//        |x - mirror(x)| + 1 = 2|x - c| + 1 cells, which is at most k.
//   (ii) hence a flagged hole's centre lies within (k - 1) / 2 of its flag,
//        with the flag's mirror on the board -- the candidate list.
// Each candidate's machine scans only the disc |x - c| <= (k + 1) / 2 and
// needs one hole cell inside it. That suffices: were some hole cell outside
// the disc, the hole (connected) would contain a disc cell y at distance
// > (k - 1) / 2 adjacent to the outside, the machine forces y's mirror into
// the hole too, and by the path bound in (i) the hole would need more than k
// cells. A flagged hole's flag is that inside cell, by (ii); for an unflagged
// hole (4, 10) the machine itself requires a hole cell in the disc. A centre
// that is a cell centre is its own mirror: that cell is never scanned, as
// symmetry says nothing about it. By (i) a hole's cells all lie within
// (k - 1) / 2 of its centre and each has its mirror on the board, so a
// candidate with fewer than k such cells is dropped; hole 1 is a single
// cell, always symmetric, and gets no centre or machine.

const N_ROWS = 19;
const N_COLS = 9;
const NUM_VALUES = 15;
const HOLES = Array.from({ length: 18 }, (_, i) => i + 1);

// Flag numbers, as drawn on the puzzle grid at 6:53 in the video (checked
// against the instruction sheet at 2:45): hole number -> [row, column].
const FLAGS = new Map([
  [13, [1, 2]], [9, [2, 4]], [17, [3, 3]], [14, [4, 2]], [18, [5, 5]],
  [3, [6, 7]], [15, [7, 3]], [8, [8, 6]], [7, [9, 1]], [16, [11, 8]],
  [11, [12, 9]], [5, [14, 6]], [6, [15, 3]], [12, [16, 5]], [2, [17, 7]],
  [1, [19, 2]],
]);

const anchorShape = new Shape('1x1', NUM_VALUES, 'Raw');
const anchorGiven = new Given('R1C1', 1);

// Label layers.
const LO_LIMIT = 14;             // holes 1..14 live on HL as their own number
const HI_SHIFT = LO_LIMIT - 10;  // hole k > LO_LIMIT lives on HH as k - HI_SHIFT (11..14)
const OTHER = 15;                // on either layer: "this cell's hole is on the other layer"
const HL = new Var('HL', 'hole 1-14 (15: see HH)', `${N_ROWS}x${N_COLS}`);
const HH = new Var('HH', 'hole 15-18 as 11-14 (15: see HL)', `${N_ROWS}x${N_COLS}`);
const layerOf = (hole) => (hole <= LO_LIMIT
  ? { group: HL, prefix: 'VHL', value: hole }
  : { group: HH, prefix: 'VHH', value: hole - HI_SHIFT });

const allCells = [];
for (let r = 1; r <= N_ROWS; r++) {
  for (let c = 1; c <= N_COLS; c++) allCells.push([r, c]);
}
const inGrid = (r, c) => r >= 1 && r <= N_ROWS && c >= 1 && c <= N_COLS;

// HH uses only 11..15, so the key also restricts it to that range.
const oneLayerKey = Pair.fnToKey(
  (lo, hi) => hi > 10 && (lo === OTHER) !== (hi === OTHER), anchorShape);
const oneLayerPerCell = allCells.map(([r, c]) =>
  new Pair(oneLayerKey, 'one label per cell', HL.cell(r, c), HH.cell(r, c)));

const flagGivens = [];
for (const [hole, [r, c]] of FLAGS) {
  const { group, value } = layerOf(hole);
  flagGivens.push(new Given(group.cell(r, c), value));
  if (group === HH) flagGivens.push(new Given(HL.cell(r, c), OTHER));
}

const holes = HOLES.map((hole) => {
  const { prefix, value } = layerOf(hole);
  return new ConnectedValues(prefix, value, hole);
});

// Candidate centres of a hole, each with the disc's mirror pairs (x, mirror x,
// interleaved) and the disc cells whose mirror is off the board.
const SYMMETRIC_HOLES = HOLES.filter((hole) => hole >= 2);
const candidateCentres = (hole) => {
  const { group } = layerOf(hole);
  const centres = [];
  for (let R = 2; R <= 2 * N_ROWS; R++) {
    for (let C = 2; C <= 2 * N_COLS; C++) {
      if (FLAGS.has(hole)) {
        const [fr, fc] = FLAGS.get(hole);
        if (!inGrid(R - fr, C - fc)) continue;
        if (Math.abs(2 * fr - R) + Math.abs(2 * fc - C) > hole - 1) continue;
      }
      const pairs = [];
      const singles = [];
      let room = 0;   // cells within (k - 1) / 2 of the centre whose mirror is on the board
      for (const [r, c] of allCells) {
        const dist = Math.abs(2 * r - R) + Math.abs(2 * c - C);   // doubled Manhattan
        if (dist > hole + 1) continue;
        const [mr, mc] = [R - r, C - c];
        if (!inGrid(mr, mc)) singles.push(group.cell(r, c));
        else if (mr > r || (mr === r && mc > c)) pairs.push(group.cell(r, c), group.cell(mr, mc));
        // mr < r: listed with its partner already; mr == r, mc == c: its own mirror.
        if (inGrid(mr, mc) && dist <= hole - 1) room++;
      }
      if (room >= hole) centres.push({ R, C, pairs, singles });
    }
  }
  return centres;
};
const centreLayouts = new Map(SYMMETRIC_HOLES.map((hole) => [hole, candidateCentres(hole)]));

// Centre of symmetry per hole, in doubled coordinates split base 15:
// R = 15 (rHi - 1) + rLo, C = 15 (cHi - 1) + cLo.
const HOLE_LETTER = 'ABCDEFGHIJKLMNOPQR';
const centreVars = new Map(SYMMETRIC_HOLES.map((hole) => [hole, new Var(
  `C${HOLE_LETTER[hole - 1]}`,
  `hole ${hole} centre: doubled row hi, lo; doubled column hi, lo`, 4)]));
const centreCells = (hole) => centreVars.get(hole).cells();
const splitBase15 = (n) => [Math.floor((n - 1) / NUM_VALUES) + 1, ((n - 1) % NUM_VALUES) + 1];

// One NFA per hole: its centre Vars spell one of its candidate centres.
// States: the doubled row after two cells, then the doubled column.
const centreIsCandidate = SYMMETRIC_HOLES.map((hole) => {
  const layouts = centreLayouts.get(hole);
  const valid = new Set(layouts.map(({ R, C }) => R * 100 + C));
  const validRows = new Set(layouts.map(({ R }) => R));
  const spec = NFA.encodeSpec({
    startState: { phase: 0 },
    transition: (state, value) => {
      if (state.phase === 0) return value <= 3 ? { phase: 1, rHi: value } : undefined;
      if (state.phase === 1) {
        const R = NUM_VALUES * (state.rHi - 1) + value;
        return validRows.has(R) ? { phase: 2, R } : undefined;
      }
      if (state.phase === 2) return value <= 2 ? { phase: 3, R: state.R, cHi: value } : undefined;
      if (state.phase === 3) {
        const C = NUM_VALUES * (state.cHi - 1) + value;
        return valid.has(state.R * 100 + C) ? { phase: 4 } : undefined;
      }
      return undefined;
    },
    accept: (state) => state.phase === 4,
  }, anchorShape);
  return new NFA(spec, 'centre is a candidate', ...centreCells(hole));
});

// One NFA per (hole, candidate centre). Segments: the four centre cells; the
// mirror pairs; the off-board-mirror cells (omitted when there are none).
// States: 'idx' with i = centre cells matched so far; 'off' once a centre
// cell differs (accept everything); 'pair' with pend = 0 / 1 (first of the
// pair is the hole) / 2 (is not) and seen = a hole cell has been read;
// 'sing', where a hole cell is rejected.
const symmetry = SYMMETRIC_HOLES.flatMap((hole) => {
  const { value } = layerOf(hole);
  const needSeen = !FLAGS.has(hole);
  return centreLayouts.get(hole).map(({ R, C, pairs, singles }) => {
    const target = [...splitBase15(R), ...splitBase15(C)];
    const spec = NFA.encodeSpec({
      startState: { ph: 'idx', i: 0 },
      transition: (state, v) => {
        if (state.ph === 'off') return state;
        if (state.ph === 'idx') {
          if (v === SEGMENT_BREAK) return state.i === 4 ? { ph: 'pair', pend: 0, seen: 0 } : undefined;
          if (state.i === 4) return undefined;
          return v === target[state.i] ? { ph: 'idx', i: state.i + 1 } : { ph: 'off' };
        }
        const isHole = v === value ? 1 : 0;
        if (state.ph === 'pair') {
          if (v === SEGMENT_BREAK) return state.pend === 0 ? { ph: 'sing', seen: state.seen } : undefined;
          if (state.pend === 0) return { ph: 'pair', pend: isHole ? 1 : 2, seen: state.seen | isHole };
          return (state.pend === 1) === (isHole === 1) ? { ph: 'pair', pend: 0, seen: state.seen } : undefined;
        }
        if (v === SEGMENT_BREAK || isHole) return undefined;
        return state;
      },
      accept: (state) => state.ph === 'off' || ((state.seen === 1 || !needSeen) &&
        ((state.ph === 'pair' && state.pend === 0) || state.ph === 'sing')),
    }, anchorShape, { multiSegment: true });
    const segments = [centreCells(hole), pairs];
    if (singles.length) segments.push(singles);
    return new NFA(spec, 'symmetric about the centre', ...segments);
  });
});

return [
  anchorShape, anchorGiven,
  HL, HH, ...centreVars.values(),
  ...flagGivens,
  ...oneLayerPerCell,
  ...holes,
  ...centreIsCandidate,
  ...symmetry,
];
