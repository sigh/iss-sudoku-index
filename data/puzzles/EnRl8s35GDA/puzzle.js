// Title: Staggered
// Author: the_cogito
// Video: https://www.youtube.com/watch?v=EnRl8s35GDA
// Source: https://app.crackingthecryptic.com/sudoku/86gH3brJJq

// Normal sudoku rules apply (standard 3x3 boxes, from the default Shape).
//
// Red cells in columns 1, 5 and 9 index (give) the column in which the
// digits 1, 5 and 9 respectively appear in their own row.
// `Indexing('C', cell)` on a cell in column C enforces exactly this: if the
// cell's value is V, then the cell at (same row, column V) holds the value
// C -- so a cell in column 1/5/9 with this constraint indexes digit 1/5/9
// respectively, matching the rule.
//
// "All possible red cells in columns 1, 5 and 9 are given" is an
// exhaustively-marked-clue rule (every row/column combination where the
// index property *could* hold is marked), so its unmarked cells carry a
// negative constraint: for a cell in column C with no red mark, its value V
// must NOT satisfy "column V of this row holds digit C" -- otherwise it
// would itself be a valid red cell that the puzzle chose not to draw.
// Encoded per unmarked cell as one `Given` (V = C is always self-defeating:
// it would require the cell itself, at column C, to hold C, which is what
// V = C already asserts) plus one negated `Pair` against each other column
// of the row.
//
// Purple lines: digits form a consecutive set (Renban), any order, no
// repeats.
// Green lines: adjacent digits differ by at least 5 (Whisper).
// A red index cell lying on a purple/green line (visible in the drawn art)
// is just a cell with two clues -- it does not split the line, since
// Renban/Whisper have no bulb/arm structure to split.

const ALL_ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const ALL_COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Rows carrying a drawn red index cell, per indexed column (from the
// drawn underlay positions).
const markedRows = { 1: [3, 5, 7], 5: [1, 4, 6, 9], 9: [2, 5, 8] };

const indexConstraints = [];
const negativeIndexConstraints = [];
for (const col of [1, 5, 9]) {
  for (const row of markedRows[col]) {
    indexConstraints.push(new Indexing('C', makeCellId(row, col)));
  }
  for (const row of ALL_ROWS) {
    if (markedRows[col].includes(row)) continue;
    const ctrl = makeCellId(row, col);
    // V = col is self-defeating (see comment above): forbid it outright.
    negativeIndexConstraints.push(
      new Given(ctrl, ...ALL_COLS.filter(v => v !== col)));
    for (const v of ALL_COLS) {
      if (v === col) continue;
      const target = makeCellId(row, v);
      const key = Pair.fnToKey((a, b) => !(a === v && b === col), 9);
      negativeIndexConstraints.push(
        new Pair(key, `not-index-C${col}`, ctrl, target));
    }
  }
}

const renbanLines = [
  ['R2C9', 'R3C9', 'R4C8', 'R5C9', 'R6C8', 'R7C9', 'R8C9'],
  ['R3C1', 'R4C2', 'R5C1', 'R6C2', 'R7C1'],
  ['R7C2', 'R8C2'],
  ['R3C3', 'R4C3'],
  ['R3C4', 'R4C4'],
  // Closed loop; Renban is set-based so the repeated first cell is omitted.
  ['R4C5', 'R5C4', 'R6C5', 'R5C6'],
];

const whisperLines = [
  ['R2C4', 'R1C5', 'R2C6'],
  ['R9C4', 'R9C5', 'R9C6'],
];

return [
  new Shape('9x9'),

  new Given('R2C2', 3),
  new Given('R5C5', 6),
  new Given('R7C7', 9),

  ...indexConstraints,
  ...negativeIndexConstraints,

  ...renbanLines.map(cells => new Renban(...cells)),
  ...whisperLines.map(cells => new Whisper(5, ...cells)),
];
