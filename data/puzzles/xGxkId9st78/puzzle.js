// Title: Stickiest Notes
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=xGxkId9st78
// Source: https://sudokupad.app/james-sinclair/stickiest-notes?setting-nogrid=1

// Rules encoded below, in full:
//  - Divide the grid into nine orthogonally-connected nine-cell regions; place
//    1-9 once in each row, column and region.
//  - Each region has a corresponding colour.
//  - A note outside the grid indicates that the region of that colour contains a
//    run of one or more orthogonally-connected cells in that row or column,
//    bounded on either side by a region border or the grid edge, and the number
//    on the note (if given) is the sum of the digits in these cells.
//  - If a region has several such runs in the same row or column, the note
//    applies to only one of them.
//  - Where notes overlap, the note above has a lower sum than the note below,
//    including when a sum is hidden or not given.
// No clause is omitted.

// The nine note colours, indexed 1-9 in this order. The colour a region takes is
// part of the solve, so colour i's region label is carried by variable VL<i>
// rather than being identified with a fixed chaos-construction label (those are
// canonicalised by the solver and carry no external identity).
const COLOURS = [
  '#8ac2f9 blue', '#efc084 tan', '#f1b0f6 plum', '#fdf38b yellow',
  '#079d68 green', '#c3c3c3 silver', '#d1efa5 pale green', '#f98887 coral',
  '#7d7d7d grey',
];

// Note piles, transcribed from the coloured squares drawn outside the grid: one
// entry per row/column that carries notes, listing that pile's notes from the
// top of the pile down, with the number printed on the note or null when none is
// (a lower note's number is hidden by the note covering it).
const PILES = [
  { line: 'C2', notes: [['green', 14], ['coral', null]] },
  { line: 'C3', notes: [['tan', 15]] },
  { line: 'C4', notes: [['yellow', 13], ['tan', null], ['pale green', null]] },
  { line: 'C5', notes: [['blue', 4], ['grey', null]] },
  { line: 'C8', notes: [['pale green', 12], ['coral', null]] },
  { line: 'C9', notes: [['silver', null]] },
  { line: 'R1', notes: [['plum', 12], ['tan', null]] },
  { line: 'R2', notes: [['blue', 12], ['plum', null]] },
  { line: 'R3', notes: [['plum', 5]] },
  { line: 'R5', notes: [['silver', 8]] },
  { line: 'R6', notes: [['green', null], ['yellow', null]] },
  { line: 'R8', notes: [['blue', 4]] },
  { line: 'R9', notes: [['yellow', 4]] },
];

const LINE_TOTAL = 45;   // a row or column holds 1-9 once

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');                 // region label per grid cell
const colourLabels = new Var('L', 'Region colours', 9);

const colourCell = (name) => colourLabels.cell(
  COLOURS.findIndex(c => c.endsWith(name)) + 1);

const lineCells = (line) => (line[0] === 'R'
  ? graph.row(+line.slice(1))
  : graph.column(+line.slice(1)));

// One note becomes an NFA over [colour label variable, then the line's cells as
// (region label, digit) pairs]. The machine reads the colour's region label from
// the first cell, then walks the line splitting it into maximal runs of that
// label and totalling each run's digits; it accepts when some completed run's
// total satisfies the note. `mode` is 'eq' for a printed number and 'gt' for a
// note whose number is only known to exceed `target` (target 0 means the note
// only asserts that a run exists).
// State: k = the colour's region label (0 before it has been read), f = a run
// satisfying the note has been seen, r = the current run's running total, or -1
// outside a run and -2 once the total can no longer reach the target, p = 0 when
// the next cell is a region label and 1 when it is a digit.
const runNFA = (mode, target) => NFA.encodeSpec({
  startState: { k: 0, f: false, r: -1, p: 0 },
  transition({ k, f, r, p }, value) {
    if (k === 0) return { k: value, f: false, r: -1, p: 0 };
    if (p === 0) {
      if (value === k) return { k, f, r: r === -1 ? 0 : r, p: 1 };
      // The run ends here: a border, or a cell of another region.
      return { k, f: f || (mode === 'eq' && r === target), r: -1, p: 1 };
    }
    if (r < 0) return { k, f, r, p: 0 };
    const total = r + value;
    if (total > target) return { k, f: f || mode === 'gt', r: -2, p: 0 };
    return { k, f, r: total, p: 0 };
  },
  // The last run of the line is completed by the grid edge, so check it here too.
  accept: ({ k, f, r }) => k !== 0 && (f || (mode === 'eq' && r === target)),
}, 9);

const nfaCache = new Map();
const note = ([colour, _], line, mode, target) => {
  const key = `${mode}:${target}`;
  if (!nfaCache.has(key)) nfaCache.set(key, runNFA(mode, target));
  return new NFA(
    nfaCache.get(key), `${line} ${colour}`, colourCell(colour),
    ...lineCells(line).flatMap(cell => [cc.at(cell), cell]));
};

// A pile's notes have strictly increasing sums downwards. The runs belong to
// different regions, so they are disjoint and their totals sum to at most 45;
// that bounds the values an unprinted number can take. A note whose number is
// unprinted and which has a note below it is resolved by branching over its
// possible totals; the bottom note of a pile only needs a lower bound.
const pileConstraints = ({ line, notes }, index = 0, floor = 0, used = 0) => {
  if (index === notes.length) return [];
  const [, printed] = notes[index];
  if (printed !== null) {
    return [note(notes[index], line, 'eq', printed),
    ...pileConstraints({ line, notes }, index + 1, printed, used + printed)];
  }
  if (index === notes.length - 1) return [note(notes[index], line, 'gt', floor)];
  const below = notes.length - index - 1;
  const branches = [];
  // The notes below take at least total + 1, total + 2, ... of the line's 45.
  for (let total = floor + 1;
    used + (below + 1) * total + (below * (below + 1)) / 2 <= LINE_TOTAL;
    total++) {
    branches.push(new And([
      note(notes[index], line, 'eq', total),
      ...pileConstraints({ line, notes }, index + 1, total, used + total),
    ]));
  }
  return [new Or(branches)];
};

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  colourLabels,
  // Distinct colours name distinct regions.
  new AllDifferent(...colourLabels.cells()),
  ...PILES.flatMap(pile => pileConstraints(pile)),
];
