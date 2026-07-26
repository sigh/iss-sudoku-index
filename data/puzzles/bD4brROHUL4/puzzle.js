// Title: Regional Constraints
// Author: Belamis
// Video: https://www.youtube.com/watch?v=bD4brROHUL4
// Source: https://sudokupad.app/7ipjii8013

// Normal Sudoku rules apply; the grid's own regions are the default 3x3
// boxes, so no explicit Shape/region override is needed.
//
// "Constraint Regions" rule: each constraint TYPE below (Renban, Killer,
// Thermo, Kropki, German Whispers) may not repeat a digit anywhere among
// ALL of that type's cells combined, in addition to each individual clue's
// own local rule. Encoded as one extra AllDifferent per type, over the
// union of that type's cells, alongside each clue's native constraint.

// Renban lines, drawn purple.
const renbanLines = [
  ['R7C4', 'R7C3', 'R7C2'],
  ['R6C8', 'R6C9', 'R5C9'],
  ['R1C2', 'R1C3'],
];
const renban = renbanLines.map((cells) => new Renban(...cells));

// Killer cages. The first cage has no total; its two cells already share a
// box, so it adds no local constraint beyond the default box all-different
// (its membership still matters for the global Killer AllDifferent below).
const killerCageCells = [
  ['R3C2', 'R3C3'],
  ['R7C7', 'R7C8', 'R7C9'],
  ['R1C4', 'R2C4', 'R3C4'],
];
const killer = [new Cage(12, 'R7C7', 'R7C8', 'R7C9'), new Cage(9, 'R1C4', 'R2C4', 'R3C4')];

// Thermometers; bulb cell (confirmed by the drawn circle at that cell) is
// listed first (increasing order).
const thermoLines = [
  ['R3C3', 'R4C3', 'R5C3'],
  ['R4C4', 'R4C5', 'R5C5'],
  ['R3C7', 'R2C8', 'R2C9'],
];
const thermo = thermoLines.map((cells) => new Thermo(...cells));

// Kropki black dots.
const kropkiDots = [
  ['R2C1', 'R2C2'],
  ['R5C2', 'R6C2'],
  ['R8C9', 'R9C9'],
];
const kropki = kropkiDots.map((cells) => new BlackDot(...cells));

// German Whispers lines, drawn green. The second line is a closed loop
// (R4C7-R5C7-R5C8-R4C8 back to R4C7); its cell list repeats the start cell
// to cover the R4C8/R4C7 closing edge.
const whisperLines = [
  ['R9C4', 'R9C5', 'R9C6'],
  ['R4C7', 'R5C7', 'R5C8', 'R4C8', 'R4C7'],
];
const whispers = whisperLines.map((cells) => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  ...renban,
  ...killer,
  ...thermo,
  ...kropki,
  ...whispers,
  new AllDifferent(...renbanLines.flat()),
  new AllDifferent(...killerCageCells.flat()),
  new AllDifferent(...thermoLines.flat()),
  new AllDifferent(...kropkiDots.flat()),
  new AllDifferent(...new Set(whisperLines.flat())),
];
