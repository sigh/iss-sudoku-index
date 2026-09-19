// Title: The Vault
// Author: Nurator
// Video: https://www.youtube.com/watch?v=-fyfADWAo2Y
// Source: https://sudokupad.app/mhfpkgyo52

// Rules encoded here (the puzzle's final stage, once both checkpoints have been
// revealed and all three line types are available):
//   - Normal sudoku, with given digits R1C2=1 and R1C3=4.
//   - Black dot: one digit is double the other. White dot: consecutive digits.
//   - Each of the six grey lines follows exactly one of: German Whisper (adjacent
//     digits differ by at least 5), Region Sum Line (box borders cut the line into
//     segments; each segment on a line sums the same), Modular line (every 3
//     consecutive cells along the line hold one digit from {3,6,9}, one from
//     {1,4,7}, one from {2,5,8}). Which line takes which type is for the solver to
//     work out, so the encoding disjoins over every assignment.
//   - "Each line constraint type may contain no repeated digits anywhere in the
//     puzzle": read as pooled per type -- all cells on every line sharing a type
//     are mutually distinct, not just the cells of one line.
//
// Omitted: the staged fog solve. The rules build the answer through a sequence of
// sub-puzzles: only lines A and B (plus checkpoint 1, R5C2) are visible at first
// and every visible line is a Whisper line; solving checkpoint 1 reveals lines C
// and D plus checkpoint 2 (R4C9) and unlocks Region Sum; solving checkpoint 2
// reveals lines E and F plus the given R1C3 and unlocks Modular -- erasing all
// entered digits except the checkpoint cells between stages. Each checkpoint
// digit is pinned by "the earlier stage's partly-lit sub-puzzle determines it
// uniquely", a statement about that sub-puzzle's own solution count rather than a
// condition on the final grid, and that sub-puzzle's grid is discarded once the
// checkpoint is read off; only the static final-grid shadow above is encoded.
// Also omitted: the fog reveal order and the green checkpoint squares
// themselves, which are presentation.

// Grey line paths. Lines A and F each retrace through one shared cell (R7C3 /
// R4C4) rather than running as a simple path: the drawn stroke goes out along a
// trunk, reaches that cell, and continues along a second arm from it, so that
// cell has three line-neighbours instead of two.
//
// Two representations are needed for a branching line, because ISS's line
// classes read a cell array two different ways:
//   - WALK_CELLS is the literal drawn sequence, revisited cell included. The
//     sequential-pair/window classes (Whisper, Modular) bind consecutive
//     list positions, so this is what makes the branch's second arm (and the
//     edge that closes it back onto the shared cell) count.
//   - REGION_CELLS lists each cell exactly once, reordered so every box's
//     cells sit together. RegionSumLine is a segment-partition class: it
//     starts a new segment whenever consecutive array entries change box, so
//     feeding it WALK_CELLS would split the shared cell's box into two
//     segments purely because the walk visits that box twice -- "a branching
//     tree's segments are its connected pieces within each box, not its
//     strokes". Reordering so each box's touches are adjacent restores that.
const WALK_CELLS = [
  ['R7C4', 'R7C3', 'R6C3', 'R6C2', 'R7C2', 'R7C3'],           // A
  ['R7C5', 'R7C6', 'R7C7'],                                   // B
  ['R8C8', 'R7C8', 'R6C8', 'R6C9'],                           // C
  ['R4C8', 'R4C7', 'R3C7', 'R3C8', 'R3C9'],                   // D
  ['R9C3', 'R9C4', 'R9C5'],                                   // E
  ['R5C3', 'R4C3', 'R4C4', 'R4C5', 'R3C5', 'R3C4', 'R4C4'],   // F
];
const REGION_CELLS = [
  ['R7C4', 'R7C3', 'R7C2', 'R6C3', 'R6C2'],                   // A: R7C3/R7C2 share box(3,1)
  ['R7C5', 'R7C6', 'R7C7'],                                   // B
  ['R8C8', 'R7C8', 'R6C8', 'R6C9'],                           // C
  ['R4C8', 'R4C7', 'R3C7', 'R3C8', 'R3C9'],                   // D
  ['R9C3', 'R9C4', 'R9C5'],                                   // E
  ['R5C3', 'R4C3', 'R4C4', 'R4C5', 'R3C5', 'R3C4'],           // F: shared cell listed once
];

// Drawn dots, as the cell pair each one sits between.
const WHITE_DOTS = [
  ['R7C4', 'R8C4'], ['R8C4', 'R8C5'], ['R5C2', 'R6C2'], ['R3C9', 'R4C9'],
  ['R5C3', 'R5C4'], ['R4C4', 'R5C4'], ['R1C5', 'R1C6'],
];
const BLACK_DOTS = [
  ['R7C5', 'R8C5'],
];

// The three line constraint types the final stage allows, in a fixed order so the
// assignment codes below are readable. Each takes the cell list already shaped
// for its class: sequential-pair/window classes read WALK_CELLS, RegionSumLine
// reads REGION_CELLS (see the comment above).
const LINE_TYPES = [
  walk => new Whisper(5, ...walk),         // German Whisper
  (_walk, region) => new RegionSumLine(...region), // box borders cut the line; equal segment sums
  walk => new Modular(3, ...walk),         // one of {3,6,9}/{1,4,7}/{2,5,8} per 3 consecutive cells
];

// Every way of giving each line one of the three types: 3^6 = 729 codes, read as a
// base-3 numeral with one digit per line.
const allAssignments = Array.from(
  { length: 3 ** WALK_CELLS.length },
  (_, code) => WALK_CELLS.map((_line, i) => Math.floor(code / 3 ** i) % 3));

// A type's cells are pooled all-different, so a type carrying more than 9 distinct
// line cells is unsatisfiable by pigeonhole. Dropping those codes leaves an
// equivalent disjunction; every surviving branch still states the rule in full.
const assignments = allAssignments.filter(
  types => LINE_TYPES.every(
    (_t, t) => new Set(
      REGION_CELLS.filter((_line, i) => types[i] === t).flat()
    ).size <= 9));

return [
  new Shape('9x9'),

  new Given('R1C2', 1),
  new Given('R1C3', 4),

  ...WHITE_DOTS.map(pair => new WhiteDot(...pair)),
  ...BLACK_DOTS.map(pair => new BlackDot(...pair)),

  new Or(assignments.map(types => new And([
    ...WALK_CELLS.map((walk, i) => LINE_TYPES[types[i]](walk, REGION_CELLS[i])),
    ...LINE_TYPES.map((_t, t) => new AllDifferent(
      ...REGION_CELLS.filter((_line, i) => types[i] === t).flat())),
  ]))),
];
