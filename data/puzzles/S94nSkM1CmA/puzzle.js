// Title: Shenanigans
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=S94nSkM1CmA
// Source: https://app.crackingthecryptic.com/sudoku/3DrNDGMDnG

// Normal sudoku rules apply (default rows/columns/boxes). Ten lines are drawn,
// each in one of three colours: purple = Renban (consecutive, non-repeating
// digits, any order), yellow-green = German Whisper (adjacent cells differ by
// >= 5), deepskyblue = Region Sum Line (equal sum through each box the line
// crosses). Every line really is one of these three types, but some are drawn
// in the wrong colour: the wrongly-coloured lines are exactly the lines that
// contain one particular digit D, and D itself is for the solver to find.
// The rules never say which of the two remaining types a wrongly-coloured
// line actually is, so both are encoded as a disjunction rather than picked.
//
// D is modelled as an extra cell (Var 'D', ranging 1-9 like the grid) shared
// by every line. Each line becomes one Or of two And branches: either every
// cell on the line differs from D and the line satisfies its drawn-colour
// type, or some cell equals D and the line satisfies one of the other two
// types.

const D = new Var('D', 'wrong-colour digit', 1);
const dCell = D.cell(1);

// Drawn stroke colour and cell path per line. Colour is the constraint-type
// legend: purple = Renban, yellow-green = Whisper, deepskyblue = Region Sum
// Line.
const LINES = [
  { color: 'purple', cells: ['R5C5', 'R4C5', 'R3C4', 'R2C5', 'R3C6', 'R3C5'] },
  { color: 'purple', cells: ['R4C3', 'R5C4', 'R6C4', 'R6C5', 'R6C6', 'R5C6'] },
  { color: 'purple', cells: ['R8C6', 'R9C6', 'R9C7'] },
  { color: 'green', cells: ['R5C1', 'R6C1', 'R6C2', 'R7C2', 'R8C1'] },
  { color: 'green', cells: ['R4C2', 'R5C2', 'R6C3', 'R7C3', 'R7C4', 'R8C5', 'R9C5'] },
  { color: 'green', cells: ['R3C2', 'R3C3', 'R2C4', 'R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C7', 'R3C8'] },
  { color: 'green', cells: ['R4C6', 'R5C7', 'R6C8', 'R7C7'] },
  { color: 'blue', cells: ['R3C9', 'R4C9', 'R4C8', 'R4C7'] },
  { color: 'blue', cells: ['R4C1', 'R3C1', 'R2C2', 'R2C3'] },
  { color: 'blue', cells: ['R5C8', 'R6C9', 'R7C8', 'R8C7', 'R9C8', 'R8C9'] },
];

const TYPE_BY_COLOR = {
  purple: cells => new Renban(...cells),
  green: cells => new Whisper(...cells),
  blue: cells => new RegionSumLine(...cells),
};
// The two colours (and therefore types) a line was NOT drawn in.
const ALT_COLORS = {
  purple: ['green', 'blue'],
  green: ['purple', 'blue'],
  blue: ['purple', 'green'],
};

const lineConstraints = LINES.map(({ color, cells }) => {
  const ownType = TYPE_BY_COLOR[color](cells);
  const altTypes = ALT_COLORS[color].map(c => TYPE_BY_COLOR[c](cells));
  const avoidsD = cells.map(c => new AllDifferent(dCell, c));
  const containsD = cells.map(c => new SameValues(2, dCell, c));
  return new Or([
    new And([ownType, ...avoidsD]),
    new And([new Or(altTypes), new Or(containsD)]),
  ]);
});

return [
  new Shape('9x9'),
  D,
  ...lineConstraints,
];
