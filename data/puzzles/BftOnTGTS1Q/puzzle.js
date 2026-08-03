// Title: Secrets and Lines
// Author: Starwarigami
// Video: https://www.youtube.com/watch?v=BftOnTGTS1Q
// Source: https://app.crackingthecryptic.com/sudoku/MTtdF66hqN

// Rules encoded:
// Normal sudoku (rows/columns/boxes all-different; the drawn regions are the
// standard 9 boxes). Every one of the 17 lines below is exactly one of:
//   Renban       - the line's digits are a non-repeating set of consecutive
//                  integers, in any order.
//   Whisper      - every pair of line-adjacent cells differs by >= 5 (German
//                  Whispers default difference).
//   AntiFactor   - for a line of length n, no digit other than 1 may be a
//                  factor or multiple of n, and the digits must sum to a
//                  multiple of n.
// Which type each line is, is itself unknown and part of the puzzle logic
// (the title): a Var per line ('VT', restricted to 1=Renban/2=Whisper/
// 3=AntiFactor) records the discovered type and is tied to the matching
// digit rule via Or/And/Given -- see `lineTypeConstraint`.
// Meta-clues on the discovered types: row 1's three lines (indices 6, 7, 8
// below) must include exactly two Renban lines; every other row, every
// column, and every box must have at least two different line types among
// the lines that touch any of its cells.

// Cell lists, one line per entry. The source stores each line as one or more
// polyline objects that meet end-to-end (never at a polyline's interior
// point); each entry below is one maximal chain of those polylines, joined at
// their shared endpoint and re-ordered head-to-tail where the source split a
// single drawn line into several objects. The chain gives a non-overlapping
// 17-line partition of all 81 cells.
const lineCells = [
  ['R4C6', 'R4C7', 'R4C8'],                                           // line 0
  ['R9C6', 'R8C6', 'R7C6', 'R6C6', 'R5C6',
    'R5C7', 'R5C8', 'R5C9', 'R6C9'],                                  // line 1
  ['R6C8', 'R7C8', 'R7C9', 'R8C9'],                                   // line 2
  ['R6C7', 'R7C7', 'R8C7'],                                           // line 3
  ['R8C8', 'R9C7', 'R9C8', 'R9C9'],                                   // line 4
  ['R2C9', 'R2C8', 'R2C7', 'R3C7', 'R3C8', 'R3C9', 'R4C9'],           // line 5
  ['R1C9', 'R1C8', 'R1C7'],                                           // line 6
  ['R1C6', 'R1C5', 'R1C4'],                                           // line 7
  ['R1C3', 'R1C2', 'R1C1'],                                           // line 8
  ['R2C3', 'R2C2', 'R2C1', 'R3C1', 'R3C2', 'R3C3'],                   // line 9
  ['R2C4', 'R3C4', 'R4C4', 'R4C3', 'R4C2', 'R4C1'],                   // line 10
  ['R2C6', 'R3C6'],                                                   // line 11
  ['R2C5', 'R3C5', 'R4C5', 'R5C5',
    'R6C5', 'R7C5', 'R8C5', 'R9C5'],                                  // line 12
  ['R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4', 'R9C3', 'R9C2', 'R9C1'],   // line 13
  ['R8C3', 'R8C2', 'R8C1'],                                           // line 14
  ['R7C1', 'R7C2', 'R7C3', 'R6C3', 'R5C3'],                           // line 15
  ['R6C1', 'R5C1', 'R5C2', 'R6C2'],                                   // line 16
];

const RENBAN = 1, WHISPER = 2, ANTIFACTOR = 3;

// Digits other than 1 that are a factor or multiple of n; n is derived from
// the line's own cell count, not hand-picked per line.
function antiFactorForbidden(n) {
  const forbidden = new Set();
  for (let d = 1; d <= 9; d++) {
    if (d !== 1 && (n % d === 0 || d % n === 0)) forbidden.add(d);
  }
  return forbidden;
}

