// Title: Big Mac
// Author: Adem Jaziri
// Video: https://www.youtube.com/watch?v=2vKkBVjhB1o
// Source: https://app.crackingthecryptic.com/sudoku/8NGMPRj4Dt

// Normal sudoku. Killer cages (small clue top-left = sum, no repeats).
// Every outside clue reads the same way: three shared digit-values X, Y, Z
// (solver-discovered, not tied to a cell) each occur once per clued line.
// The clue is the sum of the line's digits strictly between the X- and
// Y-cells, and separately the sum strictly between the Y- and Z-cells; both
// readings equal the same printed number. Two clues print that number (7,
// 18); five print '?' -- the source shows the clue itself as unknown, so
// only the equality between the two readings is encoded for those, per the
// rules' "a '?' could represent any digit" sentence.

const graph = cellGraph('9x9');

// Reify flagCell = 2 when cellValue === markerCell, else 1.
const REIFY_SPEC = NFA.encodeSpec({
  startState: null,
  transition: (state, value) => {
    if (state === null) return { a: value };
    if (state.b === undefined) return { a: state.a, b: value };
    const expected = (state.a === state.b) ? 2 : 1;
    return value === expected ? { done: true } : undefined;
  },
  accept: (state) => state !== null && state.done === true,
  maxDepth: 3,
}, 9);

// Scans a line's [flagA, flagB, interiorFlag] triples in cell order and
// verifies interiorFlag = 2 exactly for cells strictly between the (order
// -unknown) occurrences of markers A and B -- 'before'/'between'/'after'
// tracks progress against the two crust cells so the state never needs to
// carry a running total (which is what blows the NFA state cap).
const INTERIOR_SPEC = NFA.encodeSpec({
  startState: { phase: 'before', sub: 0 },
  transition: (state, value) => {
    const { phase, sub } = state;
    if (sub === 0) return { phase, sub: 1, fA: value === 2 };
    if (sub === 1) {
      const fB = value === 2;
      const isCrust = state.fA || fB;
      let newPhase, interior;
      if (phase === 'before') {
        newPhase = isCrust ? 'between' : 'before'; interior = false;
      } else if (phase === 'between') {
        newPhase = isCrust ? 'after' : 'between'; interior = !isCrust;
      } else {
        newPhase = 'after'; interior = false;
      }
      return { phase: newPhase, sub: 2, expected: interior ? 2 : 1 };
    }
    if (value !== state.expected) return undefined;
    return { phase, sub: 0 };
  },
  accept: (state) => state.sub === 0,
  maxDepth: 27,
}, 9);

// maskedCell = cellValue when interiorFlag = 2 (inside the segment), else the
// placeholder 1. Summed together with the interior flags (2 = in, 1 = out)
// this recovers the true segment sum without ever needing a 0-valued cell:
// sum(masked) + sum(interiorFlags) - 18 = sum(cellValue where interior).
const MASKED_SPEC = NFA.encodeSpec({
  startState: null,
  transition: (state, value) => {
    if (state === null) return { v: value };
    if (state.iflag === undefined) return { v: state.v, iflag: value === 2 };
    const expected = state.iflag ? state.v : 1;
    return value === expected ? { done: true } : undefined;
  },
  accept: (state) => state !== null && state.done === true,
  maxDepth: 3,
}, 9);

function zip(...arrays) {
  const out = [];
  for (let i = 0; i < arrays[0].length; i++) {
    for (const arr of arrays) out.push(arr[i]);
  }
  return out;
}

