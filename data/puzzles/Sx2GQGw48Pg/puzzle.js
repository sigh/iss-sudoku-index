// Title: Frak
// Author: zetamath
// Video: https://www.youtube.com/watch?v=Sx2GQGw48Pg
// Source: https://app.crackingthecryptic.com/sudoku/8DfMHmLpqP

// Rules encoded here:
//   - Standard sudoku: 1-9 once per row and column. There are no printed
//     boxes; instead nine orthogonally-connected 9-cell regions, discovered
//     by the solver, each also hold 1-9 once (ChaosConstruction, NoBoxes).
//   - Region sum line: along each blue line, every maximal run of
//     consecutive cells sharing a region has the same sum N (N not
//     printed), with a fresh run started every time the line crosses into
//     a different region -- including a later return to a region already
//     visited. Every line must cross into at least two regions: a line
//     that never changes region is rejected outright, not "trivially
//     satisfied".
//   - Circles on the lines would show a segment's cell count when printed
//     with a digit, but all six drawn circles here are blank -- "not all
//     circles are necessarily given" applies to every circle in this
//     puzzle, so none of them constrain anything and none are encoded.
//
// One of the six drawn blue lines is a closed 28-cell loop around the
// border (LINE_A below, listed for completeness but not used in any
// constraint). ISS's RegionSumLine explicitly refuses ChaosConstruction
// (sudoku_builder.js), and even a hand-rolled construction over the CC
// region-label overlay needs the run that straddles the loop's
// wrap-around merged with whichever run it actually continues -- which
// region that is is only known once the (solver-discovered) partition is
// fixed, so no sound wrap-around merge is available without a new
// primitive. That line's region-sum rule is the one omission in this
// encoding; nothing else about it (or about any other line) is left out.
//
// The other five (open) lines are each rebuilt from the CC region-label
// overlay. The common sum N is not printed anywhere, so it is unknown; N
// per line is `Or` over one small fixed-N state machine per plausible N,
// rather than folding N into a single state machine (which blows the
// compiled-state cap). Per line, the
// candidate range for N is bounded structurally, not fitted to any
// solution: segments partition the line and at least two are required, so
// the longest a single segment can be is (line length - 1) cells, capped
// at the 9-cell region size; N is then at most the sum of that many
// distinct digits counting down from 9, and at least 1 (a single-cell
// segment).

function regionSumFixedNSpec(cellCount, N) {
  // Reads (region label, digit) pairs down the line in order. `tot` is the
  // running sum of the current same-region run; a run closes (and must
  // equal N) whenever the label changes. `crossed` latches true the first
  // time the label actually changes, encoding "every line must enter at
  // least two regions" -- without it a line that stayed in one region
  // would vacuously accept.
  return {
    startState: { p: 'label', prev: 0, tot: 0, crossed: false },
    transition(state, value) {
      if (state.p === 'label') {
        if (state.prev === value) {
          // Same region: the run continues, so it must have room left.
          if (state.tot >= N) return undefined;
          return { p: 'digit', lbl: value, tot: state.tot, crossed: state.crossed };
        }
        // New region: the run that just ended (if any) must have hit N.
        if (state.tot !== 0 && state.tot !== N) return undefined;
        const crossed = state.crossed || state.prev !== 0;
        return { p: 'digit', lbl: value, tot: 0, crossed };
      }
      const tot = state.tot + value;
      if (tot > N) return undefined;
      return { p: 'label', prev: state.lbl, tot, crossed: state.crossed };
    },
    accept: (state) => state.p === 'label' && state.tot === N && state.crossed,
    maxDepth: cellCount * 2,
  };
}

// Largest N a line of this length could plausibly need: the longest single
// segment is (length - 1) cells (at least one other cell must be a
// different region), capped at region size 9, summed from digit 9 down.
function maxCandidateN(lineLength) {
  const maxSegLen = Math.min(9, lineLength - 1);
  let n = 0;
  for (let d = 9; d > 9 - maxSegLen; d--) n += d;
  return n;
}

function regionSumLine(name, cells, cc) {
  const maxN = maxCandidateN(cells.length);
  const seq = cells.flatMap(cell => [cc.at(cell), cell]);
  const branches = [];
  for (let n = 1; n <= maxN; n++) {
    const encoded = NFA.encodeSpec(regionSumFixedNSpec(cells.length, n), 9);
    branches.push(new NFA(encoded, `${name}_N${n}`, ...seq));
  }
  return new Or(branches);
}

// LINE_A: closed 28-cell border loop -- omitted, see the header comment.
const LINE_A = [
  'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C2',
  'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C9', 'R3C9',
  'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C8', 'R9C7', 'R9C6',
  'R9C5', 'R9C4', 'R9C3', 'R9C2',
];

const LINE_B = [
  'R8C4', 'R8C3', 'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2',
  'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C8',
  'R4C8',
];

const LINE_C = ['R5C8', 'R6C8', 'R7C8'];

const LINE_D = [
  'R3C3', 'R3C4', 'R4C4', 'R5C4', 'R6C3', 'R6C4', 'R7C5', 'R6C5', 'R5C5',
];

const LINE_E = ['R7C4', 'R8C5'];

const LINE_F = ['R5C7', 'R6C7', 'R7C7', 'R7C6'];

const cc = cellGraph('9x9').makeOverlay('CC');

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),

  new Given('R1C1', 1),
  new Given('R1C9', 2),
  new Given('R5C5', 4),
  new Given('R9C1', 3),
  new Given('R9C9', 6),

  regionSumLine('LineB', LINE_B, cc),
  regionSumLine('LineC', LINE_C, cc),
  regionSumLine('LineD', LINE_D, cc),
  regionSumLine('LineE', LINE_E, cc),
  regionSumLine('LineF', LINE_F, cc),
];
