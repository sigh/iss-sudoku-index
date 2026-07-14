// Title: Fog Eraser
// Author: R. Mullinix
// Video: https://www.youtube.com/watch?v=0SQJRdZLRQs
// Source: https://sudokupad.app/c8shq67xrf
//
// Normal Sudoku. There is one "eraser" cell in every row, column, and box (9
// total, solver-discovered, not drawn); the nine eraser cells hold nine
// different digits. Every other clue (killer cages, thermometers, V clues,
// German whispers) reads an eraser cell's *value* as 0 instead of its digit.
//
// Modelled with a widened grid range 0-9: the real Sudoku digit stays on the
// main grid (restricted back to 1-9 per cell), and a parallel "effective
// value" Var overlay (VE#, full 0-9 range) is 0 exactly at the eraser cells
// and equal to the digit everywhere else. Every value-sensitive clue is
// re-expressed over the VE overlay instead of the raw grid, which lets the
// native Cage/Thermo/Whisper classes and a plain Sum absorb the eraser
// substitution automatically -- e.g. a thermometer can only put its eraser at
// the bulb, because a later 0 could never be strictly greater than an
// earlier positive value, without any extra code.

const graph = cellGraph('9x9~0-9');
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Real Sudoku digit: restrict every main-grid cell back to 1-9 (the widened
// shape defaults every cell, main grid included, to 0-9). One Given template,
// replicated onto every cell, rather than 81 identical Givens.
const digitGivens = graph.makeReplicate(new Given('R1C1', ...DIGITS));

// Effective value overlay: VE1..VE81, one per grid cell, kept at the full
// 0-9 range so it can represent an erased (0) cell.
const eff = graph.makeOverlay('VE');
const effAt = cell => eff.at(cell);

// Link each cell's digit to its effective value: eff is 0 (erased) or
// exactly the digit (not erased). This is the only place the two layers
// interact; every eraser-position deduction flows from it plus the
// exactly-one-per-house counts below.
const eraserLinkKey = Pair.fnToKey(
  (digit, value) => value === 0 || value === digit,
  graph.gridGeometry());
const eraserLinks = graph.cells().map(
  cell => new Pair(eraserLinkKey, 'digit/value link', cell, effAt(cell)));

// Exactly one eraser (effective value 0) in every row, column, and box.
const oneEraserPerHouse = graph.houses().map(
  house => new ContainExact('0', ...house.map(effAt)));

// The nine eraser cells hold nine different digits. Capture, per row, the
// digit sitting at that row's (unique) eraser cell into a dedicated Var, by
// scanning the row as an interleaved value/digit stream that ends on the
// capture Var itself; then require the nine captured digits to be different.
const eraserDigit = new Var('ED', 'row eraser digit', 9);
const eraserDigitSpec = {
  startState: { stage: 'value', pairsLeft: 9, found: null, curValue: null },
  transition: (state, value) => {
    if (state.stage === 'value') {
      return { ...state, stage: 'digit', curValue: value };
    }
    if (state.stage === 'digit') {
      const found = state.curValue === 0 ? value : state.found;
      const pairsLeft = state.pairsLeft - 1;
      return { stage: pairsLeft > 0 ? 'value' : 'final', pairsLeft, found, curValue: null };
    }
    if (state.stage === 'final') {
      // `value` here is the row's capture Var: it must equal the digit found
      // at the row's eraser cell.
      return { stage: 'done', ok: value === state.found };
    }
    return state; // stage === 'done': stream is exactly 19 symbols, unreachable.
  },
  accept: (state) => state.stage === 'done' && state.ok,
};
const eraserDigitNFA = NFA.encodeSpec(eraserDigitSpec, graph.gridGeometry());
const eraserDigitCaptures = graph.rows().map((row, i) => new NFA(
  eraserDigitNFA, `row ${i + 1} eraser digit`,
  ...row.flatMap(cell => [effAt(cell), cell]), eraserDigit.cell(i + 1)));

// Killer cages: values (not digits) sum to the total and don't repeat.
const CAGES = [
  [10, ['R7C4', 'R8C3', 'R8C4', 'R9C4']],
  [8, ['R4C5', 'R5C4', 'R5C5']],
  [6, ['R1C7', 'R1C8', 'R2C7']],
  [15, ['R4C1', 'R4C2', 'R4C3']],
  [14, ['R1C1', 'R1C2']],
];
const cages = CAGES.map(([total, cells]) => new Cage(total, ...cells.map(effAt)));

// Thermometers: values strictly increase from the bulb.
const THERMOS = [
  ['R2C2', 'R3C2', 'R3C3', 'R2C3', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C6'],
  ['R9C8', 'R9C9'],
];
const thermos = THERMOS.map(cells => new Thermo(...cells.map(effAt)));

// V clues: the two values sum to 5.
const VEES = [
  ['R7C3', 'R8C3'],
  ['R4C5', 'R4C6'],
  ['R1C8', 'R2C8'],
];
const vees = VEES.map(([a, b]) => new Sum(5, effAt(a), effAt(b)));

// German Whispers: adjacent values on the line differ by at least 5. The two
// drawn loops are closed 2x2 cycles, so their cell list repeats the first
// cell at the end to cover the wrap-around edge.
const WHISPERS = [
  ['R6C2', 'R6C1', 'R7C1'],
  ['R5C3', 'R6C3'],
  ['R4C7', 'R5C7', 'R5C8', 'R4C8', 'R4C7'],
  ['R3C5', 'R4C5', 'R4C6', 'R3C6', 'R3C5'],
];
const whispers = WHISPERS.map(cells => new Whisper(5, ...cells.map(effAt)));

return [
  new Shape('9x9', '0-9'),
  digitGivens,
  eff.toVar('effective value'),
  ...eraserLinks,
  ...oneEraserPerHouse,
  eraserDigit,
  ...eraserDigitCaptures,
  new AllDifferent(...eraserDigit.cells()),
  ...cages,
  ...thermos,
  ...vees,
  ...whispers,
];
