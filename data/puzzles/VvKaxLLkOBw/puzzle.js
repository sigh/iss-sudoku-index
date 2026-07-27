// Title: Cagey Architects
// Author: ChinStrap & gdc
// Video: https://www.youtube.com/watch?v=VvKaxLLkOBw
// Source: https://sudokupad.app/oyb8fi8jn2

// Normal sudoku rules apply to the main 9x9 grid: rows, columns and 3x3 boxes
// all-different, digits 1-9 (the default Shape('9x9') baseline). Dynamic Fog
// is solving UI only (progressive reveal on a correct placement); it adds no
// final-grid rule and is not encoded.
//
// Skyscraper: the source draws 36 cells outside the 9x9 grid, 9 per side,
// corners excluded (11x11 canvas minus the 9x9 play area and 4 corners).
// Each holds an unknown digit 1-9 that is itself the visible-building count
// for the adjacent row/column looking inward from that side (a digit is
// "seen" when it is larger than every digit before it). Modeled as four
// off-grid Var groups (TOP/BOTTOM/LEFT/RIGHT, one cell per row or column);
// Var cells inherit the grid's 1-9 value range, so no widening is needed.
//
// 2T1L Killer: "digits in cages never repeat" applies to every cage
// unconditionally. The source draws 18 cages with a displayed total, in six
// groups of three sharing the same total; within a group exactly two cages'
// digits truthfully sum to that total and one does not ("2 truths, 1 lie" per
// total, per the rules text). Modeled with one truth/lie flag Var per cage
// (1 = truth, 2 = lie): an NFA reads [flag, ...cageCells] and accepts only
// when the flag agrees with whether the digits actually sum to the total,
// and a ContainExact('1_1_2', ...) over each group's three flags forces
// exactly two truths without pre-selecting which cage in the group lies.
//
// Eighteen further `cages` entries in the source (drawn with no total) each
// cover one whole grid row or one whole grid column exactly; they are
// redundant with the default sudoku row/column all-different above and add
// no rule, so they are omitted. All 37 drawn `lines` are `"target":
// "overlay"` decoration (fog panels and the 9x9 frame), not clue geometry,
// and are likewise omitted.

// Border skyscraper-clue Vars. TOP.cell(c)/BOTTOM.cell(c) sit above/below
// grid column c; LEFT.cell(r)/RIGHT.cell(r) sit left/right of grid row r.
const TOP = new Var('TOP', 'top skyscraper clues (above C1..C9)', 9);
const BOTTOM = new Var('BOTTOM', 'bottom skyscraper clues (below C1..C9)', 9);
const LEFT = new Var('LEFT', 'left skyscraper clues (left of R1..R9)', 9);
const RIGHT = new Var('RIGHT', 'right skyscraper clues (right of R1..R9)', 9);

function col(c, rows) { return rows.map(r => makeCellId(r, c)); }
function row(r, cols) { return cols.map(c => makeCellId(r, c)); }
const INC = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const DEC = [9, 8, 7, 6, 5, 4, 3, 2, 1];

// Skyscraper: the clue cell's own value is the count of cells "visible" from
// its side, i.e. strictly greater than every cell scanned before it. The
// clue is read first so the NFA knows its target before scanning the line.
function skyscraper(clueCell, orderedCells, name) {
  const spec = {
    startState: null,
    transition: (state, value) => {
      if (state === null) return { target: value, maxSeen: 0, count: 0 };
      const { target, maxSeen, count } = state;
      if (value > maxSeen) return { target, maxSeen: value, count: count + 1 };
      return { target, maxSeen, count };
    },
    accept: (state) => !!state && state.count === state.target,
  };
  return new NFA(NFA.encodeSpec(spec, 9), name, clueCell, ...orderedCells);
}

const skyscraperClues = [
  ...INC.map(c => skyscraper(TOP.cell(c), col(c, INC), `Skyscraper top C${c}`)),
  ...INC.map(c => skyscraper(BOTTOM.cell(c), col(c, DEC), `Skyscraper bottom C${c}`)),
  ...INC.map(r => skyscraper(LEFT.cell(r), row(r, INC), `Skyscraper left R${r}`)),
  ...INC.map(r => skyscraper(RIGHT.cell(r), row(r, DEC), `Skyscraper right R${r}`)),
];

