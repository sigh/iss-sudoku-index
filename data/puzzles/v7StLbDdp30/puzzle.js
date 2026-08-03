// Title: Blue Arrow
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=v7StLbDdp30
// Source: https://sudokupad.app/qz9m4zn7nf

// Rules encoded here, in full:
//   - Chaos construction: nine orthogonally connected 9-cell regions replace the
//     boxes; 1-9 once per row, column and region.
//   - Jumping arrow: R1C1-R1C3 form a pill; the other 78 cells all lie on the
//     arrow, and their digits sum to the three-digit number the pill reads.
//   - Region sum line: along the arrow, every maximal run of cells sharing a
//     region has the same sum.
//   - Inequalities: the sign points at the smaller digit.
// Nothing is omitted.

// The arrow, in visit order, tail (against the pill) to head (R9C1). Transcribed
// from the cyan stroke waypoints: cell centres in order along each stroke, plus
// the centres each straight run passes through, with the strokes joined at their
// shared coordinates. Three points carry more than two stroke ends; at each one
// the incident directions pair up into exactly collinear straight-throughs, so
// the crossing pairing is forced by the drawing:
//   (2, 3)       R3C4-R2C3 crosses R2C4-R3C3
//   (2, 1.5)     R3C3-R2C1, R3C2-R2C2 and R3C1-R2C3
//   (6.25, 1.75) the hop R7C3..R7C1 crosses the diagonal R6C3-R7C2
// The last of those makes the arrow run R7C1 -> R7C3 -> R8C1, which is the
// traversal the rules text spells out as its worked example. The result is a
// single path covering each of the 78 non-pill cells exactly once.
const ARROW = [
  'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
  'R2C9', 'R3C9', 'R4C8', 'R4C9', 'R5C9', 'R6C9',
  'R5C8', 'R5C7', 'R6C8', 'R7C9', 'R8C9', 'R9C9',
  'R7C8', 'R6C7', 'R6C6', 'R7C6', 'R7C7', 'R8C7',
  'R9C7', 'R9C8', 'R8C8', 'R8C6', 'R9C6', 'R9C5',
  'R7C5', 'R6C5', 'R5C3', 'R5C2', 'R6C4', 'R8C3',
  'R9C2', 'R9C4', 'R8C5', 'R7C4', 'R6C3', 'R7C2',
  'R6C1', 'R4C1', 'R4C3', 'R4C4', 'R4C5', 'R3C5',
  'R2C4', 'R3C3', 'R2C1', 'R2C2', 'R3C2', 'R3C1',
  'R2C3', 'R3C4', 'R2C5', 'R3C6', 'R2C6', 'R2C8',
  'R3C8', 'R2C7', 'R3C7', 'R4C7', 'R4C6', 'R5C6',
  'R5C5', 'R5C4', 'R4C2', 'R5C1', 'R6C2', 'R7C1',
  'R7C3', 'R8C1', 'R9C3', 'R8C4', 'R8C2', 'R9C1',
];

// The five drawn chevrons, each straddling one shared edge, listed larger cell
// first (the chevron's point sits in the smaller cell).
const INEQUALITIES = [
  ['R1C8', 'R1C9'],
  ['R2C7', 'R3C7'],
  ['R9C7', 'R9C8'],
  ['R7C5', 'R6C5'],
  ['R5C5', 'R5C4'],
];

// The common segment sum, fixed at 9 by the rules' own arithmetic:
//   Rows force the whole grid to total 405, so the 78 arrow digits total
//   405 - (R1C1+R1C2+R1C3), and the pill rule sets that equal to
//   100*R1C1 + 10*R1C2 + R1C3.  Solving 101a + 11b + 2c = 405 over digits 1-9
//   gives the pill 387, so the arrow totals 387 = (#segments) * (segment sum).
//   Every region keeps at least 6 arrow cells, so there are at least 9 segments,
//   and at most 78 (one per cell); of 387's divisors only 9 and 43 are in range.
//   With 9 segments each region's arrow cells would form one run, and the six or
//   more regions holding no pill cell would run to 45, not 387/9 = 43.  So there
//   are 43 segments of 9.
const SEGMENT_SUM = 9;

// Region-sum line over regions the solver is still choosing.  The machine reads
// the arrow as [region label of cell 1, digit of cell 1, region label of cell 2,
// ...], so it can see where a run breaks.  State: `p` says which of the two it
// expects next; `tot` is the running total of the run so far; `prev`/`lbl` is the
// region label of the previous cell / of the cell whose digit comes next.
const regionSumSpec = {
  startState: { p: 'label', prev: 0, tot: 0 },
  transition(state, value) {
    if (state.p === 'label') {
      if (state.prev === value) {
        // Same region: the run continues, so it must have room left.
        if (state.tot >= SEGMENT_SUM) return undefined;
        return { p: 'digit', lbl: value, tot: state.tot };
      }
      // New region: the run that just ended must have hit the segment sum.
      if (state.tot !== 0 && state.tot !== SEGMENT_SUM) return undefined;
      return { p: 'digit', lbl: value, tot: 0 };
    }
    const tot = state.tot + value;
    if (tot > SEGMENT_SUM) return undefined;
    return { p: 'label', prev: state.lbl, tot };
  },
  accept: (state) => state.p === 'label' && state.tot === SEGMENT_SUM,
};

const cc = cellGraph('9x9').makeOverlay('CC');

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),

  new PillArrow(3, 'R1C1', 'R1C2', 'R1C3', ...ARROW),

  new NFA(
    NFA.encodeSpec(regionSumSpec, 9), 'RegionSumSegments',
    ...ARROW.flatMap(cell => [cc.at(cell), cell])),

  ...INEQUALITIES.map(([big, small]) => new GreaterThan(big, small)),
];
