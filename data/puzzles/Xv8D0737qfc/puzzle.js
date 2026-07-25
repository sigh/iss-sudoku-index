// Title: Indifferent Neighbours!
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Xv8D0737qfc
// Source: https://sudokupad.app/i7jrq9g9oz

// Normal sudoku rules apply (standard 3x3 boxes). Cells a knight's move
// apart cannot repeat a digit (AntiKnight). In each 3x3 box, every
// horizontal run of 3 cells contains one digit from {1,2,3}, one from
// {4,5,6}, and one from {7,8,9} -- this is exactly Entropic's rule, applied
// per box-row so each triple is a "line" of exactly 3 cells (Entropic's
// pairwise "different third" check over 3 cells forces all three thirds to
// be present). A positive diagonal runs South-West to North-East; wherever
// normal sudoku rules (row/column/box) would allow two diagonal-adjacent
// cells to hold the same digit, they must. Diagonal neighbours never share
// a row or column, so the only way normal rules already forbid equality is
// a shared box -- those pairs get no constraint here, since the rule adds
// nothing to a pair that can't be equal anyway.

const box = (r, c) => Math.floor((r - 1) / 3) * 3 + Math.floor((c - 1) / 3);

// One Entropic triple per grid row per box-column-third (9 rows x 3
// thirds), i.e. every "horizontal threesome" named by the rules text.
const entropicTriples = [];
for (let r = 1; r <= 9; r++) {
  for (let third = 0; third < 3; third++) {
    entropicTriples.push([1, 2, 3].map(i => makeCellId(r, third * 3 + i)));
  }
}

// Positive-diagonal (SW->NE) neighbour pairs are (r,c)-(r-1,c+1). Keep only
// the pairs whose two cells sit in different boxes (per the rule's own
// worked example: r2c4/r3c3/r4c2 span boxes 2/1/4), then union same-box-free
// runs into maximal equal-value chains -- a chain can be longer than one
// pair, exactly as the rules text's r2c4/r3c3/r4c2 example shows.
const parent = new Map();
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) parent.set(`${r},${c}`, `${r},${c}`);
}
const find = (k) => {
  while (parent.get(k) !== k) { parent.set(k, parent.get(parent.get(k))); k = parent.get(k); }
  return k;
};
const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
for (let r = 2; r <= 9; r++) {
  for (let c = 1; c <= 8; c++) {
    if (box(r, c) !== box(r - 1, c + 1)) union(`${r},${c}`, `${r - 1},${c + 1}`);
  }
}
const groups = new Map();
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const root = find(`${r},${c}`);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push([r, c]);
  }
}
const equalChains = [...groups.values()]
  .filter(g => g.length > 1)
  .map(g => g.sort((a, b) => a[0] - b[0]).map(([r, c]) => makeCellId(r, c)));

return [
  new Shape('9x9'),

  new Given('R1C1', 9),
  new Given('R1C9', 1),
  new Given('R2C5', 6),
  new Given('R5C2', 7),
  new Given('R5C8', 3),
  new Given('R8C5', 8),
  new Given('R9C1', 1),
  new Given('R9C9', 5),

  new AntiKnight(),

  ...entropicTriples.map(cells => new Entropic(...cells)),

  ...equalChains.map(cells => new SameValues(cells.length, ...cells)),
];
