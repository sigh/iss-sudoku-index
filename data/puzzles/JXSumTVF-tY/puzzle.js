// Title: One Up 200
// Author: Rodolfo Kurchan
// Video: https://www.youtube.com/watch?v=JXSumTVF-tY
// Source: https://sudokupad.app/6NGhrFnQ9p
//
// In each across and down segment of length N, place the digits 1 to N once
// each; a segment is a maximal run of playable cells within one row or
// column, already broken by the corner cut-outs and further subdivided by
// bars. Digit 10 is played as the symbol "0"; every other digit is its own
// symbol. Bars and corner cut-outs are drawn geometry, transcribed below;
// segments are then derived from them rather than hand-listed. There are no
// default row/column/box rules -- a row or column can (and does) hold two
// segments that repeat a digit between them -- so this uses the Raw grid
// type and states every segment itself. The decorative "10" text overlay at
// R6C6 carries no rule and is not encoded.

const shape = new Shape('10x10', '0-9', 'Raw');
const at = (r, c) => makeCellId(r, c);

// Corner cut-out cells (drawn as filled-black squares).
const blocked = new Set([
  [1, 1], [1, 2], [2, 1],
  [1, 9], [1, 10], [2, 10],
  [9, 10], [10, 10], [10, 9],
  [10, 1], [10, 2], [9, 1],
].map(([r, c]) => `${r},${c}`));

// Bar walls (drawn as black thickness-5 edge paths). Each entry
// separates the two cells named; one drawn line bends into an L and so
// contributes two of these.
// Horizontal bar: wall between column c and c+1 within row r.
const hBars = new Set([
  [2, 5], [4, 5], [5, 7], [8, 6], [8, 3],
].map(([r, c]) => `${r},${c}`));
// Vertical bar: wall between row r and r+1 within column c.
const vBars = new Set([
  [3, 5], [3, 7], [6, 7], [5, 4], [5, 2],
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
for (let r = 1; r <= 10; r++) {
  rowSegs[r] = segmentsAlong(10, c => isPlayable(r, c), c => hBars.has(`${r},${c}`));
}
for (let c = 1; c <= 10; c++) {
  colSegs[c] = segmentsAlong(10, r => isPlayable(r, c), r => vBars.has(`${r},${c}`));
}

// Row/column segment length each playable cell belongs to.
const rowLenAt = {};
const colLenAt = {};
for (let r = 1; r <= 10; r++) {
  for (const seg of rowSegs[r]) for (const c of seg) rowLenAt[`${r},${c}`] = seg.length;
}
for (let c = 1; c <= 10; c++) {
  for (const seg of colSegs[c]) for (const r of seg) colLenAt[`${r},${c}`] = seg.length;
}

// One AllDifferent (no total, so Cage emits only the AllDifferent) per
// segment of length > 1; the value range is enforced separately below.
const segmentCages = [];
for (let r = 1; r <= 10; r++) {
  for (const seg of rowSegs[r]) {
    if (seg.length > 1) segmentCages.push(new Cage(0, ...seg.map(c => at(r, c))));
  }
}
for (let c = 1; c <= 10; c++) {
  for (const seg of colSegs[c]) {
    if (seg.length > 1) segmentCages.push(new Cage(0, ...seg.map(r => at(r, c))));
  }
}

// A cell in a length-Na row segment and a length-Nb column segment must
// hold a value in 1..min(Na, Nb): the row segment alone bars anything above
// Na, the column segment alone bars anything above Nb, and the two hold
// simultaneously. Digit 10 is the symbol "0"; digits 1-9 are their own
// symbol, so the value set only ever needs "0" when the minimum is 10 (both
// segments full length) and never otherwise. Combined with each segment's
// own AllDifferent above, pigeonhole over N cells from a domain of size N
// forces every segment onto exactly {1..N} -- this per-cell restriction is
// what turns "all-different" into "all-different using only 1..N".
const domainGivens = [];
for (let r = 1; r <= 10; r++) {
  for (let c = 1; c <= 10; c++) {
    if (!isPlayable(r, c)) continue;
    const minLen = Math.min(rowLenAt[`${r},${c}`], colLenAt[`${r},${c}`]);
    if (minLen === 10) continue; // full 0-9 range already default
    const values = [];
    for (let v = 1; v <= minLen; v++) values.push(v === 10 ? 0 : v);
    domainGivens.push(new Given(at(r, c), ...values));
  }
}

// Corner cut-out cells are not part of the puzzle: pin them so they do not
// contribute free degrees of freedom (they join no segment or AllDifferent
// group under the Raw grid type, so nothing else constrains them).
const blockedGivens = [...blocked].map(rc => {
  const [r, c] = rc.split(',').map(Number);
  return new Given(at(r, c), 0);
});

// Puzzle givens (the drawn digits).
const givens = [
  [1, 5, 3], [2, 4, 4], [3, 3, 9], [3, 7, 2], [4, 5, 4], [4, 6, 3],
  [5, 5, 5], [5, 7, 1], [5, 9, 3], [6, 4, 5], [7, 5, 7], [8, 7, 4],
  [9, 3, 6], [9, 5, 3], [10, 4, 4],
].map(([r, c, v]) => new Given(at(r, c), v));

// A 16th given: the cells[] value field holds one digit, so the setter placed
// digit 10 as a "10" text overlay at R6C6 instead -- a bare numeral drawn at a
// cell centre is a given the cells array cannot carry. Digit 10 is symbol "0".
const overlayGiven = new Given(at(6, 6), 0);

return [
  shape,
  ...segmentCages,
  ...domainGivens,
  ...blockedGivens,
  ...givens,
  overlayGiven,
];