// One clued line: reifies X/Y/Z occurrence flags, derives the two segment
// sums (X..Y and Y..Z) via the interior/masked machinery above, then either
// pins both to the known clue value or asserts they equal each other.
function lineClue(letter, cells, target) {
  const ov = (suffix) => graph.makeOverlay('V' + letter + suffix, cells);
  const flagsX = ov('FX'), flagsY = ov('FY'), flagsZ = ov('FZ');
  const interiorXY = ov('IXY'), interiorYZ = ov('IYZ');
  const maskedXY = ov('MXY'), maskedYZ = ov('MYZ');

  // Names are roles, not per-cell/per-line labels: same-named NFA instances
  // stay independent constraints (one per cell list given), so this keeps the
  // published constraint tags to one per mechanism instead of one per cell.
  const reify = (flags, markerCell, label) => cells.map((cell, i) =>
    new NFA(REIFY_SPEC, label, cell, markerCell, flags.cells()[i]));

  const masked = (interior, masked, label) => cells.map((cell, i) =>
    new NFA(MASKED_SPEC, label, cell, interior.cells()[i], masked.cells()[i]));

  const result = [
    flagsX.toVar(`${letter} X-occurrence flags`),
    flagsY.toVar(`${letter} Y-occurrence flags`),
    flagsZ.toVar(`${letter} Z-occurrence flags`),
    interiorXY.toVar(`${letter} between-X-Y flags`),
    interiorYZ.toVar(`${letter} between-Y-Z flags`),
    maskedXY.toVar(`${letter} masked values for X-Y`),
    maskedYZ.toVar(`${letter} masked values for Y-Z`),
    ...reify(flagsX, 'VX', 'X-occurrence flag'),
    ...reify(flagsY, 'VY', 'Y-occurrence flag'),
    ...reify(flagsZ, 'VZ', 'Z-occurrence flag'),
    new NFA(INTERIOR_SPEC, 'between-X-Y flag',
      ...zip(flagsX.cells(), flagsY.cells(), interiorXY.cells())),
    new NFA(INTERIOR_SPEC, 'between-Y-Z flag',
      ...zip(flagsY.cells(), flagsZ.cells(), interiorYZ.cells())),
    ...masked(interiorXY, maskedXY, 'masked value for X-Y'),
    ...masked(interiorYZ, maskedYZ, 'masked value for Y-Z'),
  ];

  if (target !== null) {
    result.push(
      new Sum(18 + target, ...maskedXY.cells(), ...interiorXY.cells()),
      new Sum(18 + target, ...maskedYZ.cells(), ...interiorYZ.cells()),
    );
  } else {
    result.push(new EqualSum(
      [...maskedXY.cells(), ...interiorXY.cells()],
      [...maskedYZ.cells(), ...interiorYZ.cells()]));
  }
  return result;
}

return [
  new Shape('9x9'),

  // Shared bread markers, solver-discovered. The worked example in the rules
  // uses three distinct digits (1, 6, 9); distinctness is also forced by the
  // rule's own structure -- if X and Z were equal, "between X and Y" and
  // "between Y and Z" would be the same quantity by construction, making the
  // "and also" clause vacuous rather than a real second reading.
  new Var('X', 'shared marker X', 1),
  new Var('Y', 'shared marker Y (middle)', 1),
  new Var('Z', 'shared marker Z', 1),
  new AllDifferent('VX', 'VY', 'VZ'),

  // Cages, from the drawn small-clue groups (source cages array).
  new Cage(9, 'R1C4', 'R1C5', 'R2C5'),
  new Cage(9, 'R6C6', 'R7C6', 'R7C7'),
  new Cage(9, 'R8C4', 'R8C5', 'R8C6'),
  new Cage(13, 'R9C4', 'R9C5'),
  new Cage(9, 'R6C3', 'R7C3'),
  new Cage(14, 'R4C7', 'R5C7'),
  new Cage(14, 'R7C8', 'R7C9'),

  // Outside clues: left of R2 (7), left of R5 (18), left of R8, top of C1,
  // C3, C7, C9 (all five printed as '?' in the source).
  ...lineClue('A', graph.row(2), 7),
  ...lineClue('B', graph.row(5), 18),
  ...lineClue('C', graph.row(8), null),
  ...lineClue('D', graph.column(1), null),
  ...lineClue('E', graph.column(3), null),
  ...lineClue('F', graph.column(7), null),
  ...lineClue('G', graph.column(9), null),
];
