// Title: Liberty, cracked, Perseveres
// Author: Rockratzero
// Video: https://www.youtube.com/watch?v=c7OXLEoKs_o
// Source: https://app.crackingthecryptic.com/sudoku/LTMQhdn3b7

// Standard sudoku (default boxes). Grey lines are "ramps": non-decreasing
// (not strictly increasing) from bulb to tip -- no dedicated line class
// exists for that, so each drawn arm is one Pair with a <= b applied to its
// consecutive cells (Pair binds consecutive pairs by list order, same as a
// line class). All four grey arms share bulb R3C5 (marked by the drawn grey
// underlay circle there) and are encoded per drawn segment, matching the
// source's four separate line entries.
//
// Yellow lines use Modular(3): every window of 3 consecutive cells in the
// list is one each of {1,4,7}/{2,5,8}/{3,6,9}. Two of the yellow clues are
// drawn as a triangle of three pairwise edges rather than a path, because
// their two non-adjacent cells needed a direct edge to show they belong to
// one set; as a plain 3-cell group the single Modular(3) window covers them
// regardless of the order passed in.
//
// Large white circles use Quad: "a digit in the circle must appear at least
// once in the four cells it touches" is exactly Quad's "all given values
// present in the surrounding 2x2 square" semantics. Each circle's two-digit
// label (text "17", "52") is read as the two single digits 1,7 and 5,2 -- the
// grid's value range is 1-9, so a two-digit reading is impossible.
//
// Dots are Kropki (white = consecutive, black = 2:1 ratio); "not all dots are
// necessarily given" means only the drawn dots are constrained -- no negative
// claim about undotted pairs.

const graph = cellGraph('9x9');

// --- Givens (R1C1, R1C3, R1C5, R1C7). ---
const givens = [
  new Given('R1C1', 1),
  new Given('R1C3', 7),
  new Given('R1C5', 5),
  new Given('R1C7', 2),
];

// --- Grey ramp lines: bulb R3C5, one Pair per drawn arm, values
// non-decreasing bulb -> tip. ---
const rampKey = Pair.fnToKey((a, b) => a <= b, 9);
const rampArms = [
  ['R3C5', 'R3C4'],
  ['R3C5', 'R3C6'],
  ['R3C5', 'R4C5', 'R4C6', 'R5C6', 'R6C7', 'R7C8', 'R8C7', 'R8C6'],
  ['R3C5', 'R4C5', 'R4C4', 'R5C4', 'R6C3', 'R7C2', 'R8C3', 'R8C4', 'R8C5'],
];
const ramps = rampArms.map(cells => new Pair(rampKey, 'ramp', ...cells));

// --- Yellow modulo-3 lines. ---
const modLines = [
  ['R1C2', 'R2C2', 'R2C1'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R8C9', 'R9C9', 'R9C8'],
  ['R1C8', 'R2C8', 'R2C9'],
  ['R2C3', 'R3C3', 'R3C4'],
  ['R3C6', 'R2C7', 'R3C7'],
  ['R5C5', 'R6C5', 'R7C5', 'R8C6'],
].map(cells => new Modular(3, ...cells));

// --- Kropki dots. ---
const whiteDots = [
  ['R9C6', 'R9C7'],
  ['R3C9', 'R4C9'],
  ['R6C1', 'R7C1'],
].map(cells => new WhiteDot(...cells));
const blackDots = [
  ['R5C4', 'R5C5'],
  ['R7C9', 'R8C9'],
  ['R2C1', 'R3C1'],
].map(cells => new BlackDot(...cells));

// --- Large white circles (Quad): topLeftCell + the digits that must appear
// somewhere in its 2x2 square. ---
const quads = [
  new Quad('R4C1', 1, 7),
  new Quad('R5C8', 5, 2),
];

return [
  new Shape('9x9'),
  ...givens,
  ...ramps,
  ...modLines,
  ...whiteDots,
  ...blackDots,
  ...quads,
];
