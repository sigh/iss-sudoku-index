// Title: Thanks Testers
// Author: 99%Sneaky
// Video: https://www.youtube.com/watch?v=A8XCZvE7Yvo
// Source: https://sudokupad.app/2oeacznw5t

// Standard 9x9 sudoku. Three drawn line types, transcribed from the source's
// stroke geometry grouped by stroke colour (a white/outline stroke layer
// duplicates the peach edges pixel-for-pixel and is a cosmetic dash/outline
// overlay, not a fourth clue):
// - purple (#f067f0): the line's digits form a consecutive, non-repeating
//   set -> Renban.
// - orange (#ffa600): adjacent digits on the line differ by >= 4 -> Whisper.
// - peach (#fcaf, a CSS 4-digit hex short for #ffccaa): an "entropic" line.
//   The source's own rules text describes this in the standard groups-of-3
//   phrasing ("each set of three consecutive digits ... one low, one medium,
//   one high"), but every peach line here is a single 2-cell edge (see the
//   PEACH_PAIRS cells below), so no complete triple can ever form under that
//   reading -- it would be silently vacuous. The video's own narration gives
//   the applicable definition for a line this short: "adjacent digits will be
//   from different entropic sets" (low 1-3, medium 4-6, high 7-9). That
//   pairwise reading is what actually constrains a 2-cell line, so it is
//   encoded via a custom adjacent-pair relation, not the built-in `Entropic`
//   class (which only implements the groups-of-3 reading).
//
// Box cages: eight of the nine boxes contain an unmarked cage; the top-right
// box (R1-3,C7-9) has none. Per the rules text ("sum all digits which are on
// two lines, and write that number into the cage" -- confirmed by the
// source's own worked example, box 1's R3C3 = R1C2+R2C2), each such box's
// cage holds the sum of that box's "on-two-lines" cells: cells where two
// differently-coloured line segments meet. The sums below were derived by
// intersecting the purple/orange/peach line cells above per box (every box
// has at most one such crossing set, so no correspondence is left open). A
// one-cell cage takes that sum directly (an Arrow with no drawn bulb decor);
// a two-cell cage reads it as a two-digit number, left-to-right or
// top-to-bottom per the drawn cage shape (a PillArrow/Sum equation). In box 6
// the cage cell R4C7 is itself also one of the box's on-two-lines cells (it
// sits where the cage's own purple pair-line meets an orange line), so its
// digit appears on both sides of that box's equation; encoded as an explicit
// Sum rather than PillArrow so the repeated cell and its coefficients are
// visible.
//
// Two more cells, outside every cage: the green-square cell holds the sum of
// the tens digits of the three two-digit numbers, and the blue-circle cell
// holds the sum of their units digits (rules text, "sum of all of the ten's
// digits/one's digits from every two digit number").

const shape = new Shape('9x9');

// Purple (consecutive-set) lines, transcribed from the drawn lines by
// stroke colour #f067f0.
const RENBAN_LINES = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R5C2', 'R6C2'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C7', 'R4C8'],
  ['R5C7', 'R5C8'],
  ['R6C7', 'R6C8'],
  ['R1C4', 'R2C4', 'R3C4'],
  ['R1C6', 'R2C6', 'R3C6'],
  ['R1C7', 'R2C8', 'R3C9'], // drawn diagonally
  ['R8C2', 'R9C2'],
  ['R7C5', 'R7C4', 'R8C4', 'R9C4'],
  ['R8C7', 'R8C6', 'R9C6'],
  ['R7C9', 'R7C8', 'R8C8'],
  ['R8C9', 'R9C9', 'R9C8'],
];

