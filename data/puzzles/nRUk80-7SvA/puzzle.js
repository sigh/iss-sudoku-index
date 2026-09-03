// Title: Exclusive Lines
// Author: Nurator
// Video: https://www.youtube.com/watch?v=nRUk80-7SvA
// Source: https://sudokupad.app/iovwq0jc5n

// Rules encoded here (the puzzle's final stage, when every checkpoint has been
// revealed and all three line types are available):
//   - Normal sudoku.
//   - Black dot: one digit is double the other. White dot: consecutive digits.
//     "Not all dots are given", so unmarked edges are unconstrained and the
//     non-strict dot classes are the right ones.
//   - Each of the six grey lines follows exactly one of: Region Sum Line,
//     German Whisper (adjacent digits differ by at least 5), Parity line
//     (digits alternate odd/even). Which line takes which type is unknown, so
//     the encoding disjoins over every assignment.
//   - "Each line constraint type may contain NO REPEATED DIGITS anywhere in the
//     puzzle": pooled per type, so all cells on all lines sharing a type are
//     mutually distinct.
//
// Omitted: the staged fog solve. The rules build the answer through a sequence
// of sub-puzzles -- first with only lines A and B visible and every visible line
// a Region Sum Line, then with German Whisper unlocked, then with Parity
// unlocked -- erasing all digits except the checkpoint cells R7C2, R7C9 and R3C6
// between stages. Each checkpoint digit is fixed by "the earlier stage's puzzle
// determines it uniquely", which is a statement about that sub-puzzle's solution
// count rather than a condition on the final grid, and the earlier stages' grids
// are discarded, so nothing here carries the three checkpoint digits into the
// final grid. Also omitted: the fog reveal order itself, which is presentation.

// Grey line paths, in drawn order (each stroke's cells; lines D and E each take
// one diagonal step).
const LINES = [
  ['R7C1', 'R6C1', 'R5C1', 'R4C1'],                   // A
  ['R4C2', 'R3C2', 'R2C2'],                           // B
  ['R7C3', 'R8C3', 'R8C4', 'R7C4', 'R7C5'],           // C
  ['R8C6', 'R7C6', 'R7C7', 'R8C8'],                   // D
  ['R3C9', 'R4C9', 'R5C8', 'R5C9', 'R6C9'],           // E
  ['R3C8', 'R3C7', 'R4C7', 'R4C6', 'R4C5'],           // F
];

// Drawn dots, as the cell pair each one sits between.
const WHITE_DOTS = [
  ['R4C1', 'R4C2'], ['R7C1', 'R7C2'], ['R7C3', 'R7C4'], ['R7C9', 'R8C9'],
  ['R8C8', 'R8C9'], ['R4C9', 'R5C9'], ['R3C6', 'R4C6'], ['R1C7', 'R2C7'],
  ['R2C4', 'R2C5'], ['R1C5', 'R1C6'],
];
const BLACK_DOTS = [
  ['R2C9', 'R3C9'],
];

// The three line constraint types the final stage allows, in a fixed order so
// the assignment codes below are readable.
const LINE_TYPES = [
  cells => new RegionSumLine(...cells),  // box borders cut the line; equal segment sums
  cells => new Whisper(5, ...cells),     // German Whisper
  cells => new Modular(2, ...cells),     // parity line: every 2 consecutive cells differ mod 2
];

// Every way of giving each line one of the three types: 3^6 = 729 codes, read as
// a base-3 numeral with one digit per line.
const allAssignments = Array.from(
  { length: 3 ** LINES.length },
  (_, code) => LINES.map((_line, i) => Math.floor(code / 3 ** i) % 3));

// A type's cells are pooled all-different, so a type carrying more than 9 line
// cells is unsatisfiable by pigeonhole. Dropping those codes leaves an
// equivalent disjunction; every surviving branch still states the rule in full.
const assignments = allAssignments.filter(
  types => LINE_TYPES.every(
    (_t, t) => LINES.reduce(
      (n, line, i) => n + (types[i] === t ? line.length : 0), 0) <= 9));

return [
  new Shape('9x9'),

  ...WHITE_DOTS.map(pair => new WhiteDot(...pair)),
  ...BLACK_DOTS.map(pair => new BlackDot(...pair)),

  new Or(assignments.map(types => new And([
    ...LINES.map((line, i) => LINE_TYPES[types[i]](line)),
    ...LINE_TYPES.map((_t, t) => new AllDifferent(
      ...LINES.filter((_line, i) => types[i] === t).flat())),
  ]))),
];
