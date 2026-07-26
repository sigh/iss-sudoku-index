// Title: Echolocation
// Author: Erin Toler
// Video: https://www.youtube.com/watch?v=yiuyt14UYD8
// Source: https://sudokupad.app/0vbqutu0cp

// Normal sudoku rules apply.
//
// Echo Lines (indigo): filled with a repeating sequence of different
// digits; the full sequence must appear at least twice along the line and
// must always repeat in its entirety.
//
// XV: digits separated by an X sum to 10, by a V sum to 5. Only marked
// pairs are constrained (the rules never claim every such pair is marked).
//
// Kropki Dots: digits separated by a black dot have a 2:1 ratio.

// An Echo line of length n is exactly some period-p sequence of p distinct
// digits (p >= 1), repeated whole n/p >= 2 times ("must always repeat in its
// entirety" rules out a partial trailing copy, so p must divide n). For each
// admissible p, cells at the same position mod p must share a value, and the
// p distinct positions within one period must be pairwise different.
function echoLine(cells) {
  const n = cells.length;
  const periods = [];
  for (let p = 1; p <= Math.floor(n / 2); p++) {
    if (n % p === 0) periods.push(p);
  }

  const branchConstraints = (p) => {
    const residueGroups = [];
    for (let j = 0; j < p; j++) {
      const group = [];
      for (let i = j; i < n; i += p) group.push(cells[i]);
      residueGroups.push(group);
    }
    const sameValueConstraints = residueGroups
      .filter((g) => g.length > 1)
      .map((g) => new SameValues(g.length, ...g));
    const reps = residueGroups.map((g) => g[0]);
    return [...sameValueConstraints, new AllDifferent(...reps)];
  };

  return [new Or(periods.map((p) => new And(branchConstraints(p))))];
}

// Echo lines, drawn as indigo strokes (source: lines[]).
const echoLines = [
  ['R5C2', 'R4C3', 'R3C4', 'R2C5'],
  ['R8C5', 'R7C6', 'R6C7', 'R5C8'],
  ['R7C8', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R3C8', 'R3C7', 'R3C6', 'R2C6'],
  ['R8C4', 'R7C4', 'R7C3', 'R7C2', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R3C2'],
];

// XV markers, small circled X/V glyphs on a shared cell edge (source: overlays[]).
const vPairs = [
  ['R5C1', 'R5C2'],
  ['R3C6', 'R3C7'],
];
const xPairs = [
  ['R7C5', 'R7C6'],
  ['R5C8', 'R5C9'],
  ['R6C3', 'R7C3'],
  ['R8C8', 'R9C8'],
  ['R2C2', 'R3C2'],
  ['R2C9', 'R3C9'],
];

// Black (Kropki) dots on a shared cell edge (source: overlays[]).
const blackDots = [
  ['R1C1', 'R1C2'],
  ['R1C2', 'R1C3'],
  ['R9C6', 'R9C7'],
];

return [
  new Shape('9x9'),

  ...echoLines.flatMap(echoLine),

  ...vPairs.map((cells) => new V(...cells)),
  ...xPairs.map((cells) => new X(...cells)),

  ...blackDots.map((cells) => new BlackDot(...cells)),
];
