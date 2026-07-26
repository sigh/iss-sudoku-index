// Title: Taiga
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=QCYaUd8KjO0
// Source: https://sudokupad.app/6f3k4btidk

// Normal sudoku rules apply to the digit filled into each cell (the digit
// grid keeps the usual row/column/box AllDifferent from Shape).
//
// Every row, column, and box has exactly one row-indexer cell and one
// column-indexer cell (all other cells are ordinary); a row-indexer's digit
// gives the 1-based left-to-right column position, within its own row, of
// that row's column-indexer; a column-indexer's digit gives the 1-based
// top-to-bottom row position, within its own column, of that column's
// row-indexer.
//
// Every cell also carries a derived "value": an ordinary cell's value is its
// own digit; an indexer cell's value is the digit of the cell it indexes
// (the row-indexer's value is its row's column-indexer's digit; the
// column-indexer's value is its column's row-indexer's digit). The
// region-subset line rule compares these values, not raw digits.

const ORDINARY = 1;
const ROW_INDEXER = 2;
const COL_INDEXER = 3;

const graph = cellGraph('9x9');
const types = graph.makeOverlay('VT');
const values = graph.makeOverlay('VU');
const type = cell => types.at(cell);
const value = cell => values.at(cell);

// Each cell's indexer type is one of ORDINARY / ROW_INDEXER / COL_INDEXER.
const typeDomain = types.makeReplicate(
  new Given(types.cells()[0], ORDINARY, ROW_INDEXER, COL_INDEXER));

// Two token layouts per house-scan: positioning only needs (type, digit);
// the value link also needs the value token. Splitting them keeps each NFA's
// compiled-state count small -- a single combined machine carrying all four
// raw digits (row digit/value, column digit/position) at once blows the
// compiler's 4096-state limit.
const pairs = cells => cells.flatMap(cell => [type(cell), cell]);
const triples = cells => cells.flatMap(cell => [type(cell), cell, value(cell)]);

// Position machine: the row-indexer's digit must equal the 1-based position
// (in scan order) of the column-indexer, and vice versa for columns. Exactly
// one of each type is required per house (rejects a second sighting).
const makePositionMachineSpec = (targetType, positionType) => NFA.encodeSpec({
  startState: {
    phase: 'type', position: 1, curType: null,
    targetSeen: false, positionSeen: false,
    targetDigit: null, markedPosition: null,
  },
  transition: (state, tok) => {
    if (state.phase === 'type') {
      if (tok !== ORDINARY && tok !== ROW_INDEXER && tok !== COL_INDEXER) return undefined;
      if (tok === targetType && state.targetSeen) return undefined;
      if (tok === positionType && state.positionSeen) return undefined;
      return { ...state, phase: 'digit', curType: tok };
    }
    // phase === 'digit'
    const t = state.curType;
    const next = { ...state, phase: 'type', position: state.position + 1, curType: null };
    if (t === targetType) return { ...next, targetSeen: true, targetDigit: tok };
    if (t === positionType) return { ...next, positionSeen: true, markedPosition: state.position };
    return next;
  },
  accept: state => state.phase === 'type' && state.position === 10 &&
    state.targetSeen && state.positionSeen &&
    state.targetDigit === state.markedPosition,
  maxDepth: 18, // 9 cells x 2 tokens (type, digit).
}, 9);

// Value machine: `targetType`'s value must equal `otherType`'s digit (the
// row-indexer's value = its row's column-indexer's digit, and mirrored for
// columns) -- the position machine above already pins the "other" cell to be
// the right one, so this only needs to compare same-house digits/values, no
// lookup. Whichever role is seen first is held in `pending` until the other
// arrives, then the two are compared once and collapsed to `linked`
// (true/false) so trailing ordinary cells don't keep two raw digits alive
// for the rest of the scan -- that's what blows the compiled-state limit.
// `checkOrdinary` also asserts ordinary-cell value == digit; doing that only
// in the row scan is enough, since every cell belongs to exactly one row.
const makeValueMachineSpec = (targetType, otherType, checkOrdinary) => NFA.encodeSpec({
  startState: { phase: 'type', curType: null, curDigit: null, pending: null, linked: false },
  transition: (state, tok) => {
    if (state.phase === 'type') return { ...state, phase: 'digit', curType: tok };
    if (state.phase === 'digit') return { ...state, phase: 'value', curDigit: tok };
    // phase === 'value'
    const t = state.curType, d = state.curDigit, v = tok;
    if (checkOrdinary && t === ORDINARY && v !== d) return undefined;
    const base = { ...state, phase: 'type', curType: null, curDigit: null };
    if (state.linked || t === ORDINARY) return base;
    if (t === targetType) {
      if (state.pending?.kind === 'other') {
        return { ...base, pending: null, linked: v === state.pending.digit };
      }
      return { ...base, pending: { kind: 'target', value: v } };
    }
    // t === otherType
    if (state.pending?.kind === 'target') {
      return { ...base, pending: null, linked: d === state.pending.value };
    }
    return { ...base, pending: { kind: 'other', digit: d } };
  },
  accept: state => state.phase === 'type' && state.linked === true,
  maxDepth: 27, // 9 cells x 3 tokens (type, digit, value).
}, 9);

