// Title: Avoiding a Disaster
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=Kga0LoNOJpI
// Source: https://cracking-the-cryptic.web.app/sudoku/q7Jbtm6PmR

// Normal sudoku rules apply; no given digits, default 3x3 boxes.
//
// For a row/column carrying an outside-clue pair, A and B are its first two
// cells reading away from the clue (left-to-right for a row, top-to-bottom
// for a column). The clue nearer the grid ("A+B" legend) is A+B. The clue
// farther out ("Ath+Bth" legend) uses A's and B's own values as 1-indexed
// positions back into that same row/column and sums the two digits found
// there. Both sums are shown as one O(dd)/E(ven) letter per digit of the
// sum's decimal writing (most-significant first): a single letter for a
// 3-9 sum, two letters for a 10-17 sum. Not every row/column has this pair:
// all 9 rows do; only columns 1-6 do.

// One O/E letter per digit of `sum`'s decimal representation must match
// `code` (e.g. code "OE" requires a two-digit sum whose tens digit is odd
// and units digit is even).
function sumCodeMatches(code) {
  return sum => {
    const s = String(sum);
    if (s.length !== code.length) return false;
    for (let i = 0; i < code.length; i++) {
      const oddWanted = code[i] === 'O';
      if ((Number(s[i]) % 2 === 1) !== oddWanted) return false;
    }
    return true;
  };
}

const rowCells = r => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const colCells = c => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));

// [white A+B code, grey Ath+Bth code] per row/column, grouped by nearness to
// the grid, from the outside-clue overlays. Not every row/column has a pair:
// all 9 rows do; only columns 1-6 do (7-9 carry no outside clue).
const ROW_CLUES = {
  1: ['OO', 'OO'], 2: ['OO', 'E'], 3: ['OO', 'OE'],
  4: ['O', 'OO'], 5: ['O', 'OE'], 6: ['OO', 'OE'],
  7: ['E', 'OO'], 8: ['E', 'E'], 9: ['E', 'OE'],
};
const COL_CLUES = {
  1: ['E', 'O'], 2: ['OE', 'O'], 3: ['OO', 'OE'],
  4: ['O', 'OE'], 5: ['OO', 'OO'], 6: ['OE', 'E'],
};

// ValueIndexing(valueCell, controlCell, ...cells) forces valueCell to equal
// cells[value(controlCell) - 1] -- "the digit in the position named by
// controlCell's own value". Verified against a small accept/reject fixture
// (Ath/Bth dereference is a custom construction, not obvious from
// ValueIndexing's arrow-themed DESCRIPTION).
//
// One Ath/Bth Var per lane that has a clue pair: rows use prefixes RA/RB,
// columns CA/CB.
const rowAth = new Var('RA', 'row Ath digit', 9);
const rowBth = new Var('RB', 'row Bth digit', 9);
const colAth = new Var('CA', 'col Ath digit', 6);
const colBth = new Var('CB', 'col Bth digit', 6);

const laneConstraints = (n, [nearCode, farCode], cells, athVar, bthVar) => {
  const [A, B] = cells;
  const athCell = athVar.cell(n);
  const bthCell = bthVar.cell(n);
  return [
    new Pair(
      Pair.fnToKey((a, b) => sumCodeMatches(nearCode)(a + b), 9),
      `A+B ${athVar.prefix}${n}`, A, B),
    new ValueIndexing(athCell, A, ...cells),
    new ValueIndexing(bthCell, B, ...cells),
    new Pair(
      Pair.fnToKey((a, b) => sumCodeMatches(farCode)(a + b), 9),
      `Ath+Bth ${athVar.prefix}${n}`, athCell, bthCell),
  ];
};

return [
  new Shape('9x9'),
  rowAth, rowBth, colAth, colBth,
  ...Object.entries(ROW_CLUES).flatMap(
    ([r, codes]) => laneConstraints(+r, codes, rowCells(+r), rowAth, rowBth)),
  ...Object.entries(COL_CLUES).flatMap(
    ([c, codes]) => laneConstraints(+c, codes, colCells(+c), colAth, colBth)),
];
