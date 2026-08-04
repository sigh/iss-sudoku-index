// Title: Jan. 9, 2023: Outside 234
// Author: clover!
// Video: https://www.youtube.com/watch?v=qSatXlZTaU0
// Source: https://tinyurl.com/46k56xnz
//
// Normal sudoku rules apply. Each digit printed by an outside clue must
// appear somewhere among the 2nd, 3rd, and 4th cells of that row/column,
// counting from the side the clue sits on -- so the cell touching the
// clue (the 1st cell) is excluded, unlike a standard outside clue. The
// rule is a presence check, not an ordering: it says nothing about which
// of the three cells holds which digit.

// One row per outside clue, as printed (side, 0-indexed row/column, and
// the printed digits). Transcribed from the text overlays at
// R0C3="123", R3C0="123", R0C7="456", R3C10="456", R1C0="345",
// R1C10="678", R5C0="234", R5C10="567", R10C5="456", R10C2="567",
// R10C8="189", R7C0="7", R7C10="8" (padded coordinates: row/col 0 and 10
// are the outside lanes, 1..9 the real grid, 1-indexed).
const OUTSIDE_CLUES = [
  { side: 'top', lane: 2, digits: '1_2_3' },
  { side: 'top', lane: 6, digits: '4_5_6' },
  { side: 'bottom', lane: 4, digits: '4_5_6' },
  { side: 'bottom', lane: 1, digits: '5_6_7' },
  { side: 'bottom', lane: 7, digits: '1_8_9' },
  { side: 'left', lane: 2, digits: '1_2_3' },
  { side: 'left', lane: 0, digits: '3_4_5' },
  { side: 'left', lane: 4, digits: '2_3_4' },
  { side: 'left', lane: 6, digits: '7' },
  { side: 'right', lane: 2, digits: '4_5_6' },
  { side: 'right', lane: 0, digits: '6_7_8' },
  { side: 'right', lane: 4, digits: '5_6_7' },
  { side: 'right', lane: 6, digits: '8' },
];

// The 2nd/3rd/4th cells of the addressed row/column, from the clue's
// side (1-indexed grid coordinates).
function affectedCells({ side, lane }) {
  const line = lane + 1;
  switch (side) {
    case 'top': return [2, 3, 4].map(r => makeCellId(r, line));
    case 'bottom': return [8, 7, 6].map(r => makeCellId(r, line));
    case 'left': return [2, 3, 4].map(c => makeCellId(line, c));
    case 'right': return [8, 7, 6].map(c => makeCellId(line, c));
  }
}

const outsideConstraints = OUTSIDE_CLUES.map(
  clue => new ContainAtLeast(clue.digits, ...affectedCells(clue)));

return [
  new Shape('9x9'),
  ...outsideConstraints,
];
