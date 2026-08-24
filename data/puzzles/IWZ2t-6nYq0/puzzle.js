// Title: Bahamas
// Author: Qodec
// Video: https://www.youtube.com/watch?v=IWZ2t-6nYq0
// Source: https://app.crackingthecryptic.com/sudoku/7hhdhdft3r

// Normal sudoku rules apply. Cages sum to the small clue in their top-left
// corner and forbid repeats within the cage. "No swimming!" is a flavour
// line tied to the title: the payload draws no geometry beyond the cages
// and standard boxes for it to attach to, and no other rules sentence
// gives it a mechanical meaning, so it is omitted as a UI-only note
// rather than encoded.

return [
  new Shape('9x9'),

  // Cages: cell lists and totals from the drawn `cages` array.
  new Cage(14, 'R1C1', 'R1C2'),
  new Cage(10, 'R1C4', 'R1C5'),
  new Cage(10, 'R1C7', 'R1C8'),
  new Cage(10, 'R3C3', 'R3C4'),
  new Cage(10, 'R4C1', 'R4C2'),
  new Cage(5, 'R4C4', 'R4C5'),
  new Cage(9, 'R5C5', 'R5C6'),
  new Cage(10, 'R4C7', 'R4C8'),
  new Cage(9, 'R5C8', 'R6C8', 'R7C8'),
  new Cage(15, 'R7C1', 'R7C2'),
  new Cage(14, 'R8C2', 'R9C2'),
  new Cage(12, 'R7C4', 'R7C5'),
  new Cage(11, 'R8C5', 'R9C5', 'R8C4'),
  new Cage(6, 'R8C9', 'R9C9'),
];
