// Title: Weighted Cells
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=FO8M8-Zuqbw
// Source: https://sudokupad.app/sqdra9pozn

// Rules encoded:
// - Normal Sudoku: the payload's 9 regions are the default 3x3 boxes, so the
//   solver's automatic row/column/box groups already match -- no Jigsaw needed.
// - Weighted Cells: exactly one lighter cell and one heavier cell per row,
//   column and box. A lighter cell's true value is half its digit; a heavier
//   cell's true value is 1.5x its digit; every other cell's true value is its
//   digit. The 9 lighter cells' digits are all different (so, being 9 digits
//   from a 9-digit alphabet, they cover 1-9 -- "each digit appears once");
//   likewise the 9 heavier cells' digits. A cell cannot be both, which falls
//   out for free below since the flag cell holds one value.
// - Region Sum Lines: equal true-value sum per box segment, for the 5 drawn
//   deepskyblue lines. Values here are the weighted true values above, not
//   raw digits.
// Fog is solving UI (revealed as correct digits go in), not a final-grid
// rule, so it is not encoded. The payload's one cage entry (value: "foglight",
// covering box 1) is that same fog-reveal marker, not a real cage.

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Widened to 0-9 (still under the 16-value cap) so the flag/contribution
// overlays (below) can hold a 0 alongside a 1-9 digit; grid digits are
// pinned back to 1-9 with Given.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// Flag cell per grid cell: 1 = lighter, 2 = normal, 3 = heavier. A cell's
// doubled true value (2x the rule's "value", to stay integer for an odd
// lighter digit) is digit * flag: x1, x2, x3. Equal-sum comparisons under a
// constant x2 scaling are equivalent to the unscaled rule.
//
// digit * flag can't sit in one cell (up to 27, over the 16-value cap), so
// it is split into three same-range (0-9) pieces that sum to it instead:
//   digit*flag = digit + contribA + contribB, where
//   contribA = digit if flag is 2 or 3 (normal or heavier), else 0
//   contribB = digit if flag is 3 (heavier), else 0
// Check: light(1) = digit+0+0; normal(2) = digit+digit+0; heavy(3) =
// digit+digit+digit.
const flagOverlay = graph.makeOverlay('VF');
const flag = cell => flagOverlay.at(cell);
const contribAOverlay = graph.makeOverlay('VA');
const contribA = cell => contribAOverlay.at(cell);
const contribBOverlay = graph.makeOverlay('VB');
const contribB = cell => contribBOverlay.at(cell);

// One cell per row, used only to anchor a 9-cell overlay (row-indexed, not
// tied to any particular column).
const rowAnchors = graph.column(1);
const lightRowDigitOverlay = graph.makeOverlay('VL', rowAnchors);
const heavyRowDigitOverlay = graph.makeOverlay('VH', rowAnchors);
const lightRowDigits = lightRowDigitOverlay.cells();
const heavyRowDigits = heavyRowDigitOverlay.cells();

// digit(d), flag(f) -> contribution(c). One shared 3-symbol machine (digit,
// then flag, then the contribution cell), reused per grid cell and per
// contribution kind.
function contribSpec(minFlag) {
  return NFA.encodeSpec({
    startState: {},
    transition: (state, val) => {
      if (!('d' in state)) return { d: val };
      if (!('f' in state)) return { d: state.d, f: val };
      return { d: state.d, f: state.f, c: val };
    },
    accept: (state) => state.c === (state.f >= minFlag ? state.d : 0),
  }, shape);
}
const contribASpec = contribSpec(2);
const contribBSpec = contribSpec(3);

// Per row: scans that row's 9 (digit, flag) pairs, remembering the digit
// last seen right before a flag cell equal to `target`, then checks the
// appended output cell against it. Exactly-one-per-row (via ContainExact
// below) makes "last remembered" the unique light/heavy digit in that row.
function selectorSpec(target) {
  return NFA.encodeSpec({
    startState: { step: 0, pending: null, found: null },
    transition: ({ step, pending, found }, val) => {
      if (step < 18) {
        if (step % 2 === 0) return { step: step + 1, pending: val, found };
        const newFound = (val === target) ? pending : found;
        return { step: step + 1, pending: null, found: newFound };
      }
      // step === 18: the appended output cell.
      return { step: 19, pending: null, found, out: val };
    },
    accept: (state) => state.step === 19 && state.out === state.found,
  }, shape);
}
const lightSelectorSpec = selectorSpec(1);
const heavySelectorSpec = selectorSpec(3);

