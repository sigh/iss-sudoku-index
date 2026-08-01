// Title: Setter's Day Off
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=tZd3StxpVzo
// Source: https://sudokupad.app/2g4pswdpxz

// Standard Sudoku. Set exactly one maximum-length straight clue of each requested
// type, avoiding the signature in R9C8 and R9C9: an east-pointing Arrow with its
// one-cell circle at the west end, a horizontal Thermometer, horizontal and vertical
// German Whispers lines, and a vertical Zipper. Choose one anti-chess rule, and put
// a 3 in at least one corner. The existing grey strokes are the signature, not clues.
const signature = new Set(['R9C8', 'R9C9']);
const cells = (row, col, length, vertical = false) =>
  Array.from({length}, (_, i) => makeCellId(row + (vertical ? i : 0), col + (vertical ? 0 : i)));
const clear = line => line.every(cell => !signature.has(cell));
const horizontal = (length, make) =>
  Array.from({length: 9}, (_, row) =>
    Array.from({length: 10 - length}, (_, col) => cells(row + 1, col + 1, length))
      .filter(clear).map(make)).flat();
const vertical = (length, make) =>
  Array.from({length: 10 - length}, (_, row) =>
    Array.from({length: 9}, (_, col) => cells(row + 1, col + 1, length, true))
      .filter(clear).map(make)).flat();
// These pair-sized all-different regions implement the selected anti-chess rule
// inside Or; ordinary Sudoku already supplies the orthogonal anti-king pairs.
const graph = cellGraph('9x9');
const antiKnight = graph.cells().flatMap(cell => [[1, 2], [2, 1], [1, -2], [2, -1]]
  .map(([dr, dc]) => graph.step(cell, dr, dc)).filter(Boolean)
  .map(other => new AllDifferent(cell, other)));
const antiKing = graph.cells().flatMap(cell => graph.kingNeighbours(cell)
  .filter(other => {
    const from = parseCellId(cell);
    const to = parseCellId(other);
    return to.row > from.row && to.col !== from.col;
  }).map(other => new AllDifferent(cell, other)));
const bishopDiagonals = [
  ...Array.from({length: 17}, (_, index) => {
      const line = [];
      for (let row = 1; row <= 9; row++) {
        const col = index + 2 - row;
        if (col >= 1 && col <= 9) line.push(makeCellId(row, col));
      }
      return line.length > 1 ? [new AllDifferent(...line)] : [];
  }).flat(),
  ...Array.from({length: 17}, (_, index) => {
    const line = [];
    for (let row = 1; row <= 9; row++) {
      const col = row + index - 8;
      if (col >= 1 && col <= 9) line.push(makeCellId(row, col));
    }
    return line.length > 1 ? [new AllDifferent(...line)] : [];
  }).flat(),
];

return [
  new Shape('9x9'),
  new Or(horizontal(4, line => new Arrow(...line))),
  new Or(horizontal(9, line => new Thermo(...line))),
  new Or(horizontal(8, line => new Whisper(5, ...line))),
  new Or(vertical(8, line => new Whisper(5, ...line))),
  new Or(vertical(9, line => new Zipper(...line))),
  new Or([new And(antiKnight), new And(antiKing), new And(bishopDiagonals)]),
  new ContainAtLeast('3', 'R1C1', 'R1C9', 'R9C1', 'R9C9'),
];
