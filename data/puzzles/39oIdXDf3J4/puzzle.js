// Title: Parity Paradox
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=39oIdXDf3J4
// Source: https://app.crackingthecryptic.com/sudoku/QR7MMGHpfJ

// Normal sudoku rules apply. Every 3x3 box has one or two same-total lines
// (deepskyblue): every line within a box sums to that box's total. Each
// box's total is not a printed number -- it is the digit(s) already in the
// grid at that box's yellow-shaded cell(s), read left to right (rules text:
// "2-digit yellow totals read from left to right"). A yellow cell may also
// be a cell of that box's own line; that overlap is real and not removed.
// The purple cell (R6C4) gives how many of the 9 box totals share its own
// parity (odd/even) with the purple cell's own digit.

function rowMajor(cells) {
  return [...cells].sort((a, b) => {
    const A = parseCellId(a);
    const B = parseCellId(b);
    return A.row - B.row || A.col - B.col;
  });
}

// Each box's same-total line(s) and yellow total marker cell(s), transcribed
// from the drawn line paths (`lines`) and yellow underlay positions
// (`underlays`) in the source payload.
const boxes = [
  {
    lines: [
      ['R1C3', 'R1C2', 'R2C1', 'R3C1'],
      ['R2C3', 'R3C3', 'R3C2'],
    ],
    marker: ['R3C2', 'R3C3'],
  },
  {
    lines: [
      ['R1C4', 'R2C4'],
      ['R3C4', 'R2C5', 'R3C6'],
    ],
    marker: ['R1C6'],
  },
  {
    lines: [
      ['R1C7', 'R2C8', 'R3C9'],
      ['R2C7', 'R3C8'],
    ],
    marker: ['R2C9'],
  },
  {
    lines: [
      ['R5C2', 'R4C1', 'R5C1', 'R6C1'],
      ['R4C3', 'R5C3', 'R6C3', 'R6C2'],
    ],
    marker: ['R5C2', 'R5C3'],
  },
  {
    lines: [
      ['R5C4', 'R5C5', 'R6C6'],
    ],
    marker: ['R4C5', 'R4C6'],
  },
  {
    lines: [
      ['R4C9', 'R4C8', 'R4C7', 'R5C7', 'R6C7', 'R6C8', 'R6C9'],
    ],
    marker: ['R5C8', 'R5C9'],
  },
  {
    lines: [
      ['R7C1', 'R8C2'],
      ['R8C3', 'R9C3', 'R9C2', 'R9C1', 'R8C1'],
    ],
    marker: ['R9C1', 'R9C2'],
  },
  {
    lines: [
      ['R8C6', 'R9C6', 'R9C5', 'R9C4', 'R8C4', 'R7C4', 'R7C5', 'R7C6'],
    ],
    marker: ['R8C5', 'R8C6'],
  },
  {
    lines: [
      ['R7C7', 'R7C8', 'R8C8'],
      ['R7C9', 'R8C9', 'R9C8', 'R9C7'],
    ],
    marker: ['R7C8', 'R7C9'],
  },
];

// Same-total lines: every line in a box sums to that box's yellow total.
// A 1-digit total is just the marker cell's own value, so one EqualSum
// across the line(s) and the marker cell covers both "same total across
// lines" and the marker tie at once. A 2-digit total (10*tens + units)
// can't be an EqualSum segment, so it needs a coefficient Sum tying one
// line to the total; a second line is tied to the first with its own
// EqualSum, and its total then follows by transitivity. Sum takes
// [cell, coeff] pairs and adds contributions rather than deduplicating, so
// a marker cell that is also one of the line's own cells (e.g. box
// R1-3C1-3's R3C2/R3C3 are the last two cells of its own second line) is
// still handled correctly.
const sameTotalSums = boxes.flatMap(({ lines, marker }) => {
  if (marker.length === 1) {
    return [new EqualSum(...lines, marker)];
  }
  const [tensCell, onesCell] = rowMajor(marker);
  const markerTie = new Sum(0, ...lines[0], [tensCell, -10], [onesCell, -1]);
  if (lines.length === 1) return [markerTie];
  return [new EqualSum(...lines), markerTie];
});

// A 2-digit total 10*tens + units is even exactly when units is, since the
// tens contribution is always even; a 1-digit total's own parity is its
// only cell. So every box total's parity equals the parity of its
// rightmost marker cell -- scan those 9 cells directly instead of the
// concatenated totals.
const totalUnitsCells = boxes.map(({ marker }) => rowMajor(marker).at(-1));

// NFA: the first cell (purple) sets both the target parity and the target
// count (its own digit); each following cell then either matches that
// parity or doesn't. Accept iff the running count equals the purple digit.
const parityCountSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const hit = (value % 2 === target % 2) ? 1 : 0;
    return { target, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ target, count }) => target !== null && count === target,
  maxDepth: 10,
}, 9);

return [
  new Shape('9x9'),
  ...sameTotalSums,
  new NFA(parityCountSpec, 'purpleParityCount', 'R6C4', ...totalUnitsCells),
];
