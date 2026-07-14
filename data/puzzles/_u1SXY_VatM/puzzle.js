// Title: Vicissitudes
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=_u1SXY_VatM
// Source: https://sudokupad.app/b3wa450x40
//
// Normal sudoku rules apply (standard boxes, no givens).
//
// Yin-Yang shading: shade some cells so that all shaded cells are orthogonally
// connected and all unshaded cells are orthogonally connected. No 2x2 area may
// be completely shaded or unshaded. This script encodes a shade Var per cell
// (restricted to 2 states), "no monochrome 2x2", and global single-component
// connectivity for each colour via one ConnectedValues per shade over the
// whole-grid shade overlay.
//
// Line + shading interaction: there is one closed loop (55 of the 81 cells).
// Walking the loop, every maximal run of consecutively-visited cells that
// share the same shade is a "segment". All segments must have equal sums, and
// digits may not repeat within a segment. Segment boundaries are therefore
// determined dynamically by where the shade changes along the loop, and the
// loop is cyclic (there is no fixed start/end).
//
// "Digits may not repeat within a segment" IS encoded below, via one small
// NFA per digit scanning the loop's interleaved (shade, digit) sequence
// twice around (a double lap): a single lap can't validate the segment that
// straddles the arbitrary scan start point, because its true extent may wrap
// around through the end of the loop, not yet read on lap one. A second lap
// re-visits that same segment with the correct history already carried in
// the NFA state, so every repeat check is grounded in the real cyclic
// adjacency by the time it matters.
//
// "All segments have equal sums" is NOT encoded. A faithful version needs an
// NFA state carrying the running in-segment sum (0..45) together with the
// not-yet-known common target sum (also 0..45, discovered from the first
// real segment), which is an inherently quadratic ~45*45 reachable-state
// core (verified by attempting it: it compiles to well over the engine's
// fixed 4096-state NFA cap, `1 << 12` in js/nfa_builder.js, even after
// tightening every other state field to its minimum). Capping the sum
// range tighter to fit would tighten the rule itself (silently forbidding
// segments above the cap), which is not a faithful encoding even if it
// happens to accept the known solution.

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const shadeAt = cell => shade.at(cell);

// No monochrome 2x2: for every 2x2 block of shade cells, not all four equal.
const notAllSameSpec = NFA.encodeSpec({
  startState: null,
  transition: (state, value) => {
    if (state === null) return [{ first: value, differs: false }];
    return [{ first: state.first, differs: state.differs || value !== state.first }];
  },
  accept: (state) => state !== null && state.differs,
}, 2);

// All 64 blocks are the same NFA applied to a uniform (dRow, dCol) shift of
// one template block, so Replicate stamps the template instead of hand-
// rolling each shifted copy.
const blockTemplate = [
  new NFA(notAllSameSpec, '2x2 block',
    shadeAt('R1C1'), shadeAt('R1C2'), shadeAt('R2C1'), shadeAt('R2C2')),
];

// The closed loop, in path order (55 cells).
const loopCells = [
  'R6C5', 'R6C6', 'R7C6', 'R8C6', 'R9C6', 'R9C7', 'R9C8', 'R9C9', 'R8C9',
  'R7C8', 'R6C7', 'R5C8', 'R5C9', 'R4C9', 'R3C8', 'R3C9', 'R2C8', 'R1C7',
  'R1C6', 'R2C5', 'R1C4', 'R1C3', 'R2C2', 'R3C1', 'R3C2', 'R2C3', 'R2C4',
  'R3C5', 'R3C6', 'R4C6', 'R5C6', 'R5C5', 'R6C4', 'R5C4', 'R4C5', 'R3C4',
  'R3C3', 'R4C3', 'R5C3', 'R5C2', 'R4C1', 'R5C1', 'R6C2', 'R6C3', 'R7C3',
  'R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R8C2', 'R8C3', 'R9C3', 'R8C4',
  'R7C4',
];

// Interleave shade and digit reads: [shade1, digit1, shade2, digit2, ...],
// twice around, plus a trailing re-read of the first cell's shade to force a
// final closure once we're safely past the bootstrap.
const lap = loopCells.flatMap(cell => [shadeAt(cell), cell]);
const scanCells = [...lap, ...lap];

// Every cell is either shaded (2) or unshaded (1): one Given template
// stamped over every grid cell via the shade overlay.
function shadeDomainConstraints() {
  const targets = Array.from(graph.cells()).map(shadeAt);
  return [shade.makeReplicate([new Given(targets[0], 1, 2)], targets)];
}

return [
  new Shape('9x9'),
  shade.toVar('yin-yang shading'),
  ...shadeDomainConstraints(),
  // Global Yin-Yang connectivity: each shade forms one orthogonally-connected
  // region over the whole-grid shade overlay.
  new ConnectedValues('VS', 1),
  new ConnectedValues('VS', 2),
  shade.makeReplicate(
    blockTemplate,
    Array.from({ length: 8 }, (_, r) =>
      Array.from({ length: 8 }, (_, c) =>
        shadeAt(makeCellId(r + 1, c + 1))
      )
    ).flat(),
  ),
  // No digit repeats within a segment: one small NFA per digit value.
  ...Array.from({ length: 9 }, (_, d) => {
    const repeatSpec = NFA.encodeSpec({
      startState: { seenD: false, prevShade: null, awaitingDigit: false },
      transition: (state, value) => {
        const { seenD, prevShade, awaitingDigit } = state;
        if (!awaitingDigit) {
          // Shade read; the shade Var only ever holds 1 or 2.
          const s = value;
          if (s !== 1 && s !== 2) return [];
          const broke = prevShade !== null && s !== prevShade;
          return [{ seenD: broke ? false : seenD, prevShade: s, awaitingDigit: true }];
        }
        const digit = value;
        if (digit === d + 1) {
          if (seenD) return [];
          return [{ seenD: true, prevShade, awaitingDigit: false }];
        }
        return [{ seenD, prevShade, awaitingDigit: false }];
      },
      accept: () => true,
    }, 9);
    return new NFA(repeatSpec, `no repeat ${d + 1}`, ...scanCells);
  }),
];
