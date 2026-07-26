// Title: an ill omen
// Author: aqjhs
// Video: https://www.youtube.com/watch?v=xHvoK5IBdLU
// Source: https://sudokupad.app/59fo21vx0w

// Normal sudoku, antiknight (no two cells a knight's move apart share a
// digit), and five drawn gold lines. Every gold line is an "orange line":
// adjacent digits along it must differ by at least 4 (Whisper(4)). Four of
// the five lines additionally carry two dot-marked cells; the digits in
// those two cells are a "look-and-say" pair: reading them as {a, b} in
// either order, at least one of "a counts b's occurrences on the line" /
// "b counts a's occurrences on the line" must hold.
//
// Line geometry, from the drawn gold strokes and dot circles (two of the
// lines bend and are drawn as two joined strokes). `dots` are the two
// dot-marked cells on the line (empty when the line has none); `cells` is
// the line's full cell path in drawn order.
const lines = [
  {
    dots: ['R4C4', 'R4C5'],
    cells: ['R5C1', 'R4C2', 'R3C3', 'R4C4', 'R4C5', 'R3C5', 'R2C4', 'R1C3', 'R1C2', 'R1C1'],
  },
  {
    dots: ['R4C6', 'R5C6'],
    cells: ['R4C9', 'R3C8', 'R3C7', 'R4C6', 'R5C6', 'R5C7', 'R6C7'],
  },
  {
    dots: ['R5C4', 'R6C4'],
    cells: ['R4C3', 'R5C3', 'R5C4', 'R6C4', 'R7C3', 'R6C2'],
  },
  {
    dots: ['R5C5', 'R6C5'],
    cells: ['R6C6', 'R5C5', 'R6C5', 'R7C5', 'R7C6', 'R8C7', 'R9C8', 'R9C9'],
  },
  {
    dots: [],
    cells: ['R7C7', 'R7C8', 'R6C9'],
  },
];

// Look-and-say state: {d1, d2} are the digits read at the line's two dot
// cells (in the order they're passed to the NFA), {count1, count2} are
// running counts, over the whole line, of cells matching d1 and d2
// respectively. Cells are passed dot1, dot2, then the rest of the line in
// any order, since the rule only cares about total occurrences, not
// sequence. `accept` checks the "in at least one way of reading them" OR.
const lookAndSay = NFA.encodeSpec({
  startState: { d1: null, d2: null, count1: 0, count2: 0 },
  transition: ({ d1, d2, count1, count2 }, value) => {
    if (d1 === null) {
      // First symbol: dot1. It trivially matches itself.
      return { d1: value, d2: null, count1: 1, count2: 0 };
    }
    if (d2 === null) {
      // Second symbol: dot2. Cross-check it against d1, and seed count2.
      const same = value === d1;
      return {
        d1, d2: value,
        count1: count1 + (same ? 1 : 0),
        count2: 1 + (same ? 1 : 0),
      };
    }
    // Remaining line cells: tally matches against both dot digits. Clamped
    // at 10 (line length never exceeds 10), well above any real digit 1-9.
    return {
      d1, d2,
      count1: Math.min(count1 + (value === d1 ? 1 : 0), 10),
      count2: Math.min(count2 + (value === d2 ? 1 : 0), 10),
    };
  },
  accept: ({ d1, d2, count1, count2 }) =>
    d2 !== null && (count1 === d2 || count2 === d1),
  maxDepth: 10,
}, 9);

const whispers = lines.map(({ cells }) => new Whisper(4, ...cells));

const lookAndSays = lines
  .filter(({ dots }) => dots.length === 2)
  .map(({ dots, cells }, i) => {
    const rest = cells.filter((c) => !dots.includes(c));
    return new NFA(lookAndSay, `look-and-say ${i}`, ...dots, ...rest);
  });

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...whispers,
  ...lookAndSays,
];
