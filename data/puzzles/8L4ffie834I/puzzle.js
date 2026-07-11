// Title: Schrodinger's Carry-on
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=8L4ffie834I
// Source: https://sudokupad.app/james-sinclair/schrodingers-carry-on

// 6x6, digits 0-6. Each row/column/box holds 0-6 once each across its six
// cells, so exactly one cell per group is a "Schrodinger" cell holding two
// digits. A cell's value is the sum of its digit(s). Index cells (columns 1-2)
// point at where their column-number value sits in the row; four arrows sum
// cell values into a circle.
//
// Model. Two overlays sit on top of the main 6x6 grid:
//   A  = the main grid cell, ISS value v = digit (v-1). Restricted to 0-6.
//   VB = the cell's second digit when it is a Schrodinger cell, else sentinel
//        8 ("no second digit").
//   VV = the cell's value + 1 (so ISS value 1 == puzzle value 0). Tied to A,VB.
// The alphabet is extended to 8 (for VB's sentinel) and 13 (VV can reach a
// digit-sum of 11 -> value+1 = 12). Playable cells are restricted back to their
// true ranges with Given candidate lists.

const M = 13;               // extended value range (covers VV up to value 11)
const SENTINEL = 8;         // VB value meaning "this cell has no second digit"
const g = cellGraph('6x6');
const VBo = g.makeOverlay('VB');   // second digit
const VVo = g.makeOverlay('VV');   // cell value + 1
const cid = (r, c) => makeCellId(r, c);
const b = cell => VBo.at(cell);
const v = cell => VVo.at(cell);
const cells = [];
for (let r = 1; r <= 6; r++) for (let c = 1; c <= 6; c++) cells.push([r, c]);

// Group rule: the six A digits plus the one non-sentinel VB cover 0-6 exactly
// once. Scanning [A,VB,A,VB,...] and setting one bit per digit, the six A cells
// (never sentinel) contribute six distinct bits; reaching all seven bits forces
// exactly one VB to be non-sentinel -- i.e. exactly one Schrodinger cell that
// supplies the missing seventh digit. No extra "double placed" flag is needed.
const groupNFA = NFA.encodeSpec({
  startState: 0,
  transition: (mask, x) => {
    if (x === SENTINEL) return mask;
    const bit = 1 << (x - 1);
    if (mask & bit) return undefined;   // digit already present in this group
    return mask | bit;
  },
  accept: mask => mask === 127,          // all of 0-6 present
}, SENTINEL);

// Value tie over [A, VB, VV]: VV == A when normal, A + VB - 1 when Schrodinger.
const valNFA = NFA.encodeSpec({
  startState: null,
  transition: (s, x) => {
    if (s === null) return { a: x };
    if (s.b === undefined) return { a: s.a, b: x };
    const want = s.b === SENTINEL ? s.a : s.a + s.b - 1;
    return { ok: x === want };
  },
  accept: s => s !== null && s.ok === true,
}, M);

// Index rule for index-cell column X (1 or 2), scanning a row's six VV cells in
// column order. Let Y be the index cell's value (VV-1, forced to 0-6). If Y>=1
// the cell in column Y must have value X; if Y==0 the value X is absent from the
// row. pos is clamped so compilation stays bounded to the six real cells.
function indexNFA(X) {
  return NFA.encodeSpec({
    startState: { pos: 1, y: -1, tveq: null, col1eq: false, cnt: 0 },
    transition: (s, x) => {
      const st = { pos: Math.min(s.pos + 1, 7), y: s.y, tveq: s.tveq, col1eq: s.col1eq, cnt: s.cnt };
      if (s.pos === 1 && X === 2) st.col1eq = (x === X + 1);
      if (s.pos === X) { if (x < 1 || x > 7) return undefined; st.y = x - 1; }  // index value 0-6
      if (st.y >= 1 && st.y <= 6 && s.pos === st.y) st.tveq = (x === X + 1);
      if (x === X + 1) st.cnt = 1;       // value X seen in this row
      return st;
    },
    accept: s => {
      const y = s.y;
      if (y === 0) return s.cnt === 0;   // value X does not appear in the row
      if (y < 1 || y > 6) return false;
      const tv = (X === 2 && y === 1) ? s.col1eq : s.tveq;
      return tv === true;                // cell in column Y has value X
    },
  }, M);
}
const idx1 = indexNFA(1), idx2 = indexNFA(2);

