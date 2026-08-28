// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=7bvbD82k_wU
// Source: https://cracking-the-cryptic.web.app/sudoku/L9LQP67LPg

// Normal Sudoku rules apply on the 9x9 grid.
// Each cage forms a line one cell wide.  The letters printed at a cage's top
// left give the sum of the digits sandwiched between the smallest digit and the
// largest digit of that line.  Digits cannot repeat within a cage.
// Digits are encrypted so that each letter stands for a unique digit, and a
// letter drawn inside a cell is the digit that must appear in that cell.  A
// two-letter clue "AB" is the two-digit number with A as its tens digit and B
// as its units digit.
// The nine letters are drawn once each across row 1, so row 1 is itself the
// letter/digit key and every letter is read off the row 1 cell that carries it.
// Not encoded: the greyed two-column panel drawn to the right of the grid is a
// solver's key for writing the letter/digit correspondence into.  It states no
// rule -- its left column repeats the nine letters and its right column is
// blank -- and it is not part of the 9x9 grid.

const graph = cellGraph('9x9');

// Letters drawn in cells, one entry per drawn letter.  Row 1 carries all nine;
// column 9 continues the setter's name, so the drawn letters spell UNDARBEYOND.
const KEY_CELL = {
  U: 'R1C1', N: 'R1C2', D: 'R1C3', A: 'R1C4', R: 'R1C5',
  B: 'R1C6', E: 'R1C7', Y: 'R1C8', O: 'R1C9',
};
const REPEATED_LETTERS = [['N', 'R2C9'], ['D', 'R3C9']];

// Cage cells as drawn, with the letter string printed in the cage's top-left
// corner.  Cell order here is not relied on: the line order is recomputed below.
const CAGES = [
  { clue: 'ND', cells: ['R3C1', 'R3C2', 'R4C2', 'R4C3', 'R4C4', 'R5C4', 'R5C5'] },
  { clue: 'DY', cells: ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R4C6', 'R4C7', 'R5C7', 'R6C7'] },
  { clue: 'R', cells: ['R4C9', 'R5C9', 'R5C8'] },
  { clue: 'O', cells: ['R6C9', 'R7C9', 'R8C9', 'R9C9'] },
  { clue: 'D', cells: ['R6C2', 'R7C2', 'R8C2', 'R9C2'] },
  { clue: 'YU', cells: ['R5C3', 'R6C3', 'R6C4', 'R7C4', 'R8C4', 'R9C4', 'R9C3'] },
  { clue: 'R', cells: ['R6C5', 'R7C5', 'R8C5', 'R9C5'] },
  { clue: 'B', cells: ['R6C6', 'R7C6', 'R8C6', 'R9C6'] },
];

// "Each cage forms a line with a one-cell width": walk the cage's own adjacency
// graph to recover the order of cells along that line, which is what "between
// the smallest and the largest" is measured along.  Every cage's adjacency
// graph is a simple path, so the drawn shape forces this order up to reversal,
// and the sandwich rule is symmetric under reversal.  The throws are decode
// assertions: they fire if a cage is ever transcribed as something that is not
// a line.
const lineOrder = (cells) => {
  const inCage = new Set(cells);
  const nbrs = (c) => graph.neighbours(c).filter(n => inCage.has(n));
  if (cells.some(c => nbrs(c).length > 2)) {
    throw new Error(`cage branches, so it is not one cell wide: ${cells}`);
  }
  const ends = cells.filter(c => nbrs(c).length === 1);
  if (ends.length !== 2) throw new Error(`cage is not a single line: ${cells}`);
  const order = [ends[0]];
  while (order.length < cells.length) {
    const prev = order[order.length - 2];
    const next = nbrs(order[order.length - 1]).find(n => n !== prev);
    if (next === undefined) break;
    order.push(next);
  }
  if (order.length !== cells.length) {
    throw new Error(`cage line does not cover the cage: ${cells}`);
  }
  return order;
};

// The clue's letters are unknown digits, while Lunchbox needs a literal total,
// so each cage is a disjunction over the values its clue could spell: one
// branch per digit assignment to the clue's letters, pinning those letters and
// applying the sandwich sum they spell.  Different letters are different
// digits, so a two-letter clue's digits differ.  The sandwiched digits are
// distinct and lie strictly between the line's smallest and largest digit, so
// they can total at most 2+3+4+5+6+7+8 = 35 and larger spellings are dropped.
const MAX_SANDWICH = 35;
const digits = [...Array(9).keys()].map(i => i + 1);
const clueSpellings = (clue) => (
  clue.length === 1
    ? digits.map(d => ({ sum: d, given: [[clue, d]] }))
    : digits.flatMap(
      tens => digits.filter(units => units !== tens).map(
        units => ({
          sum: 10 * tens + units,
          given: [[clue[0], tens], [clue[1], units]],
        })))
).filter(({ sum }) => sum <= MAX_SANDWICH);

const sandwich = ({ clue, cells }) => new Or(
  clueSpellings(clue).map(({ sum, given }) => new And([
    ...given.map(([letter, digit]) => new Given(KEY_CELL[letter], digit)),
    new Lunchbox(sum, ...lineOrder(cells)),
  ])));

return [
  new Shape('9x9'),

  // Each letter stands for a unique digit.  The nine letters are drawn once
  // each in row 1, whose Sudoku row constraint already makes those nine cells
  // distinct, so no further constraint is needed for that half of the rule.
  // The other half: a repeated letter is the same digit wherever it is drawn.
  ...REPEATED_LETTERS.map(
    ([letter, cell]) => new SameValues(2, KEY_CELL[letter], cell)),

  // Digits cannot repeat in cages, and each cage's clue is its sandwich sum.
  ...CAGES.map(({ cells }) => new AllDifferent(...cells)),
  ...CAGES.map(sandwich),
];
