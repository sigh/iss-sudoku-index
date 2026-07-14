// Title: Method to the Madness
// Author: Merdock
// Video: https://www.youtube.com/watch?v=zAmxsvR_tmc
// Source: https://sudokupad.app/753umuwjuz

// XV pair clues (not all given -- no negative constraint elsewhere).
const xClues = [
  ['R1C2', 'R2C2'],
  ['R7C8', 'R7C9'],
  ['R4C9', 'R5C9'],
  ['R8C8', 'R9C8'],
  ['R5C1', 'R6C1'],
];
const vClues = [
  ['R1C1', 'R2C1'],
  ['R7C7', 'R8C7'],
  ['R5C5', 'R6C5'],
];

// Howling Mad lines: each is exactly 3 cells, strictly horizontal or
// vertical, and (per the rules text) indicates a triple of digits that no
// "standard" line type -- Renban, Nabner, Parity, Entropy, Modular, Dutch
// Whisper, Region Sum -- could occupy. Cells are listed in the line's drawn
// direction (top-to-bottom or left-to-right).
const howlingMadLines = [
  ['R1C1', 'R2C1', 'R3C1'],
  ['R1C2', 'R2C2', 'R3C2'],
  ['R1C3', 'R2C3', 'R3C3'],
  ['R7C1', 'R7C2', 'R7C3'],
  ['R8C1', 'R8C2', 'R8C3'],
  ['R9C1', 'R9C2', 'R9C3'],
  ['R7C7', 'R8C7', 'R9C7'],
  ['R7C8', 'R8C8', 'R9C8'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R2C7', 'R2C8', 'R2C9'],
  ['R3C7', 'R3C8', 'R3C9'],
  ['R4C8', 'R5C8', 'R6C8'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R4C1', 'R5C1', 'R6C1'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R4C5', 'R4C6', 'R4C7'],
];

// "Given those rules, all lines are given": every other axis-aligned 3-cell
// window in the grid that does not overlap a placed Howling Mad line must
// itself be ineligible to be one -- i.e. it must satisfy some standard type,
// or duplicate a digit set already used by a placed line. Windows that
// overlap a placed line are automatically excluded by the "lines cannot
// overlap" rule and need no check. These are the disjoint windows.
const otherWindows = [
  ['R1C4', 'R1C5', 'R1C6'],
  ['R3C4', 'R3C5', 'R3C6'],
  ['R4C2', 'R4C3', 'R4C4'],
  ['R5C2', 'R5C3', 'R5C4'],
  ['R5C3', 'R5C4', 'R5C5'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R5C5', 'R5C6', 'R5C7'],
  ['R6C2', 'R6C3', 'R6C4'],
  ['R6C3', 'R6C4', 'R6C5'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R6C5', 'R6C6', 'R6C7'],
  ['R7C4', 'R7C5', 'R7C6'],
  ['R8C4', 'R8C5', 'R8C6'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R4C2', 'R5C2', 'R6C2'],
  ['R4C3', 'R5C3', 'R6C3'],
  ['R3C4', 'R4C4', 'R5C4'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R5C4', 'R6C4', 'R7C4'],
  ['R6C4', 'R7C4', 'R8C4'],
  ['R7C4', 'R8C4', 'R9C4'],
  ['R5C5', 'R6C5', 'R7C5'],
  ['R6C5', 'R7C5', 'R8C5'],
  ['R7C5', 'R8C5', 'R9C5'],
  ['R5C6', 'R6C6', 'R7C6'],
  ['R6C6', 'R7C6', 'R8C6'],
  ['R7C6', 'R8C6', 'R9C6'],
];

// Group a 3-cell line/window's positions by box, in order, to find any box
// border crossing (only 2-way splits -- 1+2 or 2+1 -- are geometrically
// possible for a 3-cell straight window).
const regionSumSegments = (cells) => {
  const boxOf = (cellId) => {
    const { row, col } = parseCellId(cellId);
    return `${Math.floor((row - 1) / 3)}_${Math.floor((col - 1) / 3)}`;
  };
  const boxes = cells.map(boxOf);
  const segments = [[0]];
  for (let i = 1; i < boxes.length; i++) {
    if (boxes[i] === boxes[i - 1]) {
      segments[segments.length - 1].push(i);
    } else {
      segments.push([i]);
    }
  }
  return segments;
};

// The 7 named "standard" line types, evaluated against an ordered triple of
// digits and the line's box-border segments. Region Sum only produces a real
// (non-vacuous) reading when the line actually crosses a box border -- a
// line entirely inside one box has a single segment, which is trivially
// "equal to itself" for any digits. Counting that vacuous reading as a live
// Region Sum interpretation is unsatisfiable here: 16 of the 17 given
// Howling Mad lines lie entirely within one box, so if a single-segment line
// could always be read as Region Sum, none of those 16 could ever validly be
// Howling Mad -- contradicting the puzzle's own claim that all 17 are valid.
// Nabner is read as the standard convention: no two digits anywhere on the
// line are consecutive (checked over every pair, not just adjacent cells).
const standardTypeFlags = (digits, segments) => {
  const [d0, d1, d2] = digits;
  const isRenban = Math.max(d0, d1, d2) - Math.min(d0, d1, d2) === 2;
  const isNabner = !(
    Math.abs(d0 - d1) === 1 || Math.abs(d1 - d2) === 1 || Math.abs(d0 - d2) === 1
  );
  const isParity = (d0 % 2) !== (d1 % 2) && (d1 % 2) !== (d2 % 2);
  const groupOf = (v) => Math.ceil(v / 3);
  const isEntropy = new Set([groupOf(d0), groupOf(d1), groupOf(d2)]).size === 3;
  const modOf = (v) => (v - 1) % 3;
  const isModular = new Set([modOf(d0), modOf(d1), modOf(d2)]).size === 3;
  const isDutchWhisper = Math.abs(d0 - d1) >= 4 && Math.abs(d1 - d2) >= 4;
  const isRegionSum = segments.length > 1 && segments.every(
    (seg) => seg.reduce((sum, i) => sum + digits[i], 0) === segments[0].reduce((sum, i) => sum + digits[i], 0)
  );
  return { isRenban, isNabner, isParity, isEntropy, isModular, isDutchWhisper, isRegionSum };
};
const anyStandardType = (flags) => Object.values(flags).some(Boolean);

// One NFA per Howling Mad line: state accumulates the digits seen so far;
// accept holds only when none of the 7 standard types could read this line.
const howlingMadNFAs = howlingMadLines.map((cells) => {
  const segments = regionSumSegments(cells);
  const spec = NFA.encodeSpec({
    startState: { digits: [] },
    transition: ({ digits }, value) => ({ digits: [...digits, value] }),
    accept: ({ digits }) => !anyStandardType(standardTypeFlags(digits, segments)),
    maxDepth: 3,
  }, 9);
  return new NFA(spec, 'HowlingMad', ...cells);
});

// One NFA per disjoint non-line window: accept holds only when at least one
// standard type *does* read it -- i.e. the window is disqualified from ever
// being an (unplaced) extra Howling Mad line by pattern alone. Combined
// below with an explicit "duplicates an already-used digit set" disjunct,
// covering the other way a candidate window is disqualified.
const otherWindowStandardNFAs = otherWindows.map((cells) => {
  const segments = regionSumSegments(cells);
  const spec = NFA.encodeSpec({
    startState: { digits: [] },
    transition: ({ digits }, value) => ({ digits: [...digits, value] }),
    accept: ({ digits }) => anyStandardType(standardTypeFlags(digits, segments)),
    maxDepth: 3,
  }, 9);
  return new NFA(spec, 'NotAHowlingMadLine', ...cells);
});
const noFurtherLines = otherWindows.map((cells, idx) => new Or([
  otherWindowStandardNFAs[idx],
  // Duplicates the digit set already used by some placed line.
  new Or(howlingMadLines.map((line) => new SameValues(2, ...cells, ...line))),
]));

// "No set of digits appears on more than one line": for every pair of
// Howling Mad lines, at least one digit of the first line must be absent
// from the second line's three cells (since both sets have size 3, that is
// exactly "the two digit-sets differ").
const differentDigitSets = [];
for (let i = 0; i < howlingMadLines.length; i++) {
  for (let j = i + 1; j < howlingMadLines.length; j++) {
    const a = howlingMadLines[i];
    const b = howlingMadLines[j];
    differentDigitSets.push(new Or(
      a.map((ac) => new And(
        b.map((bc) => new AllDifferent(ac, bc))
      ))
    ));
  }
}

return [
  new Shape('9x9'),
  ...xClues.map((cells) => new X(...cells)),
  ...vClues.map((cells) => new V(...cells)),
  ...howlingMadNFAs,
  ...differentDigitSets,
  ...noFurtherLines,
];
