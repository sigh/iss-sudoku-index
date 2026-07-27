// Title: Puzzle No. 472: Arrow-Skyscraper Hybrid Sudoku
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=sJwCehrHd3A
// Source: https://sudokupad.app/camq2k6xqo

// Normal Sudoku rules apply. Digits along each arrow sum to the digit in its
// circled cell; digits may repeat along an arrow. Each grid digit is a
// skyscraper height; each digit outside the grid is the count of skyscrapers
// visible from that direction, looking into the corresponding row/column
// (a taller building hides every shorter one behind it).
//
// The source draws a 1-cell ring of 36 outside-clue positions (9 per side)
// around the 9x9 play grid, but none carries a printed digit, text overlay,
// or cage/line value anywhere in the payload -- every outside clue must be
// derived by the solver, not read off the drawing. `outside` below is an
// auxiliary Var per position (`VO1`..`VO36`), and `skyscraperClues` ties each
// one to the standard visible-count identity for its row/column, computed by
// an NFA that reads the target first then scans the line: it tracks the
// running maximum and increments a count on every new maximum, accepting iff
// the final count equals the target. This lets the solver derive each
// outside digit from the grid instead of needing a given value.
//
// 6 of the 10 drawn arrows have their circled target, or part of their arm,
// land on one of these ring positions rather than a play-grid cell; the other
// 4 stay fully inside the grid. Rather than truncating those 6 arrows at the
// grid edge, each ring waypoint is the matching `outside` Var: the drawn path
// is encoded exactly as drawn, letting the arrow sum pin down that position's
// value together with the skyscraper identity above.

const outside = new Var('O', 'skyscraper outside-clue digit', 36);

// Position layout: idx 1-9 = top (by column), 10-18 = bottom (by column),
// 19-27 = left (by row), 28-36 = right (by row).
function topClue(col) { return outside.cell(col); }
function bottomClue(col) { return outside.cell(9 + col); }
function leftClue(row) { return outside.cell(18 + row); }
function rightClue(row) { return outside.cell(27 + row); }

function colCells(col) {
  return Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, col));
}
function rowCells(row) {
  return Array.from({ length: 9 }, (_, i) => makeCellId(row, i + 1));
}

// Reads [target, line[0], line[1], ...] with line[0] nearest the clue.
// Tracks the running maximum and counts each new maximum; accepts iff the
// final count equals the target read from the first cell.
const visibleCountSpec = {
  startState: { target: null, max: 0, count: 0 },
  transition({ target, max, count }, value) {
    if (target === null) return { target: value, max: 0, count: 0 };
    if (value > max) {
      const count2 = count + 1;
      if (count2 > target) return undefined;
      return { target, max: value, count: count2 };
    }
    return { target, max, count };
  },
  accept: ({ target, count }) => target !== null && count === target,
};
const visibleCountNFA = NFA.encodeSpec(visibleCountSpec, 9);

const skyscraperClues = [];
for (let col = 1; col <= 9; col++) {
  skyscraperClues.push(
    new NFA(visibleCountNFA, 'SkyscraperVisible', topClue(col), ...colCells(col)));
  skyscraperClues.push(
    new NFA(visibleCountNFA, 'SkyscraperVisible', bottomClue(col),
      ...[...colCells(col)].reverse()));
}
for (let row = 1; row <= 9; row++) {
  skyscraperClues.push(
    new NFA(visibleCountNFA, 'SkyscraperVisible', leftClue(row), ...rowCells(row)));
  skyscraperClues.push(
    new NFA(visibleCountNFA, 'SkyscraperVisible', rightClue(row),
      ...[...rowCells(row)].reverse()));
}

// Each entry starts with its circled bulb, followed by the arrow arm, in the
// drawn polyline's own order. Cell ids: `R#C#` for play-grid cells, or an
// `outside`-Var accessor for a ring waypoint -- provenance comment above.
const arrows = [
  ['R1C3', 'R2C2', 'R3C1', leftClue(4), 'R5C1', 'R6C2', 'R7C3', 'R6C4'],
  ['R2C3', 'R1C2', topClue(1)],
  ['R2C1', leftClue(2), 'R1C1'],
  ['R1C3', topClue(4), 'R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'],
  ['R2C5', 'R1C6', topClue(7), 'R1C8', topClue(9)],
  [rightClue(8), 'R7C9', 'R6C8'],
  [rightClue(8), 'R8C9', 'R8C8'],
  ['R9C9', bottomClue(9), rightClue(9)],
  [leftClue(6), 'R7C1'],
  ['R8C3', 'R9C4', bottomClue(5), 'R9C6', 'R8C7'],
].map(cells => new Arrow(...cells));

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  outside,
  ...skyscraperClues,
  ...arrows,
];