// Pair-distinctness: no two Schrodinger cells share the same unordered digit
// pair. One NFA per possible pair scans [A,VB,...] over all 36 cells and dies if
// that pair occurs twice.
function pairNFA(lo, hi) {
  return NFA.encodeSpec({
    startState: { a: 0, cnt: 0 },
    transition: (s, x) => {
      if (s.a === 0) return { a: x, cnt: s.cnt };
      let match = false;
      if (x !== SENTINEL) {
        const p = Math.min(s.a - 1, x - 1), q = Math.max(s.a - 1, x - 1);
        if (p === lo && q === hi) match = true;
      }
      const cnt = s.cnt + (match ? 1 : 0);
      if (cnt > 1) return undefined;
      return { a: 0, cnt };
    },
    accept: () => true,
  }, SENTINEL);
}

const constraints = [new Shape('6x6', M), VBo.toVar('second digit'), VVo.toVar('cell value')];

// Domains: A digits 0-6; VB digit or sentinel; VV value+1 (index cells <= value 6).
for (const [r, c] of cells) constraints.push(new Given(cid(r, c), 1, 2, 3, 4, 5, 6, 7));
for (const [r, c] of cells) constraints.push(new Given(b(cid(r, c)), 1, 2, 3, 4, 5, 6, 7, 8));
for (const [r, c] of cells) {
  const hi = (c <= 2) ? 7 : M;           // index cells (cols 1-2): value <= 6
  const dom = []; for (let x = 1; x <= hi; x++) dom.push(x);
  constraints.push(new Given(v(cid(r, c)), ...dom));
}

// Canonicalize the Schrodinger representation (second digit < first) so a pair
// {x,y} has a single A/VB encoding, removing an A<->VB swap symmetry.
const canonKey = Pair.fnToKey((a, x) => x === SENTINEL || x < a, M);
for (const [r, c] of cells) constraints.push(new Pair(canonKey, 'canon', cid(r, c), b(cid(r, c))));

// Value ties.
for (const [r, c] of cells) {
  constraints.push(new NFA(valNFA, 'val', cid(r, c), b(cid(r, c)), v(cid(r, c))));
}

// Group rules (row / column / box) over interleaved [A, VB].
const inter = list => list.flatMap(([r, c]) => [cid(r, c), b(cid(r, c))]);
for (let r = 1; r <= 6; r++) {
  const l = []; for (let c = 1; c <= 6; c++) l.push([r, c]);
  constraints.push(new NFA(groupNFA, `row${r}`, ...inter(l)));
}
for (let c = 1; c <= 6; c++) {
  const l = []; for (let r = 1; r <= 6; r++) l.push([r, c]);
  constraints.push(new NFA(groupNFA, `col${c}`, ...inter(l)));
}
for (const [br, r0] of [1, 3, 5].entries()) for (const [bc, c0] of [1, 4].entries()) {
  const l = [];
  for (let dr = 0; dr < 2; dr++) for (let dc = 0; dc < 3; dc++) l.push([r0 + dr, c0 + dc]);
  constraints.push(new NFA(groupNFA, `box${br}${bc}`, ...inter(l)));
}

// Index cells: all of columns 1 and 2, one machine each per row.
for (let r = 1; r <= 6; r++) {
  const row = []; for (let c = 1; c <= 6; c++) row.push(v(cid(r, c)));
  constraints.push(new NFA(idx1, `idx1r${r}`, ...row));
  constraints.push(new NFA(idx2, `idx2r${r}`, ...row));
}

// Pair-distinctness across the whole grid.
const allInter = inter(cells);
for (let lo = 0; lo <= 6; lo++) for (let hi = lo + 1; hi <= 6; hi++) {
  constraints.push(new NFA(pairNFA(lo, hi), `pair${lo}${hi}`, ...allInter));
}

// Arrows: sum of arm cell VALUES == circle VALUE. With VV = value + 1, the
// linear form is sum(VV_arm) - VV_bulb = (armLength - 1).
function arrow(bulb, arm) {
  constraints.push(new Sum(arm.length - 1, ...arm.map(v), [v(bulb), -1]));
}
arrow(cid(5, 1), [cid(4, 2), cid(3, 2), cid(2, 1)]);
arrow(cid(3, 3), [cid(4, 4), cid(3, 5)]);
arrow(cid(4, 5), [cid(3, 6), cid(2, 5)]);
arrow(cid(6, 6), [cid(5, 6), cid(4, 6)]);

return constraints;
