// Title: Welcome, 2025!
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=dxWhVbKCVXE
// Source: https://sudokupad.app/hr2psfhzcz

// Normal sudoku. Digits may not repeat within a cage (AllDifferent below).
// A cage with a total must be tiled by 1-, 2-, 3-, or 4-digit numbers -- runs
// of horizontally (left-to-right) or vertically (top-to-bottom) adjacent
// cage cells, a number cannot bend -- so that every cage digit is in exactly
// one number and the numbers sum to the total. A cage with no total is a
// plain all-different region (last rule sentence: the number rule only
// applies "if a cage contains a clue in the top left corner").
//
// Which cells group into which number is not given by the drawing, so each
// totalled cage is expressed as an Or over every legal way to tile its own
// cell list into straight, non-bending runs of length <= 4 -- enumerated
// below from the cage's cell list (geometry only, computed once per cage),
// not hand-listed. Each tiling becomes one Sum(total, ...) equation whose
// coefficients are the runs' place values (1, 10, 100, or 1000 per digit).
// Sum's own per-term coefficient is capped at +-100 (js/sudoku_constraint.js,
// Sum constructor), so a place value of 1000 is expressed by listing that
// cell ten times at coefficient 100 each -- 10*100 = 1000; Sum sums repeated
// [cell, coeff] entries rather than deduplicating them, so this is the same
// linear equation, not a different one, and does not mean the digit is used
// in two numbers -- the tiling itself still places every cell in exactly one
// run.
//
// A tiling is only kept if its total range can reach the cage's target: a
// 9-cell all-different cage drawn from digits 1-9 must hold a permutation of
// 1-9, so a tiling's reachable min/max is fixed by pairing its place-value
// weights with 1..9 via the rearrangement inequality (largest weight with
// largest/smallest digit). Dropping a tiling whose [min,max] excludes the
// target removes no valid solution -- it is impossible under any digit
// assignment -- and keeps the Or short (2025 needs a 4-digit run in nearly
// every surviving tiling, so most short tilings are excluded this way).

function cellsFromIds(ids) {
  return ids.map(id => {
    const { row, col } = parseCellId(id);
    return { id, row, col };
  });
}

// Enumerate every way to tile `cells` (an array of {id,row,col}, all members
// of one cage) into disjoint straight runs of length 1-4, using only cells
// that are actually grid-adjacent in the cage (no crossing a gap). Returns
// an array of tilings; each tiling is an array of runs; each run is an
// ordered array of cell ids in reading order (left-to-right or top-to-bottom).
function enumerateTilings(cells) {
  const byPos = new Map(cells.map(c => [`${c.row},${c.col}`, c]));

  function runsContaining(cell, remaining) {
    const found = new Map(); // key -> {dir, cells}
    for (const dir of ['H', 'V']) {
      for (let length = 1; length <= 4; length++) {
        for (let offset = 0; offset < length; offset++) {
          const run = [];
          let ok = true;
          for (let i = 0; i < length; i++) {
            const row = dir === 'V' ? cell.row - offset + i : cell.row;
            const col = dir === 'H' ? cell.col - offset + i : cell.col;
            const c = byPos.get(`${row},${col}`);
            if (!c || !remaining.has(c)) { ok = false; break; }
            run.push(c);
          }
          if (ok) {
            const tag = length === 1 ? 'S' : dir;
            const key = tag + ':' + run.map(c => c.id).join(',');
            found.set(key, { tag, run });
          }
        }
      }
    }
    return [...found.values()];
  }

  const tilings = [];
  function recurse(remaining, acc) {
    if (remaining.size === 0) {
      tilings.push(acc.map(r => r.run.map(c => c.id)));
      return;
    }
    // Canonical next cell: smallest (row, col) among what's left, so each
    // tiling is generated exactly once.
    let next = null;
    for (const c of remaining) {
      if (next === null || c.row < next.row || (c.row === next.row && c.col < next.col)) next = c;
    }
    for (const { run } of runsContaining(next, remaining)) {
      const nextRemaining = new Set(remaining);
      for (const c of run) nextRemaining.delete(c);
      acc.push({ run });
      recurse(nextRemaining, acc);
      acc.pop();
    }
  }
  recurse(new Set(cells), []);
  return tilings;
}

// [cell, coeff] entries for one tiling's Sum, splitting any |coeff| > 100
// into repeated <=100 chunks (see header).
function sumEntriesForTiling(tiling) {
  const entries = [];
  for (const run of tiling) {
    const n = run.length;
    run.forEach((id, i) => {
      let coeff = Math.pow(10, n - 1 - i);
      while (coeff > 100) {
        entries.push([id, 100]);
        coeff -= 100;
      }
      if (coeff > 0) entries.push([id, coeff]);
    });
  }
  return entries;
}

function feasibleRange(tiling) {
  const weights = [];
  for (const run of tiling) {
    const n = run.length;
    for (let i = 0; i < n; i++) weights.push(Math.pow(10, n - 1 - i));
  }
  weights.sort((a, b) => b - a);
  let min = 0, max = 0;
  for (let i = 0; i < weights.length; i++) {
    max += weights[i] * (9 - i);      // largest weight with largest digit
    min += weights[i] * (i + 1);      // largest weight with smallest digit
  }
  return { min, max };
}

function numberCage(cellIds, total) {
  const cells = cellsFromIds(cellIds);
  const tilings = enumerateTilings(cells);
  const options = tilings
    .filter(t => {
      const { min, max } = feasibleRange(t);
      return min <= total && total <= max;
    })
    .map(t => new Sum(total, ...sumEntriesForTiling(t)));
  return [new AllDifferent(...cellIds), new Or(options)];
}

const cageA = ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C1', 'R3C1'];
const cageB = ['R4C1', 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C1'];
const cageC = ['R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'];
const cageD = ['R1C8', 'R2C6', 'R2C8', 'R3C5', 'R3C6', 'R3C8', 'R4C6', 'R4C7', 'R4C8'];
// Cage E carries no top-left total, so only the all-different rule applies.
const cageE = ['R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C8'];

return [
  new Shape('9x9'),
  ...numberCage(cageA, 2025),
  ...numberCage(cageB, 2025),
  ...numberCage(cageC, 2025),
  ...numberCage(cageD, 2025),
  new AllDifferent(...cageE),
];
