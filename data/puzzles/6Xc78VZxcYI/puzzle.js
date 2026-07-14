// Title: Tinsel and Baubles
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=6Xc78VZxcYI
// Source: https://sudokupad.app/3l6bzhg2ji

// Normal sudoku rules apply. One given: R6C6=6.
//
// Six green tinsel strands (a decorative garland; the drawn path zig-zags
// cell-to-cell, some hops diagonal rather than orthogonal). "Adjacent digits
// on green tinsel have a difference of at least 5" is a German-whisper-style
// Whisper line (default difference 5) per strand, consecutive along the
// drawn path -- not restricted to orthogonally-adjacent cells.
//
// Five gold baubles (R4C4, R4C5, R4C6, R6C4, R6C5; none of them on a tinsel
// strand) each read: "the digit on a gold bauble indicates exactly how many
// times that digit appears on green tinsel", counted across all six strands
// combined. One NFA per bauble: the first read cell is the bauble (sets
// "target" to its own digit), then each of the 40 tinsel cells adds 1 to
// "count" when it matches target; accept iff count == target at the end.
// (A flat, unbroken cell list -- no nested segment arrays -- so this is a
// single-segment scan; no SEGMENT_BREAK handling needed.)

const TINSEL_LINES = [
  ['R7C1', 'R6C1', 'R6C2', 'R6C3', 'R5C3', 'R4C2', 'R4C1'],
  ['R3C5', 'R2C4', 'R1C5', 'R1C4', 'R2C3', 'R1C2', 'R2C1', 'R3C1', 'R3C2'],
  ['R7C5', 'R7C6', 'R8C7', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R8C2'],
  ['R9C9', 'R8C9', 'R7C9', 'R6C8', 'R6C7'],
  ['R3C8', 'R3C9', 'R4C9', 'R4C8', 'R5C7'],
  ['R2C8', 'R1C9', 'R1C8', 'R1C7', 'R1C6'],
];
const TINSEL_CELLS = TINSEL_LINES.flat();

const GOLD_BAUBLES = ['R4C4', 'R4C5', 'R4C6', 'R6C4', 'R6C5'];

const whisperLines = TINSEL_LINES.map(cells => new Whisper(...cells));

const baubleCountSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const hit = value === target ? 1 : 0;
    const next = count + hit;
    // Once count exceeds target it can never come back down: dead branch.
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, 9);

const baubleCounts = GOLD_BAUBLES.map(bauble =>
  new NFA(baubleCountSpec, 'baubleCount', bauble, ...TINSEL_CELLS));

return [
  new Shape('9x9'),
  new Given('R6C6', 6),
  ...whisperLines,
  ...baubleCounts,
];
