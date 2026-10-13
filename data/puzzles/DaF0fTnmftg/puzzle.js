// Title: Kurotto (Aqre)
// Author: KNT
// Video: https://www.youtube.com/watch?v=DaF0fTnmftg
// Source: https://sudokupad.app/en96i1su3o?setting-conflictchecker=0

// Encode unshaded connectivity, no four equal shades in a row or column,
// and unshaded clue cells. Kurotto component totals, including ? and ??
// digit-length bounds, are omitted. 1 is unshaded; 2 is shaded.
const shape = new Shape('1x1', '1-2', 'Raw');
const cell = (r, c) => 'VS' + ((r - 1) * 15 + c);
// Drawn numbered and question-mark cells.
const clues = [[1, 7], [2, 5], [2, 10], [6, 3], [7, 12], [8, 9], [8, 14], [9, 11], [10, 12], [13, 3], [13, 5], [13, 11], [14, 13], [15, 3], [15, 5], [16, 10], [17, 13], [18, 7], [18, 14], [1, 11], [7, 2]];
const rows = Array.from({length: 18}, (_, r) =>
  Array.from({length: 15}, (_, c) => cell(r + 1, c + 1)));
const cols = Array.from({length: 15}, (_, c) =>
  Array.from({length: 18}, (_, r) => cell(r + 1, c + 1)));
// States remember the preceding shade and its run length; the fourth rejects.
const runSpec = NFA.encodeSpec({
  startState: {shade: 0, length: 0},
  transition: (s, v) => {
    const length = s.shade === v ? s.length + 1 : 1;
    if (length > 3) return undefined;
    return {shade: v, length};
  },
  accept: () => true,
}, shape);
return [
  shape,
  new Given(makeCellId(1, 1), 1),
  new Var('S', 'shading', '18x15'),
  ...clues.map(([r, c]) => new Given(cell(r, c), 1)),
  new ConnectedValues('VS', 1),
  ...rows.map(line => new NFA(runSpec, 'no four equal shades', ...line)),
  ...cols.map(line => new NFA(runSpec, 'no four equal shades', ...line)),
];