// cells -> Sum equalities chaining consecutive box segments to a common
// total. Box membership follows the solver's own box regions, matching how
// a native RegionSumLine would split the same path.
const cellToBox = new Map();
graph.boxes().forEach((box, i) => box.forEach(cell => cellToBox.set(cell, i)));
function boxSegments(cells) {
  const segments = [];
  let curBox = null;
  for (const cell of cells) {
    const box = cellToBox.get(cell);
    if (box !== curBox) { curBox = box; segments.push([]); }
    segments[segments.length - 1].push(cell);
  }
  return segments;
}
// A cell's doubled true value, spread across its three summed pieces (digit +
// contribA + contribB; see the flag/contribution comment above).
function cellValueCells(cell) {
  return [cell, contribA(cell), contribB(cell)];
}
// One EqualSum per line, one segment per box-visit, cells expanded to their
// three summed pieces -- same semantics as a native RegionSumLine, applied to
// the weighted values instead of raw digits.
function equalDoubledSum(cells) {
  return new EqualSum(...boxSegments(cells).map(seg => seg.flatMap(cellValueCells)));
}

// Region Sum Lines, transcribed from the drawn deepskyblue lines (th=10
// strokes) in the payload's line geometry.
const regionSumLines = [
  ['R2C2', 'R3C3', 'R3C4', 'R2C3', 'R1C2', 'R2C1', 'R3C1', 'R3C2',
    'R4C2', 'R5C2', 'R6C2', 'R7C1', 'R8C1', 'R7C2', 'R8C3'],
  ['R4C3', 'R4C4', 'R3C5', 'R2C5', 'R2C6', 'R1C7'],
  ['R5C3', 'R6C4', 'R5C5', 'R5C6', 'R4C5', 'R3C6', 'R2C7', 'R1C8'],
  ['R6C5', 'R6C6', 'R5C7', 'R4C7', 'R4C8', 'R3C8', 'R2C9', 'R1C9'],
  ['R9C4', 'R8C5', 'R8C6', 'R9C7'],
];

return [
  shape,
  flagOverlay.toVar('weight flag'),
  contribAOverlay.toVar('contribution A'),
  contribBOverlay.toVar('contribution B'),
  lightRowDigitOverlay.toVar('lighter digit per row'),
  heavyRowDigitOverlay.toVar('heavier digit per row'),

  // Grid digits stay 1-9 despite the widened shape.
  graph.makeReplicate(new Given(graph.cells()[0], ...DIGITS)),
  // Flag: 1 lighter, 2 normal, 3 heavier.
  flagOverlay.makeReplicate(new Given(flagOverlay.cells()[0], 1, 2, 3)),
  ...lightRowDigits.map(cell => new Given(cell, ...DIGITS)),
  ...heavyRowDigits.map(cell => new Given(cell, ...DIGITS)),

  // Pin each cell's contribution pieces from its digit and flag.
  ...graph.cells().map(cell =>
    new NFA(contribASpec, 'contribA', cell, flag(cell), contribA(cell))),
  ...graph.cells().map(cell =>
    new NFA(contribBSpec, 'contribB', cell, flag(cell), contribB(cell))),

  // Exactly one lighter (1) and one heavier (3) cell per row/column/box; the
  // remaining 7 cells of each group are then forced to 2 (normal), since
  // that is the only value left in the flag's 3-value domain.
  ...graph.rows().map(r => new ContainExact('1_3', ...flag(r))),
  ...graph.columns().map(c => new ContainExact('1_3', ...flag(c))),
  ...graph.boxes().map(b => new ContainExact('1_3', ...flag(b))),

  // Extract each row's lighter/heavier digit into its row-indexed Var, then
  // require the 9 lighter digits all differ (and likewise the 9 heavier
  // digits) -- "each digit from 1 to 9 appears once" in each set.
  ...graph.rows().flatMap((rowCells, i) => {
    const interleaved = rowCells.flatMap(cell => [cell, flag(cell)]);
    return [
      new NFA(lightSelectorSpec, `light-r${i + 1}`, ...interleaved, lightRowDigits[i]),
      new NFA(heavySelectorSpec, `heavy-r${i + 1}`, ...interleaved, heavyRowDigits[i]),
    ];
  }),
  new AllDifferent(...lightRowDigits),
  new AllDifferent(...heavyRowDigits),

  // Region Sum Lines, on doubled true values.
  ...regionSumLines.map(equalDoubledSum),
];