// Orange (adjacent difference >= 4) lines, stroke colour #ffa600.
const WHISPER_LINES = [
  ['R2C2', 'R3C2'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R1C9', 'R2C8', 'R3C7'], // drawn diagonally
  ['R4C1', 'R4C2', 'R4C3'],
  ['R4C4', 'R4C5'],
  ['R5C4', 'R5C5'],
  ['R6C4', 'R6C5'],
  ['R4C7', 'R5C7'],
  ['R5C8', 'R6C8'],
  ['R7C1', 'R7C2', 'R7C3'],
  ['R8C4', 'R8C5'],
  ['R9C4', 'R9C5'],
  ['R8C8', 'R8C9'],
];

// Peach (entropic-pair) lines, stroke colour #fcaf -- each a lone edge.
const PEACH_PAIRS = [
  ['R1C2', 'R2C2'],
  ['R4C2', 'R5C2'],
  ['R7C2', 'R8C2'],
];

const renbanConstraints = RENBAN_LINES.map(cells => new Renban(...cells));
const whisperConstraints = WHISPER_LINES.map(cells => new Whisper(4, ...cells));

// Adjacent cells must fall in different entropic sets {1,2,3}/{4,5,6}/{7,8,9}.
const entropicSet = v => Math.floor((v - 1) / 3);
const entropicKey = Pair.fnToKey((a, b) => entropicSet(a) !== entropicSet(b), 9);
const entropicConstraints = PEACH_PAIRS.map(
  ([a, b]) => new Pair(entropicKey, 'entropic', a, b));

// Single-cell cages: the cage digit equals the sum of that box's
// on-two-lines cells (Arrow with the cage cell as the bulb).
const SINGLE_SUMS = [
  ['R3C3', ['R1C2', 'R2C2']], // box 1 -- matches the source's worked example
  ['R1C5', ['R2C4', 'R2C6']], // box 2
  ['R6C3', ['R4C2', 'R5C2']], // box 4
  ['R7C4', ['R8C4', 'R9C4']], // box 8
  ['R7C9', ['R8C8', 'R8C9']], // box 9
];
const singleSumConstraints = SINGLE_SUMS.map(
  ([bulb, arm]) => new Arrow(bulb, ...arm));

// Two-cell cages (no self-reference): a two-digit number, read per the
// cage's own left-to-right / top-to-bottom orientation, equals the sum of
// that box's on-two-lines cells.
const twoDigitSumConstraints = [
  // box 5: R5C5,R5C6 read left-to-right = R4C4+R5C4+R6C4
  new PillArrow(2, 'R5C5', 'R5C6', 'R4C4', 'R5C4', 'R6C4'),
  // box 7: R7C1,R8C1 read top-to-bottom = R7C2+R8C2
  new PillArrow(2, 'R7C1', 'R8C1', 'R7C2', 'R8C2'),
];

// Box 6: R4C7,R4C8 read left-to-right = R4C7+R5C7+R5C8+R6C8. R4C7 is both a
// pill digit and one of the summed cells, so this is written out directly
// (10*R4C7 + R4C8 - (R4C7+R5C7+R5C8+R6C8) = 0, i.e. 9*R4C7 + R4C8 - R5C7 -
// R5C8 - R6C8 = 0) rather than fed through PillArrow.
const box6SelfRefSum = new Sum(
  0, ['R4C7', 9], ['R4C8', 1], ['R5C7', -1], ['R5C8', -1], ['R6C8', -1]);

// Green-square cell = sum of the three two-digit numbers' tens digits;
// blue-circle cell = sum of their units digits. Tens/units cells per the
// same left-to-right / top-to-bottom reading used above.
const tensCells = ['R5C5', 'R7C1', 'R4C7'];
const onesCells = ['R5C6', 'R8C1', 'R4C8'];
const greenSquareConstraint = new Arrow('R4C9', ...tensCells);
const blueCircleConstraint = new Arrow('R8C6', ...onesCells);

return [
  shape,
  ...renbanConstraints,
  ...whisperConstraints,
  ...entropicConstraints,
  ...singleSumConstraints,
  ...twoDigitSumConstraints,
  box6SelfRefSum,
  greenSquareConstraint,
  blueCircleConstraint,
];
