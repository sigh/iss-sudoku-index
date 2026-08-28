// Title: The CTC Symphony
// Author: Scott Strosahl & Xave Ruth
// Video: https://www.youtube.com/watch?v=nlGbyMSA1DA
// Source: https://cracking-the-cryptic.web.app/sudoku/MtP8J7p3LQ

// Normal sudoku rules (default 3x3 boxes).
//
// Thermometers: digits increase from the bulb. Six of the eleven drawn lines
// carry the bulb at an interior cell rather than an end, so digits increase
// away from the bulb in both directions -- encoded as two Thermo arms per
// such line, each starting at the shared bulb cell.
//
// Cipher: letters C, S, Y, M, P, H, O, N are printed on the nine main-diagonal
// cells R1C1..R9C9 (Y repeats, at R3C3 and R9C9); a ninth letter, T, is named
// only by the outside clue below and printed on no cell. All nine letters
// hold pairwise-distinct digits 1-9, and repeated letters share a digit.
//
// Outside diagonal-sum clue "CT" (a green arrow at the top-left corner
// pointing down-right into R1C1): CT is the two-digit number formed by
// letters C (tens) and T (units), and it equals the sum of the nine digits
// on the main diagonal R1C1..R9C9. No diagonal-all-different rule is stated
// (and R3C3/R9C9 deliberately share a digit via letter Y), so the diagonal
// cells are not otherwise constrained against each other.

return [
  new Shape('9x9'),

  // Thermometers -- cell order starts at the bulb (provenance: drawn grey
  // lines with a grey bulb circle marking each thermo's start).
  new Thermo('R3C2', 'R3C1'),
  new Thermo('R3C2', 'R3C3', 'R3C4'),
  new Thermo('R3C7', 'R3C6', 'R3C5'),
  new Thermo('R3C7', 'R3C8', 'R3C9'),
  new Thermo('R4C5', 'R4C4', 'R4C3', 'R4C2', 'R4C1'),
  new Thermo('R4C7', 'R4C6'),
  new Thermo('R4C7', 'R4C8', 'R4C9'),
  new Thermo('R5C2', 'R5C1'),
  new Thermo('R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7'),
  new Thermo('R5C8', 'R5C9'),
  new Thermo('R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7'),
  new Thermo('R6C9', 'R6C8'),
  new Thermo('R7C4', 'R7C3', 'R7C2', 'R7C1'),
  new Thermo('R7C4', 'R7C5', 'R7C6'),
  new Thermo('R7C7', 'R7C8', 'R7C9'),
  new Thermo('R8C6', 'R8C5'),
  new Thermo('R8C6', 'R8C7'),

  // Cipher letter Y repeats on the diagonal: both cells share its digit.
  new SameValues(2, 'R3C3', 'R9C9'), // Y

  // Auxiliary cell for letter T's digit: named by the outside clue, printed
  // on no grid cell.
  new Var('T', 'digit for letter T'),

  // The nine cipher letters (C, S, Y, M, P, H, O, N, T) are pairwise
  // distinct digits. One representative cell per letter; Y's is R3C3
  // (tied to R9C9 above).
  new AllDifferent(
    'R1C1', // C
    'R2C2', // S
    'R3C3', // Y
    'R4C4', // M
    'R5C5', // P
    'R6C6', // H
    'R7C7', // O
    'R8C8', // N
    'VT',   // T
  ),

  // Outside clue: 10*C + T = sum of the nine main-diagonal cells (R3C3 and
  // R9C9 both counted, since both hold Y's digit).
  new Sum(
    0,
    ['R1C1', -9], 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9',
    ['VT', -1],
  ),
];
