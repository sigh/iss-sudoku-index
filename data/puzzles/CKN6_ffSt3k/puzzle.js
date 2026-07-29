// Title: Lots Of Lavender
// Author: gdc
// Video: https://www.youtube.com/watch?v=CKN6_ffSt3k
// Source: https://sudokupad.app/f5vq2fborp

// Normal Sudoku rules apply. Each lavender path is a zipper with its circled
// lavender cell at the centre. Yellow/blue marks count odd/even digits on the
// lavender path they lie on, including the marked and central cells. Fog and
// the FOGLIGHT marker are UI-only and are not final-grid constraints.
const zippers = [
  ['R9C8', 'R8C8', 'R7C8', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9', 'R2C8', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R2C2', 'R2C1'],
  ['R3C5', 'R3C6', 'R3C7'],
  ['R2C4', 'R2C3', 'R3C3', 'R4C3', 'R4C2'],
  ['R4C5', 'R5C5', 'R5C4', 'R5C3', 'R5C2', 'R6C2', 'R6C1', 'R7C1', 'R8C1'],
  ['R5C6', 'R5C7', 'R5C8'],
  ['R9C5', 'R9C4', 'R8C4', 'R8C5', 'R7C5', 'R7C4', 'R7C3'],
];

// The drawn lavender paths and circles determine these six zipper instances.
const lavenderZippers = zippers.map((cells) => new Zipper(...cells));

// A counting NFA reads its marked cell first, then the remaining cells of that
// path. The order is immaterial to a count; storing the first digit lets the
// final state require it to equal the odd/even count.
function parityCount(markedCell, cells, wantsOdd, name) {
  const others = cells.filter((cell) => cell !== markedCell);
  const spec = NFA.encodeSpec({
    startState: { target: null, count: 0 },
    transition: ({ target, count }, value) => {
      const hit = (value % 2 === 1) === wantsOdd ? 1 : 0;
      if (target === null) return { target: value, count: hit };
      const nextCount = count + hit;
      return nextCount <= target ? { target, count: nextCount } : undefined;
    },
    accept: ({ target, count }) => target !== null && count === target,
    maxDepth: cells.length,
  }, 9);
  return new NFA(spec, name, markedCell, ...others);
}

// Yellow circles from the drawn data count odd digits on their own zipper.
const yellowOddCounts = [
  parityCount('R3C5', zippers[1], true, 'yellow odd count R3C5'),
  parityCount('R3C3', zippers[2], true, 'yellow odd count R3C3'),
  parityCount('R5C3', zippers[3], true, 'yellow odd count R5C3'),
  parityCount('R4C5', zippers[3], true, 'yellow odd count R4C5'),
  parityCount('R9C4', zippers[5], true, 'yellow odd count R9C4'),
];

// Blue squares from the drawn data count even digits on their own zipper.
const blueEvenCounts = [
  parityCount('R3C7', zippers[1], false, 'blue even count R3C7'),
  parityCount('R2C8', zippers[0], false, 'blue even count R2C8'),
  parityCount('R5C5', zippers[3], false, 'blue even count R5C5'),
];

return [
  new Shape('9x9'),
  ...lavenderZippers,
  ...yellowOddCounts,
  ...blueEvenCounts,
];
