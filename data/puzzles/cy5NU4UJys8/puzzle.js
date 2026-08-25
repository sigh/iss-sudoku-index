// Title: Product Arrow Sudoku
// Author: Dejan Razsadov
// Video: https://www.youtube.com/watch?v=cy5NU4UJys8
// Source: https://app.crackingthecryptic.com/BgfbhQPRPf

// Normal sudoku rules apply (rows/cols/boxes all-different, the Shape('9x9')
// default). Six arrows: the digit(s) held in a marker -- a single circle, or
// a rounded "pill" spanning 2 or 3 grid cells -- equal the product of the
// digits along that marker's arm, read left to right as one number (matching
// the reading direction ISS's own PillArrow documents for its sum arrows:
// "read from left to right, top to bottom"). No dedicated ISS class
// multiplies an arm into a multi-digit marker, so each arrow below is a
// hand-written NFA: it scans the arm cells (segment 1) into a running
// product, then scans the marker cells left-to-right (segment 2) subtracting
// each cell's place value from that product, and accepts only when the
// running remainder reaches exactly zero right after the last marker cell.
// `cap` bounds compiled states and rejects (in `transition`, not deferred to
// `accept`) any arm product too large to be spelled by the marker's digit
// count.
function productArrow(armCells, markerCells) {
  const weights = markerCells.map((_, i) => 10 ** (markerCells.length - 1 - i));
  const cap = Math.min(9 ** armCells.length, 10 ** markerCells.length - 1);
  const spec = NFA.encodeSpec({
    startState: { phase: 'arm', prod: 1, idx: 0, remainder: 0 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        return { phase: 'marker', prod: 0, idx: 0, remainder: state.prod };
      }
      if (state.phase === 'arm') {
        const prod = state.prod * value;
        if (prod > cap) return undefined;
        return { phase: 'arm', prod, idx: 0, remainder: 0 };
      }
      const remainder = state.remainder - value * weights[state.idx];
      if (remainder < 0) return undefined;
      return { phase: 'marker', prod: 0, idx: state.idx + 1, remainder };
    },
    accept: (state) =>
      state.phase === 'marker' &&
      state.idx === weights.length &&
      state.remainder === 0,
    maxDepth: armCells.length + markerCells.length + 1,
  }, 9, { multiSegment: true });
  return new NFA(spec, `product-arrow ${markerCells.join(',')}`, armCells, markerCells);
}

// Marker/arm cells transcribed from the drawn arrow waypoints and their
// matching rounded-rect/circle markers.
const arrows = [
  { marker: ['R1C9'], arm: ['R2C9', 'R3C8', 'R4C7', 'R5C6', 'R6C5'] },
  { marker: ['R6C3', 'R6C4'], arm: ['R5C5', 'R4C5'] },
  { marker: ['R4C2', 'R4C3'], arm: ['R3C4', 'R2C5', 'R1C4'] },
  { marker: ['R6C7', 'R6C8'], arm: ['R5C8', 'R5C7'] },
  { marker: ['R8C6', 'R8C7', 'R8C8'], arm: ['R7C8', 'R6C9', 'R5C9', 'R4C9'] },
  { marker: ['R9C2', 'R9C3'], arm: ['R8C1', 'R7C1'] },
];

return [
  new Shape('9x9'),

  // Givens transcribed from the payload's cells[][].value grid.
  new Given('R1C5', 2),
  new Given('R2C3', 4),
  new Given('R2C7', 5),
  new Given('R3C3', 1),
  new Given('R4C6', 7),
  new Given('R4C8', 6),
  new Given('R5C2', 3),
  new Given('R5C4', 8),
  new Given('R6C1', 7),
  new Given('R7C3', 3),
  new Given('R8C3', 6),
  new Given('R8C5', 4),
  new Given('R8C9', 8),
  new Given('R9C4', 3),
  new Given('R9C7', 9),

  ...arrows.map(({ arm, marker }) => productArrow(arm, marker)),
];
