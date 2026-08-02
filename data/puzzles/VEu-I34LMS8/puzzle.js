// Title: Murder Mystery!
// Author: 3good5you
// Video: https://www.youtube.com/watch?v=VEu-I34LMS8
// Source: https://app.crackingthecryptic.com/sudoku/bdPFgJ7Qfr

// Normal Sudoku applies. A-D are four distinct digits. Each outside two-symbol
// clue is its diagonal's little-killer total and a look-and-say count: the
// first symbol counts occurrences of the second on that diagonal. Each ? is
// an independent digit, allowed to equal a letter digit. The clue paths and
// their symbol order are transcribed from the drawn arrowheads and labels.
const graph = cellGraph('9x9');
const letters = ['VL1', 'VL2', 'VL3', 'VL4'];
const questions = ['VQ1', 'VQ2', 'VQ3', 'VQ4', 'VQ5'];
const [A, B, C, D] = letters;
const [Q1, Q2, Q3, Q4, Q5] = questions;

const clues = [
  { label: 'AB', tens: A, ones: B, cells: graph.ray('R1C1', 1, 1) },
  { label: 'CD', tens: C, ones: D, cells: graph.ray('R1C9', 1, -1) },
  { label: 'D?', tens: D, ones: Q1, cells: graph.ray('R3C1', 1, 1) },
  { label: 'BD', tens: B, ones: D, cells: graph.ray('R3C9', 1, -1) },
  { label: '?? right', tens: Q2, ones: Q3, cells: graph.ray('R4C9', 1, -1) },
  { label: '?? left', tens: Q4, ones: Q5, cells: graph.ray('R3C1', -1, 1) },
];

// State records the two outside symbols, then counts only the diagonal cells
// equal to the units symbol; count is clamped at one above the requested count.
const lookAndSay = NFA.encodeSpec({
  startState: { tens: null, ones: null, count: 0 },
  transition: ({ tens, ones, count }, value) => {
    if (tens === null) return { tens: value, ones: null, count: 0 };
    if (ones === null) return { tens, ones: value, count: 0 };
    return { tens, ones, count: Math.min(count + (value === ones ? 1 : 0), tens + 1) };
  },
  accept: ({ tens, ones, count }) => ones !== null && count === tens,
  maxDepth: 11,
}, 9);

function encryptedClue({ label, tens, ones, cells }) {
  return [
    new Sum(0, ...cells, [tens, -10], [ones, -1]),
    new NFA(lookAndSay, `look-and-say ${label}`, tens, ones, ...cells),
  ];
}

return [
  new Shape('9x9'),
  new Given('R2C5', 8),
  new Given('R5C2', 8),
  new Given('R5C8', 1),
  new Given('R8C5', 1),
  new Var('L', 'letter digits A-D', 4),
  new Var('Q', 'independent question-mark digits', 5),
  new AllDifferent(...letters),
  ...clues.flatMap(encryptedClue),
];
