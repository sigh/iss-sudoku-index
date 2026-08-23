// Title: Palindrometers
// Author: EasilyAmused
// Video: https://www.youtube.com/watch?v=Qg49qtfknlQ
// Source: https://app.crackingthecryptic.com/sudoku/4pqQHjg6rG

// Normal sudoku (standard boxes). Anti-knight: no repeated digit a knight's
// move apart. Killer cages: cells sum to the printed total and are
// all-different. One cell-edge inequality between R9C1 and R9C2: the "<"
// overlay's pointed (left) end names the lower digit, so R9C1 < R9C2.
//
// Two green "palindrometer" lines. Each is drawn as two payload line entries
// that share a bulb endpoint; the connected-stroke union shows each pair is
// one continuous path with the bulb as the true centre cell. A palindrome rule (mirrored cells equal) is encoded with
// the full centred path via `Palindrome`. The "increase from the bulb" rule
// only needs one arm: `GreaterThan` lists cells from the far end down to the
// bulb, forcing a strictly descending chain toward the bulb -- i.e. strictly
// increasing away from it -- and the palindrome symmetry carries that same
// ordering onto the mirrored arm.

return [
  new Shape('9x9'),

  new AntiKnight(),

  new Cage(21, 'R1C1', 'R2C1', 'R2C2', 'R1C2'),
  new Cage(18, 'R1C8', 'R2C8', 'R2C9', 'R1C9'),
  new Cage(30, 'R8C9', 'R8C8', 'R9C8', 'R9C9'),
  new Cage(7, 'R8C3', 'R9C3'),

  new GreaterThan('R9C2', 'R9C1'),

  // Line 1: bulb R3C3, full path R7C3..R3C3..R3C7 (9 cells, centred).
  new Palindrome(
    'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'),
  new GreaterThan('R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3'),

  // Line 2: bulb R7C7, full path R4C7..R7C7..R7C4 (7 cells, centred).
  new Palindrome(
    'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R7C6', 'R7C5', 'R7C4'),
  new GreaterThan('R4C7', 'R5C7', 'R6C7', 'R7C7'),
];