// The 18 totalled cages, grouped by displayed total (six groups of three).
// Cell lists are translated from the drawn 11x11 canvas coordinates
// (rows/cols 1-11) to this script's grid coordinates (rows/cols 1-9, i.e.
// canvas-1) for cells inside the 9x9 play area, and to TOP/BOTTOM/LEFT/RIGHT
// Var cells for cells in the outside ring. Comments cite the source drawing's
// cage index.
const liarCages = [
  // total 3
  { total: 3, cells: [TOP.cell(6), TOP.cell(7)] },               // cages[0]: R1C7,R1C8
  { total: 3, cells: [LEFT.cell(1), LEFT.cell(2)] },              // cages[1]: R2C1,R3C1
  { total: 3, cells: [TOP.cell(8), TOP.cell(9)] },                // cages[22]: R1C9,R1C10
  // total 10
  { total: 10, cells: ['R1C8', 'R1C9', 'R2C9'] },                 // cages[2]: R2C9,R2C10,R3C10
  { total: 10, cells: [TOP.cell(2), 'R1C1', 'R1C2'] },            // cages[3]: R1C3,R2C2,R2C3
  { total: 10, cells: ['R1C6', 'R1C7'] },                         // cages[25]: R2C7,R2C8
  // total 8
  { total: 8, cells: [RIGHT.cell(1), RIGHT.cell(2), RIGHT.cell(3)] }, // cages[4]: R2C11,R3C11,R4C11
  { total: 8, cells: ['R2C2', 'R3C2'] },                          // cages[5]: R3C3,R4C3
  { total: 8, cells: ['R2C5', 'R2C6'] },                          // cages[24]: R3C6,R3C7
  // total 16
  { total: 16, cells: ['R4C8', 'R5C8', 'R6C7', 'R6C8', 'R7C7'] }, // cages[6]: R5C9,R6C9,R7C8,R7C9,R8C8
  { total: 16, cells: ['R9C6', 'R9C7', BOTTOM.cell(7)] },         // cages[10]: R10C7,R10C8,R11C8
  { total: 16, cells: [LEFT.cell(3), 'R3C1', 'R4C1'] },           // cages[21]: R4C1,R4C2,R5C2
  // total 9
  { total: 9, cells: ['R7C5', 'R8C5', 'R9C5'] },                  // cages[7]: R8C6,R9C6,R10C6
  { total: 9, cells: ['R5C6', 'R6C6'] },                          // cages[11]: R6C7,R7C7
  { total: 9, cells: [TOP.cell(3), 'R1C3', 'R1C4'] },             // cages[23]: R1C4,R2C4,R2C5
  // total 5
  { total: 5, cells: ['R5C4', 'R5C5'] },                          // cages[8]: R6C5,R6C6
  { total: 5, cells: [BOTTOM.cell(3), BOTTOM.cell(4)] },          // cages[9]: R11C4,R11C5
  { total: 5, cells: [RIGHT.cell(7), RIGHT.cell(8), 'R9C9', RIGHT.cell(9)] }, // cages[26]: R8C11,R9C11,R10C10,R10C11
];

// Flag-gated sum check over cells read as [flag, ...cells]: holds when
// flag=1 and the cells sum to target, or flag=2 and they do not.
function linearFlagSpec(length, target) {
  return {
    startState: { flag: null, sum: 0, idx: 0 },
    transition: (state, value) => {
      if (state.flag === null) return { flag: value, sum: 0, idx: 0 };
      if (state.idx >= length) return state;
      return { flag: state.flag, sum: state.sum + value, idx: state.idx + 1 };
    },
    accept: (state) => {
      const holds = state.sum === target;
      return state.flag === 1 ? holds : holds === false;
    },
  };
}

function liarCageConstraint(name, flagCell, cells, total) {
  const encoded = NFA.encodeSpec(linearFlagSpec(cells.length, total), 9);
  return new NFA(encoded, name, flagCell, ...cells);
}

const liarFlagVars = new Var('LC', 'cage truth/lie flags (1=truth,2=lie)', liarCages.length);
const liarFlagCells = liarFlagVars.cells();

const liarCageRules = liarCages.flatMap(({ total, cells }, i) => [
  new AllDifferent(...cells),
  liarCageConstraint(`Cage ${i + 1} (total ${total})`, liarFlagCells[i], cells, total),
]);

// Each consecutive run of 3 flags is one same-total group (see liarCages
// above): exactly two cages in the group are truthful, one lies.
const groupFlagChecks = [];
for (let i = 0; i < liarFlagCells.length; i += 3) {
  groupFlagChecks.push(
    new ContainExact('1_1_2', ...liarFlagCells.slice(i, i + 3)));
}

return [
  new Shape('9x9'),

  TOP, BOTTOM, LEFT, RIGHT,
  ...skyscraperClues,

  liarFlagVars,
  ...liarFlagCells.map(c => new Given(c, 1, 2)),
  ...liarCageRules,
  ...groupFlagChecks,
];
