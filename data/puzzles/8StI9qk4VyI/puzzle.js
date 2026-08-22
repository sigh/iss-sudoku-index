// Title: Computer Killer Sudoku
// Author: Rodolphe Lepigre
// Video: https://www.youtube.com/watch?v=8StI9qk4VyI
// Source: https://app.crackingthecryptic.com/sudoku/36gndhn8ND

// Normal sudoku rules apply. Each cage's digits cannot repeat and sum to the
// small number printed in its top-left corner -- but that printed number is
// written in binary, octal, or hexadecimal (base 2, 8, or 16), not decimal,
// and the rules do not say which base applies to which cage.
//
// For every cage the printed digit string is decoded against each base in
// {2, 8, 16}: a base is a live candidate only when (a) every printed
// character is a valid digit in that base, and (b) the resulting decimal
// value falls within the cage's achievable sum range (the sum of the
// smallest/largest n distinct digits from 1-9, or 1-9 itself for a
// single-cell cage). Where exactly one base survives both checks, the cage
// total is that decimal value. Where more than one base survives, the
// choice is left to the solver's global deductions, so the cage is encoded
// as a disjunction over every surviving total (still cage-local
// all-different) rather than one guessed value -- Convergence bars fitting
// a single reading to the puzzle's answer.

// A cage whose printed total needed base-decoding: all-different is asserted
// once, and the surviving decimal reading(s) -- the values that survive the
// digit-validity and achievable-range checks described above -- are asserted
// as a disjunction of `Sum`s. Wrapped in `Or` even where exactly one reading
// survives, so every cage total in this script is visibly a *decoded*
// reading of the printed digits, never the printed digits themselves.
function decodedCage(sums, ...cells) {
  return [
    new AllDifferent(...cells),
    new Or(sums.map(s => new Sum(s, ...cells))),
  ];
}

return [
  new Shape('9x9'),

  // Unambiguous cages: exactly one of {bin, oct, hex} both parses the
  // printed digits and fits the cage's achievable sum range.
  ...decodedCage([24], 'R1C1', 'R2C1', 'R1C2'),   // "30" octal (bin: digit 3 invalid; hex 48 > max 24)
  ...decodedCage([11], 'R3C2', 'R3C3'),           // "13" octal (bin: digit 3 invalid; hex 19 > max 17)
  ...decodedCage([37], 'R1C6', 'R1C5', 'R1C4', 'R2C4', 'R3C4', 'R2C5', 'R3C5'), // "45" octal (hex 69 > max 42)
  ...decodedCage([9], 'R4C7', 'R4C8', 'R4C9'),    // "9" hex (bin/oct: digit 9 invalid)
  ...decodedCage([17], 'R6C8', 'R6C9'),           // "21" octal (bin: digit 2 invalid; hex 33 > max 17)
  ...decodedCage([5], 'R7C8', 'R7C9'),            // "101" binary (oct 65, hex 257 both > max 17)
  ...decodedCage([10], 'R7C2', 'R7C3'),           // "12" octal (bin: digit 2 invalid; hex 18 > max 17)
  ...decodedCage([24], 'R6C1', 'R7C1', 'R8C1', 'R9C1'), // "18" hex (bin/oct: digit 8 invalid)
  ...decodedCage([15], 'R6C3', 'R5C3'),           // "F" hex only -- F is not a binary or octal digit
  ...decodedCage([12], 'R4C2', 'R5C2'),           // "14" octal (bin: digit 4 invalid; hex 20 > max 17)
  ...decodedCage([24], 'R4C4', 'R5C4', 'R6C4'),   // "18" hex (bin/oct: digit 8 invalid)

  // Single-cell cages: an unambiguous one fixes the digit directly.
  new Given('R2C9', 4),  // "100" binary (oct 64, hex 256 both > 9)
  new Given('R8C3', 1),  // "1" -- same value (1) in every base

  // Single-cell cages where two bases both survive: the digit is one of the
  // surviving values, encoded as a multi-value Given.
  new Given('R9C6', 2, 8), // "10": binary 2 or octal 8 (hex 16 > 9)
  new Given('R9C5', 2, 8), // "10": binary 2 or octal 8 (hex 16 > 9)

  // Multi-cell cages with more than one surviving base: cage-local
  // all-different plus a disjunction over the surviving totals.
  ...decodedCage([3, 9, 17], 'R2C7', 'R3C7'),   // "11": bin 3, oct 9, or hex 17 (all fit range 3-17)
  ...decodedCage([8, 16], 'R3C8', 'R3C9'),      // "10": octal 8 or hex 16 (bin 2 < min 3)
  ...decodedCage([8, 16], 'R5C8', 'R5C9'),      // "10": octal 8 or hex 16 (bin 2 < min 3)
  ...decodedCage([10, 18], 'R8C9', 'R9C9', 'R9C8'), // "12": octal 10 or hex 18 (bin: digit 2 invalid)
  ...decodedCage([12, 20], 'R7C7', 'R8C7', 'R9C7'), // "14": octal 12 or hex 20 (bin: digit 4 invalid)
  ...decodedCage([9, 17], 'R7C4', 'R8C4', 'R9C4'),  // "11": oct 9 or hex 17 (bin 3 < min 6)
  ...decodedCage([15, 23], 'R4C5', 'R5C5', 'R6C5', 'R5C6', 'R6C6'), // "17": oct 15 or hex 23 (bin: digit 7 invalid)
  ...decodedCage([3, 9, 17], 'R3C6', 'R4C6'),   // "11": bin 3, oct 9, or hex 17 (all fit range 3-17)
];
