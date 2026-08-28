// Title: Nurikabe Killer
// Author: Akash Jain
// Video: https://www.youtube.com/watch?v=epobBolsjag
// Source: https://app.crackingthecryptic.com/sudoku/qPBhLFBjPh

// Rules encoded, in full:
//  - Normal Sudoku.
//  - Every cell is either shaded or unshaded. The unshaded cells form
//    orthogonally connected areas, and two different areas may not share an
//    edge.
//  - The nine cells carrying a number printed in their top-left corner are
//    unshaded, and each area contains exactly one of them (all Nurikabe clues
//    are given).
//  - The digit in such a cell is the number of cells in its area.
//  - The printed number is the sum of the digits of that area, and digits do
//    not repeat within an area. The printed "<8" is a strict upper bound on
//    that area's sum rather than an exact total.
//  - The shaded cells form one orthogonally connected wall with no all-shaded
//    2x2 block.
//  - The inequality drawn on the R4C4/R5C4 border: R4C4 < R5C4.
// Nothing is omitted.

// The areas are not drawn, so a label overlay carries them: one extra cell per
// grid cell, holding 1..9 for "in the area of clue n" (clues numbered in
// reading order) or SHADED. Ten labels need a widened alphabet, so the grid
// cells are restricted back to 1..9.
const SHADED = 10;
const shape = new Shape('9x9', SHADED);
const graph = cellGraph(shape);
const label = graph.makeOverlay('VL');
const gridCells = graph.cells();
const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Transcribed from the nine numbers drawn in cell top-left corners, in reading
// order; each area's label is its 1-based index in this list. `min`/`max`
// bound the area's digit sum: an exact total for a plain number, and 1..7 for
// the "<8" printed at R4C6.
const clues = [
  { cell: 'R1C7', min: 6, max: 6 },
  { cell: 'R2C3', min: 10, max: 10 },
  { cell: 'R3C2', min: 17, max: 17 },
  { cell: 'R3C5', min: 22, max: 22 },
  { cell: 'R3C9', min: 10, max: 10 },
  { cell: 'R4C6', min: 1, max: 7 },
  { cell: 'R7C9', min: 29, max: 29 },
  { cell: 'R8C4', min: 10, max: 10 },
  { cell: 'R9C5', min: 19, max: 19 },
];

const maskDigits = (mask) => digits.filter(d => mask & (1 << d));
const maskSum = (mask) => maskDigits(mask).reduce((a, b) => a + b, 0);

// One machine per clue, holding everything the rules say about that clue's
// area. Its first segment interleaves every cell's label with that cell's
// digit; its second segment is the clue cell's own digit, read again.
//   - `pend` is null when the next symbol is a label, and otherwise records
//     whether the label just read named this area.
//   - `mask` collects the digits of the cells labelled with this area. A digit
//     already in the mask is a repeat within the area, so it is rejected, as
//     is a partial sum that has already passed `max`.
//   - At the segment break the area is complete: the sum is checked, and the
//     state becomes the area's cell count.
//   - The last symbol is the clue cell's digit, which must equal that count.
const areaMachine = (areaLabel, { min, max }) => NFA.encodeSpec({
  startState: { mask: 0, pend: null },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      const sum = maskSum(state.mask);
      if (sum < min || sum > max) return undefined;
      return { size: maskDigits(state.mask).length };
    }
    if (state.size !== undefined) {
      return value === state.size ? { done: true } : undefined;
    }
    if (state.pend === null) {
      return { mask: state.mask, pend: value === areaLabel };
    }
    if (!state.pend) return { mask: state.mask, pend: null };
    // The widened alphabet's tenth value is a label, never a digit.
    if (value === SHADED) return undefined;
    const bit = 1 << value;
    if (state.mask & bit) return undefined;
    const mask = state.mask | bit;
    if (maskSum(mask) > max) return undefined;
    return { mask, pend: null };
  },
  accept: (state) => state.done === true,
}, shape, { multiSegment: true });

const interleaved = gridCells.flatMap(cell => [label.at(cell), cell]);
const areaConstraints = clues.map((clue, i) => new NFA(
  areaMachine(i + 1, clue), `area-${i + 1}`, interleaved, [clue.cell]));

// No 2x2 block of the grid is entirely shaded. The machine reads a block's
// four labels and rejects only when all four are SHADED.
const noShaded2x2 = NFA.encodeSpec({
  startState: 0,
  transition: (shadedSoFar, value) => {
    const count = shadedSoFar + (value === SHADED ? 1 : 0);
    return count === 4 ? undefined : count;
  },
  accept: () => true,
}, shape);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));

// Orthogonally adjacent unshaded cells are always in the same area, which is
// what "areas are separated by shaded cells" says. Applied along every row and
// column of the overlay, which covers each orthogonally adjacent pair once.
const separationKey = Pair.fnToKey(
  (a, b) => a === b || a === SHADED || b === SHADED, shape);

return [
  shape,
  label.toVar('area label'),
  // Grid cells hold digits; only the overlay uses the tenth value.
  graph.makeReplicate(new Given(gridCells[0], ...digits)),

  // Each clue cell is unshaded and names its own area.
  ...clues.map((clue, i) => new Given(label.at(clue.cell), i + 1)),

  ...[...label.rows(), ...label.columns()].map(
    line => new Pair(separationKey, 'area-separation', ...line)),

  // Each area is one orthogonally connected region, and so is the wall.
  ...clues.map((clue, i) => new ConnectedValues('VL', i + 1)),
  new ConnectedValues('VL', SHADED),

  label.makeReplicate(
    new NFA(noShaded2x2, 'no-shaded-2x2',
      ...label.at(graph.block(gridCells[0], 2, 2))),
    label.at(blockOrigins)),

  ...areaConstraints,

  new GreaterThan('R5C4', 'R4C4'),
];