// Anti-Factor state machine for a line of length n >= 3: reject a forbidden
// digit, tracking the running sum mod n; accept iff that sum is 0 (i.e. the
// total is a multiple of n).
function antiFactorSpec(n) {
  const forbidden = antiFactorForbidden(n);
  return NFA.encodeSpec({
    startState: 0,
    transition: (sumMod, value) =>
      forbidden.has(value) ? undefined : (sumMod + value) % n,
    accept: (sumMod) => sumMod === 0,
  }, 9);
}

// The same Anti-Factor rule for a 2-cell line, as a direct pairwise relation
// (a 2-cell NFA is just a Pair -- see lint guidance nfa-two-cell-use-pair).
function antiFactorPairKey() {
  const forbidden = antiFactorForbidden(2);
  return Pair.fnToKey(
    (a, b) => !forbidden.has(a) && !forbidden.has(b) && (a + b) % 2 === 0, 9);
}

const graph = cellGraph('9x9');

// One type-Var per line, anchored at the line's own first cell (all 17 are
// distinct cells, so each line gets its own Var).
const typeOverlay = graph.makeOverlay('VT', lineCells.map(cells => cells[0]));
const typeVar = i => typeOverlay.at(lineCells[i][0]);

// The line's real digit rule, gated on its own type-Var: exactly one branch
// can hold for the actual assignment, and that branch both pins the type-Var
// to the matching code and applies that type's rule (same selector-Var
// pattern as rectangle_sums.js).
function lineTypeConstraint(i) {
  const cells = lineCells[i];
  const n = cells.length;
  const antiFactorRule = n === 2
    ? new Pair(antiFactorPairKey(), `AF${n}`, ...cells)
    : new NFA(antiFactorSpec(n), `AF${n}`, ...cells);
  return new Or([
    new And([new Given(typeVar(i), RENBAN), new Renban(...cells)]),
    new And([new Given(typeVar(i), WHISPER), new Whisper(...cells)]),
    new And([new Given(typeVar(i), ANTIFACTOR), antiFactorRule]),
  ]);
}

// Lines with at least one cell in the given house (any shared cell counts).
function linesTouching(houseCells) {
  const set = new Set(houseCells);
  return lineCells
    .map((_, i) => i)
    .filter(i => lineCells[i].some(c => set.has(c)));
}

const rows = graph.rows();
const columns = graph.columns();
const boxes = graph.boxes();

// Row 1 is the only house with its own exact-count clue; confirmed to be
// exactly the 3 fully-contained row-1 lines by construction below.
const row1Lines = linesTouching(rows[0]);

// The remaining houses (rows 2-9, every column, every box) each need "at
// least two different line types" -- one CountDistinct per house, with its
// control Var restricted to {2, 3} (out of the 3 possible line types).
const distinctHouses = [...rows.slice(1), ...columns, ...boxes];
// One anchor cell per house, distinct from every other anchor: rows use
// column 1 (row 1 itself is excluded from this list), columns use row 1,
// boxes use their own centre cell.
const distinctAnchors = [
  ...rows.slice(1).map((_, i) => makeCellId(i + 2, 1)),
  ...columns.map((_, i) => makeCellId(1, i + 1)),
  ...boxes.map((_, i) => makeCellId(
    Math.floor(i / 3) * 3 + 2, (i % 3) * 3 + 2)),
];
const distinctOverlay = graph.makeOverlay('VD', distinctAnchors);
const distinctVars = distinctOverlay.at(distinctAnchors);

return [
  new Shape('9x9'),

  typeOverlay.toVar('LineType'),
  ...lineCells.map((_, i) => new Given(typeVar(i), RENBAN, WHISPER, ANTIFACTOR)),
  ...lineCells.map((_, i) => lineTypeConstraint(i)),

  // Row 1: exactly two Renban lines among its three.
  new ContainExact(`${RENBAN}_${RENBAN}`, ...row1Lines.map(typeVar)),

  // Every other row, column, and box: at least two distinct line types.
  distinctOverlay.toVar('HouseDistinctTypes'),
  ...distinctVars.map(v => new Given(v, 2, 3)),
  ...distinctHouses.map((houseCells, i) => new CountDistinct(
    distinctVars[i],
    ...linesTouching(houseCells).map(typeVar),
  )),
];
