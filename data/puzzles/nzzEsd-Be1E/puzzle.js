// Title: One up 9x9
// Author: Rodolfo Kurchan
// Video: https://www.youtube.com/watch?v=nzzEsd-Be1E
// Source: https://sudokupad.app/M2HhQFFGF8
//
// In each across and down segment of length N, place the digits 1 to N once
// each; a segment is a maximal run of playable cells within one row or
// column, already broken by the corner cut-outs and further subdivided by
// bars. There are no default row/column/box rules -- a row or column can
// (and does) hold two or three segments that repeat a digit between them --
// so this uses the Raw grid type and states every segment itself. Segments
// and domain limits are derived from the transcribed corner cut-out and bar
// geometry (`blocked`, `hBars`, `vBars` below) rather than hand-listed, so a
// wrong segment boundary is a one-line fix.

const shape = new Shape('9x9', '1-9', 'Raw');
const at = (r, c) => makeCellId(r, c);

// Corner cut-out cells (drawn as filled-black squares).
const blocked = new Set([
  [1, 1], [1, 2], [2, 1],
  [1, 8], [1, 9], [2, 9],
  [9, 9], [9, 8], [8, 9],
  [9, 2], [9, 1], [8, 1],
].map(([r, c]) => `${r},${c}`));

// Bar walls (drawn as black thickness-5 edge paths). Each entry separates
// the two cells named; one drawn line bends into an L and so contributes
// two of these.
// Horizontal bar: wall between column c and c+1 within row r.
const hBars = new Set([
  [1, 4], [5, 6], [5, 3], [4, 2], [7, 4], [8, 5],
].map(([r, c]) => `${r},${c}`));
// Vertical bar: wall between row r and r+1 within column c.
const vBars = new Set([
  [2, 6], [5, 8], [5, 5], [5, 1], [6, 4], [3, 4],
].map(([r, c]) => `${r},${c}`));

const isPlayable = (r, c) => !blocked.has(`${r},${c}`);

// Split each row/column into segments at a cut-out or a bar.
function segmentsAlong(lineLen, isPlayableAt, isBarAt) {
  const segs = [];
  let cur = [];
  for (let i = 1; i <= lineLen; i++) {
    if (!isPlayableAt(i)) {
      if (cur.length) segs.push(cur);
      cur = [];
      continue;
    }
    cur.push(i);
    if (isBarAt(i)) {
      segs.push(cur);
      cur = [];
    }
  }
  if (cur.length) segs.push(cur);
  return segs;
}

const rowSegs = []; // rowSegs[r] = array of column-arrays
const colSegs = []; // colSegs[c] = array of row-arrays
for (let r = 1; r <= 9; r++) {
  rowSegs[r] = segmentsAlong(9, c => isPlayable(r, c), c => hBars.has(`${r},${c}`));
}
for (let c = 1; c <= 9; c++) {
  colSegs[c] = segmentsAlong(9, r => isPlayable(r, c), r => vBars.has(`${r},${c}`));
}

// Row/column segment length each playable cell belongs to.
const rowLenAt = {};
const colLenAt = {};
for (let r = 1; r <= 9; r++) {
  for (const seg of rowSegs[r]) for (const c of seg) rowLenAt[`${r},${c}`] = seg.length;
}
for (let c = 1; c <= 9; c++) {
  for (const seg of colSegs[c]) for (const r of seg) colLenAt[`${r},${c}`] = seg.length;
}

// One AllDifferent (no total, so Cage emits only the AllDifferent) per
// segment of length > 1; the value range is enforced separately below.
const segmentCages = [];
for (let r = 1; r <= 9; r++) {
  for (const seg of rowSegs[r]) {
    if (seg.length > 1) segmentCages.push(new Cage(0, ...seg.map(c => at(r, c))));
  }
}
for (let c = 1; c <= 9; c++) {
  for (const seg of colSegs[c]) {
    if (seg.length > 1) segmentCages.push(new Cage(0, ...seg.map(r => at(r, c))));
  }
}

// A cell in a length-Na row segment and a length-Nb column segment must
// hold a value in 1..min(Na, Nb): the row segment alone bars anything above
// Na, the column segment alone bars anything above Nb, and the two hold
// simultaneously. Combined with each segment's own AllDifferent above,
// pigeonhole over N cells from a domain of size N forces every segment onto
// exactly {1..N} -- this per-cell restriction is what turns "all-different"
// into "all-different using only 1..N". The longest segment on this grid is
// length 9, so no cell's domain needs restricting below the full 1-9 range.
const domainGivens = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    if (!isPlayable(r, c)) continue;
    const minLen = Math.min(rowLenAt[`${r},${c}`], colLenAt[`${r},${c}`]);
    if (minLen === 9) continue; // full 1-9 range already default
    const values = [];
    for (let v = 1; v <= minLen; v++) values.push(v);
    domainGivens.push(new Given(at(r, c), ...values));
  }
}

// Corner cut-out cells are not part of the puzzle: pin them so they do not
// contribute free degrees of freedom (they join no segment or AllDifferent
// group under the Raw grid type, so nothing else constrains them).
const blockedGivens = [...blocked].map(rc => {
  const [r, c] = rc.split(',').map(Number);
  return new Given(at(r, c), 1);
});

// Puzzle givens (the drawn digits).
const givens = [
  [3, 2, 6], [3, 4, 3], [3, 7, 9], [4, 3, 6],
  [4, 8, 3], [5, 6, 3], [5, 7, 1], [7, 2, 3],
].map(([r, c, v]) => new Given(at(r, c), v));

return [
  shape,
  ...segmentCages,
  ...domainGivens,
  ...blockedGivens,
  ...givens,
];
