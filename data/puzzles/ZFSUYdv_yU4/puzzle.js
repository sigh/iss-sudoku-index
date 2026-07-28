// Title: Happy Anniversary Mum & Dad!
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=ZFSUYdv_yU4
// Source: https://sudokupad.app/gbwivexeh7

// Normal 8x8 Sudoku; hearts are white Kropki dots and digits are anti-knight.
// Each digit belongs to one of four unknown marriage pairs. A cage's digit
// values (digit plus its spouse) total 9, 26, or 37.

// Cage cell lists transcribed from the twelve drawn dashed outlines.
const cages = [
  ['R7C5', 'R7C6', 'R7C7', 'R7C8', 'R8C6'],
  ['R8C7', 'R8C8'],
  ['R8C5'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R6C4'],
  ['R5C6', 'R6C5', 'R6C6'],
  ['R8C1', 'R8C2', 'R8C3', 'R8C4'],
  ['R7C2', 'R7C3', 'R7C4'],
  ['R7C1'],
  ['R5C2', 'R6C2', 'R6C3'],
  ['R5C3'],
  ['R3C7', 'R3C8', 'R4C8'],
  ['R4C7'],
];

// Generate the 105 perfect matchings of digits 1-8. Each matching stores the
// effective value for every digit, so one NFA can keep a matching fixed across
// all cage segments while accumulating that segment's value-total.
const matchings = [];
function pairRemaining(remaining, spouse = Array(9)) {
  if (!remaining.length) {
    matchings.push(spouse.map((partner, digit) => digit + partner));
    return;
  }
  const [digit, ...rest] = remaining;
  for (let i = 0; i < rest.length; i++) {
    const partner = rest[i];
    const next = rest.filter((_, j) => j !== i);
    const paired = spouse.slice();
    paired[digit] = partner;
    paired[partner] = digit;
    pairRemaining(next, paired);
  }
}
pairRemaining([1, 2, 3, 4, 5, 6, 7, 8]);

const marriageCages = NFA.encodeSpec({
  startState: matchings.map((_, matching) => ({ matching, sum: 0 })),
  transition: ({ matching, sum }, digit) => {
    if (digit === SEGMENT_BREAK) {
      return [9, 26, 37].includes(sum) ? { matching, sum: 0 } : undefined;
    }
    const nextSum = sum + matchings[matching][digit];
    return nextSum <= 37 ? { matching, sum: nextSum } : undefined;
  },
  accept: ({ sum }) => [9, 26, 37].includes(sum),
}, 8, { multiSegment: true });

return [
  new Shape('8x8'),
  new AntiKnight(),
  new WhiteDot('R1C1', 'R1C2'),
  new WhiteDot('R1C3', 'R1C4'),
  new WhiteDot('R2C1', 'R2C2'),
  new NFA(marriageCages, 'marriage cage values', ...cages),
];
