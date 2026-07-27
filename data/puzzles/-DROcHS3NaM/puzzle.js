// Title: Word Search
// Author: Itai Cohen
// Video: https://www.youtube.com/watch?v=-DROcHS3NaM
// Source: https://sudokupad.app/PHBrnqT7QJ

// Rules encoded:
// - Normal sudoku rules (9x9, rows/columns/3x3 boxes all-different -- ISS
//   default).
// - Numbers are alphanumeric: digit d stands for the d-th letter (1=a, 2=b,
//   ..., 9=i).
// - Any vowel cannot be a knight's move from an identical letter. Only a, e,
//   i (digits 1, 5, 9) are representable vowels on a 1-9 grid (o and u fall
//   outside the alphabet), so this restricts digits 1, 5, 9 only: no two
//   cells a knight's move apart may share one of those three values.
// - Each green 3-cell line's digits, read as letters, must spell one of the
//   13 listed 3-letter words. Direction is not stated by the rules text or
//   shown by the line art (no arrowhead), so both the drawn direction and
//   its reverse are accepted. There are exactly 13 green lines and 13 words,
//   and the rule requires each word "exactly once along a line" -- a
//   bijection between lines and words. Encoded with one Var holding each
//   line's matched word index and AllDifferent over those 13 Vars.
// - The gray cell (R1C6) holds a digit greater than each orthogonal
//   neighbour.
// - Five cells are given directly as letters via drawn overlays (E, E, I, A,
//   A), converted to digits by the same 1=a..9=i mapping.

const graph = cellGraph('9x9');

// -- Word-search lines --------------------------------------------------
// The 13 words from the rules text, each mapped a=1..i=9.
const WORDS = [
  'ACE', 'AGE', 'AID', 'BAG', 'BEG', 'DIE', 'DIG', 'FED', 'FIG', 'HAD', 'ICE',
  'BID', 'BAD',
];
const letterToDigit = ch => ch.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0) + 1;
const wordDigits = WORDS.map(w => [...w].map(letterToDigit));

// The 13 green 3-cell lines, straight (horizontal/vertical/diagonal) and
// each 3 cells, drawn from two-point wayPoints (the middle cell is the
// interpolated midpoint); cell order is the drawn start -> end.
const LINES = [
  ['R2C5', 'R3C4', 'R4C3'],
  ['R3C6', 'R3C5', 'R3C4'],
  ['R2C9', 'R2C8', 'R2C7'],
  ['R5C9', 'R5C8', 'R5C7'],
  ['R4C6', 'R5C5', 'R6C4'],
  ['R5C3', 'R6C2', 'R7C1'],
  ['R6C3', 'R6C2', 'R6C1'],
  ['R7C4', 'R8C4', 'R9C4'],
  ['R7C2', 'R8C3', 'R9C4'],
  ['R9C2', 'R9C3', 'R9C4'],
  ['R7C6', 'R7C7', 'R7C8'],
  ['R9C8', 'R9C7', 'R9C6'],
  ['R7C7', 'R8C7', 'R9C7'],
];

// One Var per line holds which word (1-based index into WORDS) it spells.
const wordVar = new Var('W', 'Word index', WORDS.length);

// Each line matches exactly one word, read forward or reversed; AllDifferent
// over the word-index Vars forces the required bijection (13 lines, 13
// words, each word used by exactly one line).
const lineWordConstraints = LINES.map((cells, i) => new Or(
  wordDigits.flatMap((digits, wi) => [digits, [...digits].reverse()].map(seq => new And([
    new Given(cells[0], seq[0]),
    new Given(cells[1], seq[1]),
    new Given(cells[2], seq[2]),
    new Given(wordVar.cell(i + 1), wi + 1),
  ])))
));

// -- Vowel knight's move --------------------------------------------------
// Only 1 (a), 5 (e), 9 (i) are vowels in this 1-9 alphabet.
const VOWEL_DIGITS = [1, 5, 9];
// Key built against the widened 1-13 range (WORDS.length), not the true 1-9
// digit range: the grid's Shape is widened for the word-index Var, and a
// Pair key built for a narrower range silently misreads the wider one.
const noVowelKnightRepeat = Pair.fnToKey(
  (a, b) => !(a === b && VOWEL_DIGITS.includes(a)), WORDS.length);
// Every knight-move edge is covered once by one of these 4 offsets (the
// other 4 knight directions are the same edges walked from their other
// endpoint). One Replicate per offset stamps the same Pair template over
// every in-grid origin for that offset. graph.makeReplicate() always anchors
// at R1C1, which is off-grid for a negative-offset template, so build the
// Replicate directly with the first valid origin for each offset instead.
const KNIGHT_TEMPLATE_OFFSETS = [[1, 2], [1, -2], [2, 1], [2, -1]];
const vowelKnightConstraints = KNIGHT_TEMPLATE_OFFSETS.map(([dr, dc]) => {
  const targets = graph.cells().filter(cell => graph.step(cell, dr, dc) !== null);
  const origin = targets[0];
  const template = graph.step(origin, dr, dc);
  // lint-ok: bare-replicate-constructor
  return new Replicate(
    [new Pair(noVowelKnightRepeat, 'vowel knight', origin, template)],
    Replicate.encodeTargetCells(targets, origin, graph),
    origin,
  );
});

// -- Gray cell local max ---------------------------------------------------
const GRAY_CELL = 'R1C6';
const grayNeighbourConstraints = graph.neighbours(GRAY_CELL).map(n =>
  new GreaterThan(GRAY_CELL, n));

// -- Overlay-given letters --------------------------------------------------
const LETTER_GIVENS = [
  ['R5C2', 'E'], ['R4C5', 'E'], ['R5C5', 'I'], ['R5C8', 'A'], ['R6C5', 'A'],
];
const letterGivenConstraints = LETTER_GIVENS.map(([cell, letter]) =>
  new Given(cell, letterToDigit(letter)));

// Widen the value range so the word-index Var can hold 1..13, then pin every
// real grid cell back to its true 1-9 range with one Replicate; a per-cell
// letter Given later intersects and narrows further where one applies.
const gridDomainRestriction = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

return [
  new Shape('9x9', WORDS.length),
  gridDomainRestriction,
  wordVar,
  new AllDifferent(...wordVar.cells()),
  ...lineWordConstraints,
  ...vowelKnightConstraints,
  ...grayNeighbourConstraints,
  ...letterGivenConstraints,
];
