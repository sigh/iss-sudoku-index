// Title: Coded Killer Sudoku
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=jayJVjqAS3k
// Source: https://cracking-the-cryptic.web.app/sudoku/j2gtNR4Mg4

// Normal sudoku: digits 1-9 once each per row, column and box (default 9x9
// rules; the payload's 9 real regions match the default box tiling).
//
// 21 killer-style cages, each with a printed total coded as one or two
// letters instead of a number (no cage carries a numeric total). Encoded
// here: digits do not repeat within a cage (Cage total 0 = AllDifferent
// only, no Sum), and cages sharing the same printed code have the same
// (unknown) total (EqualSum).
//
// Omitted: the letter-to-digit substitution scheme that would pin each
// code's actual numeric total (and would relate codes that share a letter,
// e.g. the "E" in EA/EC/ED/EE/EB) is not stated anywhere available locally,
// so it is not encoded.

// Cage cells, transcribed from the source's drawn cage boundaries (each
// cage's cell list, converted to R#C# ids).
const cages = {
  0: ['R1C1', 'R1C2'],
  1: ['R3C1', 'R3C2'],
  2: ['R7C1', 'R8C1'],
  3: ['R2C2', 'R2C3'],
  4: ['R1C5', 'R2C5', 'R2C6'],
  5: ['R1C7', 'R2C7', 'R3C7'],
  6: ['R1C8', 'R1C9'],
  7: ['R2C8', 'R3C8'],
  8: ['R4C1', 'R5C1'],
  9: ['R4C3', 'R5C3'],
  10: ['R4C5', 'R5C5'],
  11: ['R6C4', 'R6C5'],
  12: ['R4C6', 'R5C6', 'R5C7'],
  13: ['R4C7', 'R4C8'],
  14: ['R6C7', 'R6C8', 'R5C8', 'R5C9', 'R6C9'],
  15: ['R7C2', 'R7C3'],
  16: ['R8C3', 'R8C4'],
  17: ['R7C5', 'R8C5'],
  18: ['R7C6', 'R8C6', 'R9C6'],
  19: ['R7C7', 'R7C8'],
  20: ['R8C8', 'R8C9'],
};

// Printed code per cage (the letter or letter-pair drawn as that cage's total).
const codeOf = {
  0: 'A', 1: 'A', 2: 'A',
  3: 'C', 7: 'C', 15: 'C', 16: 'C', 17: 'C', 19: 'C', 20: 'C',
  10: 'B', 13: 'B',
  4: 'EC', 18: 'EC',
  5: 'ED', 11: 'ED',
  6: 'EA', 8: 'EA',
  9: 'EE',
  12: 'EB',
  14: 'FE',
};

const allDifferentCages = Object.values(cages).map(
  cells => new Cage(0, ...cells));

// Group cage ids sharing a code; codes used by more than one cage tie those
// cages' totals equal (same printed code = same actual total, whatever it
// decodes to).
const byCode = {};
for (const [id, code] of Object.entries(codeOf)) {
  (byCode[code] ??= []).push(+id);
}
const equalCodedTotals = Object.values(byCode)
  .filter(ids => ids.length > 1)
  .map(ids => new EqualSum(...ids.map(id => cages[id])));

return [
  new Shape('9x9'),
  ...allDifferentCages,
  ...equalCodedTotals,
];
