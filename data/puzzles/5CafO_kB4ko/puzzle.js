// Title: Self-determination
// Author: Stephane Bura
// Video: https://www.youtube.com/watch?v=5CafO_kB4ko
// Source: https://app.crackingthecryptic.com/sudoku/8L2Pmn44rp

// Digits 1-8 once each per row and per column; no box constraint (the rules
// text names only rows and columns). One given: R8C4 = 1.
//
// Self-referential rule: for every row r and every column c in 1..6 (so the
// domino at columns c, c+1 lies within the first 7 columns), read R = value
// at (r, c) and C = value at (r, c+1); then cell (R, C) must hold the value
// r. R and C are always in 1..8, so (R, C) is always a real grid cell,
// including possibly one of the domino's own two cells.
//
// Encoding: one NFA per domino. Each NFA reads the domino's two cells first
// (recovering R, then C), then scans every one of the 64 grid cells in fixed
// row-major order and requires the (R, C)-th cell in that order to hold the
// value r; every other scanned cell is unconstrained. The state only needs a
// countdown to the target cell (0..63), plus 8 states while reading the first
// two symbols and one absorbing "already matched" state -- 74 states total,
// far under the compiled-state cap, regardless of the 64-target fan-out that
// a naive per-target-cell NFA would multiply against every domino.

const N = 8;

const allCellsRowMajor = [];
for (let row = 1; row <= N; row++) {
  for (let col = 1; col <= N; col++) {
    allCellsRowMajor.push(makeCellId(row, col));
  }
}

// r: the domino's own row (1..8) -- the value every matched target cell must
// hold.
function coordinateNFASpec(r) {
  return {
    startState: 'start',
    transition: (state, value) => {
      if (state === 'start') return `R${value}`;       // recorded R
      if (state[0] === 'R') {
        const R = Number(state.slice(1));
        const C = value;
        const target = N * (R - 1) + (C - 1);          // 0-based row-major index
        return `T${target}`;
      }
      if (state[0] === 'T') {
        const remaining = Number(state.slice(1));
        if (remaining === 0) {
          // This scanned cell is the (R, C) target: it must equal r.
          return value === r ? 'DONE' : undefined;
        }
        return `T${remaining - 1}`;
      }
      // state === 'DONE': already matched, rest of the scan is unconstrained.
      return 'DONE';
    },
    accept: (state) => state === 'DONE',
  };
}

const coordinateConstraints = [];
for (let r = 1; r <= N; r++) {
  for (let c = 1; c <= N - 2; c++) {
    const spec = coordinateNFASpec(r);
    const encoded = NFA.encodeSpec(spec, N);
    coordinateConstraints.push(new NFA(
      encoded, `coord-R${r}C${c}-C${c + 1}`,
      makeCellId(r, c), makeCellId(r, c + 1), ...allCellsRowMajor,
    ));
  }
}

return [
  new Shape('8x8'),
  new NoBoxes(),
  new Given('R8C4', 1),
  ...coordinateConstraints,
];
