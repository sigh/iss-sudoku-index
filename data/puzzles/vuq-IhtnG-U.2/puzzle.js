// Title: Diagonal Outside Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=vuq-IhtnG-U
// Source: https://tinyurl.com/rrx2r6u7

// Normal Sudoku Rules Apply (default row/column/box all-different from
// Shape('9x9')). Every one of the 20 outside-grid arrows is drawn as a short
// shaft at a 45-degree angle, entering the grid and running along a
// diagonal (not perpendicular to the border it sits next to) -- this is
// what the title "Diagonal Outside Sudoku" names. The rules text: "Clues
// outside the grid give digits that must appear in the first three cells in
// the direction of the arrow" then applies along that diagonal.
//
// 4 of the 20 arrows sit at a grid corner and run the full main or
// anti-diagonal. The other 16 sit beside a row or column border partway
// along an edge and run a shorter diagonal parallel to one of those two;
// each one's entry cell is one cell further along the border than the grid
// line its text label is printed beside -- e.g. the label nearest column 1
// on the top edge marks a shaft that actually enters at R1C2, continuing
// R2C3, R3C4, not a shaft straight down column 1. (The border-adjacent
// label position is where a 45-degree shaft's own centre-line, extended
// outward, crosses the border -- not where the shaft touches the border;
// only the shaft's touch point and angle, not the label's column/row band,
// fix the true diagonal.)
//
// Where a clue's two digits are the same (e.g. "11"), the encoding requires
// that digit twice among the three cells, per the shown digit's repetition
// -- unlike a straight row/column lane, a diagonal is not itself
// all-different, so two occurrences among three cells is possible, and
// every doubled clue below is satisfied by exactly two occurrences.
//
// No other lines, cages, or givens are drawn; the grid's bold box-divider
// lines and outer border are plain decoration and are not encoded.

// Each outside clue: entry cell (first cell of the diagonal, nearest the
// border) and (rowStep, colStep) direction, transcribed from the drawn
// arrowhead shaft at each of the 20 marked positions, paired with the
// two-digit clue text drawn next to it.
const outsideClues = [
  // Top edge and top-left corner: shafts run down-right (+1, +1).
  [[1, 1], [1, 1], '67'], // top-left corner, main diagonal
  [[1, 2], [1, 1], '11'],
  [[1, 3], [1, 1], '22'],
  [[1, 5], [1, 1], '47'],
  [[1, 7], [1, 1], '29'],
  // Right edge and top-right corner: shafts run down-left (+1, -1).
  [[1, 9], [1, -1], '78'], // top-right corner, anti-diagonal
  [[2, 9], [1, -1], '33'],
  [[3, 9], [1, -1], '44'],
  [[5, 9], [1, -1], '59'],
  [[7, 9], [1, -1], '49'],
  // Left edge and bottom-left corner: shafts run up-right (-1, +1).
  [[9, 1], [-1, 1], '34'], // bottom-left corner, anti-diagonal
  [[3, 1], [-1, 1], '89'],
  [[5, 1], [-1, 1], '29'],
  [[7, 1], [-1, 1], '88'],
  [[8, 1], [-1, 1], '77'],
  // Bottom edge and bottom-right corner: shafts run up-left (-1, -1).
  [[9, 9], [-1, -1], '23'], // bottom-right corner, main diagonal
  [[9, 3], [-1, -1], '69'],
  [[9, 5], [-1, -1], '27'],
  [[9, 7], [-1, -1], '66'],
  [[9, 8], [-1, -1], '55'],
];

return [
  new Shape('9x9'),
  ...outsideClues.map(([[row, col], [dRow, dCol], text]) => {
    const cells = [0, 1, 2].map(
      i => makeCellId(row + i * dRow, col + i * dCol));
    return new ContainAtLeast(text.split('').join('_'), ...cells);
  }),
];
