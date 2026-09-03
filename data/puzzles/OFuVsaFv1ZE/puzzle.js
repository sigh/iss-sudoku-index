// Title: FUll Rankillers
// Author: Las4one
// Video: https://www.youtube.com/watch?v=OFuVsaFv1ZE
// Source: https://sudokupad.app/kh62gdjsgt

// Rules.
//
// 1. Normal sudoku in the central 9x9. There are no given digits.
// 2. Full Rank. The 9 rows and 9 columns, each read in both directions, form 36
//    nine-digit numbers. Each cell of the ring outside the grid holds the rank,
//    1 to 36 in ascending order, of the number read from that cell along its row
//    or column.
// 3. Digits may not repeat within a cage. A cage's digits are the grid digits in
//    it together with the decimal digits of every rank clue in it, so a two-digit
//    rank blocks both of its digits: 11, 22 and 33 cannot appear in a cage, and
//    8 and 18 cannot share one. A rank's units digit may be 0 (ranks 10, 20, 30).
//
// Encoded: rule 1; rule 3 in full over the ranks as modelled below; and of rule 2
// the leading-digit block of every rank clue that lies in a cage.
//
// The leading-digit block. The first digit of each of the 36 numbers is the grid
// cell adjacent to its clue, so the 36 leading digits are row 1, row 9, column 1
// and column 9 taken once each: every digit 1-9 leads exactly four numbers. A
// number leading with d is therefore above the 4(d-1) numbers leading smaller and
// below the 4(9-d) leading larger, so its rank lies in 4d-3 .. 4d. This holds
// whatever convention breaks a tie, since a tie can only be inside one block.
//
// Omitted: which of the four ranks of its block each number takes -- the ordering
// among equal-leading-digit numbers, and with it the fact that the 36 ranks are
// all distinct. Ranks are modelled only for the 18 ring cells that lie in a cage;
// the other 18 ring cells enter no further rule.

// 0 is a rank digit but never a grid digit, so the alphabet is widened to 0-9 and
// the grid cells are pinned back to 1-9.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// Clue ids name the line and the reading direction: 'C3d' is column 3 read
// downwards (its clue sits above the grid), 'C3u' column 3 read upwards (clue
// below), 'R5r' row 5 read rightwards (clue to the left), 'R5l' row 5 read
// leftwards (clue to the right). A number's first digit is the grid cell nearest
// its clue.
const leadCell = (clue) => {
  const n = Number(clue[1]);
  switch (clue[2]) {
    case 'd': return makeCellId(1, n);
    case 'u': return makeCellId(9, n);
    case 'r': return makeCellId(n, 1);
    case 'l': return makeCellId(n, 9);
  }
};

// The six drawn cages, each as the rank clues and the grid cells it covers.
const CAGES = [
  { clues: ['C1d', 'C2d', 'C3d'], cells: ['R1C2', 'R2C2', 'R2C3', 'R3C2', 'R4C2'] },
  { clues: ['R2l', 'R3l', 'R4l'], cells: ['R2C8', 'R3C8', 'R3C9', 'R4C8', 'R4C9'] },
  { clues: ['R5r'], cells: [] },
  { clues: ['R9r', 'C1u', 'C2u', 'C3u', 'C4u'], cells: ['R9C1', 'R9C2'] },
  { clues: ['C5u', 'C6u', 'C7u'], cells: ['R8C4', 'R9C3', 'R9C4', 'R9C5'] },
  { clues: ['R8l', 'R9l', 'C8u'], cells: ['R8C6', 'R9C6', 'R9C7', 'R9C8', 'R9C9'] },
];

const CLUES = CAGES.flatMap(cage => cage.clues);
const index = clue => CLUES.indexOf(clue) + 1;

// One rank per modelled clue, held as its two decimal digits plus the offset
// within its leading-digit block. tens = 0 means a one-digit rank, which
// contributes only its units digit to a cage.
const tens = new Var('T', 'rank tens digit, 0 when the rank is one digit', CLUES.length);
const units = new Var('U', 'rank units digit', CLUES.length);
const offset = new Var('K', 'rank offset within its leading-digit block', CLUES.length);
const tensOf = clue => tens.cell(index(clue));
const unitsOf = clue => units.cell(index(clue));

// rank = 10*tens + units = 4*lead - 4 + offset, with offset in 1..4: the block
// derived above. units keeps the full 0-9 alphabet.
const rankBlocks = CLUES.map(clue => new Sum(
  4,
  [leadCell(clue), 4], [offset.cell(index(clue)), 1],
  [tensOf(clue), -10], [unitsOf(clue), -1]));

// A digit of a rank clue is compared with the other digits of its cage. The tens
// digit is only a digit when it is not 0; grid digits are 1-9, so the guard only
// ever matters against another rank digit (which may be 0).
const TENS_VS_DIGIT = Pair.fnToKey((t, d) => t === 0 || t !== d, shape);
const TENS_VS_TENS = Pair.fnToKey((a, b) => a === 0 || b === 0 || a !== b, shape);

const cageRules = CAGES.flatMap(({ clues, cells }) => {
  const tensCells = clues.map(tensOf);
  // Grid digits and units digits are always real digits, so one group covers
  // them; a clue's own units digit is included, which is the 11/22/33 case.
  const alwaysDigits = [...cells, ...clues.map(unitsOf)];
  return [
    ...(alwaysDigits.length > 1 ? [new AllDifferent(...alwaysDigits)] : []),
    ...tensCells.flatMap(t =>
      alwaysDigits.map(d => new Pair(TENS_VS_DIGIT, 'cage tens digit', t, d))),
    ...tensCells.flatMap((t, i) =>
      tensCells.slice(i + 1).map(o => new Pair(TENS_VS_TENS, 'cage tens digits', t, o))),
  ];
});

return [
  shape,
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  tens,
  units,
  offset,
  ...CLUES.map(clue => new Given(tensOf(clue), 0, 1, 2, 3)),
  ...CLUES.map(clue => new Given(offset.cell(index(clue)), 1, 2, 3, 4)),
  ...rankBlocks,
  ...cageRules,
];
