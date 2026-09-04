// Title: Mozart's Sandwich Sudoku
// Author: Dubax
// Video: https://www.youtube.com/watch?v=rKni4EgjQ2M
// Source: https://cracking-the-cryptic.web.app/sudoku/RmQ76tpBH8

// Standard 9x9 sudoku (rows/columns/3x3 boxes all-different -- ISS default),
// no givens.
// Outside numbers: sum of the digits strictly between the 1 and the 9 in
// that row/column -> Sandwich, one per clued lane (row clues on all nine
// rows; column clues only on C1, C2, C4, C5, C7, C9 -- C3/C6/C8 carry no
// clue and get no constraint).
// Mozart's birth (1756) and death (1791) years: each is placed as its four
// digits, in order, down a diagonal run of four cells somewhere in the grid,
// at a position the rules text says is "to be discovered" (not fixed by any
// drawn clue). The rules give the reading direction as "downwards" (row
// increasing along the run) but do not say
// whether the column also increases or decreases along the run, so both
// diagonal directions are offered as candidates for each year, independently
// of one another and of the other year's placement.

const graph = cellGraph('9x9');

// Row clues, printed to the left of each row; provenance: the outside-clue
// overlays in the source payload, one per row.
const ROW_CLUES = { 1: 9, 2: 29, 3: 18, 4: 25, 5: 24, 6: 0, 7: 11, 8: 3, 9: 7 };
// Column clues, above the column -- C3, C6, C8 have none.
const COL_CLUES = { 1: 0, 2: 18, 4: 24, 5: 0, 7: 11, 9: 12 };

const sandwiches = [
  ...Object.entries(ROW_CLUES).map(([r, v]) =>
    Sandwich.fromCells(v, graph.row(Number(r)), cellGeometry('9x9'))),
  ...Object.entries(COL_CLUES).map(([c, v]) =>
    Sandwich.fromCells(v, graph.column(Number(c)), cellGeometry('9x9'))),
];

// -- Mozart's birth/death years, diagonal run at an unknown position -------
// A run is 4 cells starting at (r, c) and stepping (1, dCol) three times;
// dCol=1 is down-right, dCol=-1 is down-left. Enumerate every start whose
// full 4-cell run stays on the 9x9 board.
function diagonalRuns(dCol) {
  const runs = [];
  for (let r = 1; r <= 6; r++) {
    const cMin = dCol === 1 ? 1 : 4;
    const cMax = dCol === 1 ? 6 : 9;
    for (let c = cMin; c <= cMax; c++) {
      runs.push(graph.ray(makeCellId(r, c), 1, dCol).slice(0, 4));
    }
  }
  return runs;
}
const ALL_RUNS = [...diagonalRuns(1), ...diagonalRuns(-1)];

// One Or per year: some run (either diagonal direction, any valid start)
// holds that year's four digits in order. Each branch pins all four of its
// cells, so it replays the choice on its own.
function yearSomewhere(digits) {
  return new Or(ALL_RUNS.map(cells => new And(
    cells.map((cell, i) => new Given(cell, digits[i])))));
}
const birthYear = yearSomewhere([1, 7, 5, 6]); // 1756
const deathYear = yearSomewhere([1, 7, 9, 1]); // 1791

return [
  new Shape('9x9'),
  ...sandwiches,
  birthYear,
  deathYear,
];