const rowValueMachineSpec = makeValueMachineSpec(ROW_INDEXER, COL_INDEXER, true);
const colValueMachineSpec = makeValueMachineSpec(COL_INDEXER, ROW_INDEXER, false);

const rowPositionSpec = makePositionMachineSpec(ROW_INDEXER, COL_INDEXER);
const colPositionSpec = makePositionMachineSpec(COL_INDEXER, ROW_INDEXER);

const rowRules = graph.rows().flatMap(row => [
  new NFA(rowPositionSpec, 'row indexer position', ...pairs(row)),
  new NFA(rowValueMachineSpec, 'row indexer value', ...triples(row)),
]);
const colRules = graph.columns().flatMap(col => [
  new NFA(colPositionSpec, 'column indexer position', ...pairs(col)),
  new NFA(colValueMachineSpec, 'column indexer value', ...triples(col)),
]);

// Each box also has exactly one row-indexer and one column-indexer (the row
// and column machines above only pin down one-per-row and one-per-column).
const boxRules = graph.boxes().flatMap(box => [
  new ContainExact(`${ROW_INDEXER}`, ...types.at(box)),
  new ContainExact(`${COL_INDEXER}`, ...types.at(box)),
]);

// Region-subset lines: box boundaries split each line into segments; for
// every pair of segments, one segment's value set must be a subset of the
// other's. Segments are derived from the drawn cell path by which 3x3 box
// each cell falls in (not hand-split).
const lines = [
  ['R4C5', 'R4C4', 'R4C3', 'R5C3', 'R6C3', 'R5C4', 'R5C5', 'R6C6'],
  ['R4C9', 'R4C8', 'R4C7', 'R3C6', 'R2C5', 'R1C4', 'R1C3', 'R1C2', 'R2C3', 'R3C3', 'R2C4'],
  ['R2C6', 'R2C7', 'R2C8', 'R2C9'],
  ['R3C1', 'R3C2', 'R4C2', 'R5C2', 'R6C2'],
  ['R8C1', 'R9C2', 'R8C3', 'R9C4'],
  ['R6C4', 'R7C5', 'R7C6', 'R6C7', 'R5C8', 'R6C8', 'R7C9'],
]; // Cell paths of the six drawn (mediumspringgreen) lines, row-major.

const boxOf = cellId => {
  const { row, col } = parseCellId(cellId);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};

const segmentsOf = line => {
  const segments = [];
  let current = [];
  let currentBox = null;
  for (const cell of line) {
    const box = boxOf(cell);
    if (current.length && box !== currentBox) {
      segments.push(current);
      current = [];
    }
    current.push(cell);
    currentBox = box;
  }
  if (current.length) segments.push(current);
  return segments;
};

// True iff every value in `xs` also occurs somewhere in `ys`.
const valuesSubsetOf = (xs, ys) => new And(
  xs.map(x => new Or(ys.map(y => new SameValues(2, value(x), value(y)))))
);

const regionSubsetLines = lines.flatMap(line => {
  const segments = segmentsOf(line);
  const pairs = [];
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      pairs.push(new Or([
        valuesSubsetOf(segments[i], segments[j]),
        valuesSubsetOf(segments[j], segments[i]),
      ]));
    }
  }
  return pairs;
});

return [
  new Shape('9x9'),
  types.toVar('Indexer type'),
  values.toVar('Indexer value'),
  typeDomain,
  ...rowRules,
  ...colRules,
  ...boxRules,
  ...regionSubsetLines,
];
