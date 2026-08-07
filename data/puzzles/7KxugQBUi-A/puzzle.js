// Title: Foggy on the Details
// Author: Karl the Fog!
// Video: https://www.youtube.com/watch?v=7KxugQBUi-A
// Source: https://sudokupad.app/e3dz5lytps

// Normal 6x6 Sudoku, 2x3 boxes, no givens. The rules text states one rule set
// and eight speech bubbles drawn on the grid revise it; the revised set is what
// is encoded here.
//
// - Red lines are Region Sum lines and blue lines are Modular lines, the
//   opposite of the rules text. The bubble drawn on R6C4, a cell of the red
//   line, reads "Hold on, did I get the line colours backwards?". The literal
//   assignment - Modular on the red line, Region Sum on the blue lines - has no
//   completion at all, with or without the other bubbles applied.
// - Lines may move diagonally ("Like I said, lines can also move diagonally",
//   drawn over R5C1/R5C2). The red line's waypoints step R6C1 -> R5C2 -> R6C3
//   across cell corners, so its path is read with those diagonal steps.
// - Lines may share cells ("Oops! Lines *can* share cells, sorry!", drawn in
//   R1C3). The short blue stroke up column 3 ends inside R1C3, a cell the blue
//   row-1 line already covers.
// - Digits may repeat in a cage ("Huh! Maybe digits can repeat in cages after
//   all!", drawn in the 7-cell cage). Seven cells cannot hold seven different
//   digits from 1-6, so cages are Sum, not Cage.
// - A cage total may be drawn anywhere in its cage ("Well, I guess cage clues
//   can go wherever, really."). The three totals sit in the upper-left of R1C1,
//   the upper-right of R1C6 and the lower-right of R5C6 - no single corner rule
//   fits all three - so each total is matched to the cage containing its cell.
//
// Drawn but carrying no digit rule: the fog and its four "foglight" cage
// entries (R3C3; R1C4/R1C5; R5C4; R4C5), the fog emoji above column 4, and the
// heap of tiny strokes and loose digits in R6C6 that its own bubble calls
// unused. The red line is drawn twice over the same waypoints, matching the
// rules text stating the red-line rule twice; one constraint covers both.
// "Cages don't overlap" and the two revised line-drawing rules describe the
// drawing rather than the digits, so they add no constraint.
return [
  new Shape('6x6'),

  // Killer cage totals, each read from the number drawn inside that cage.
  new Sum(15, 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R3C5'),
  new Sum(20, 'R1C1', 'R2C1', 'R3C1', 'R3C2', 'R4C1'),
  new Sum(28, 'R4C6', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R6C5'),

  new RegionSumLine('R5C1', 'R6C1', 'R5C2', 'R6C3', 'R6C4', 'R6C5', 'R5C5', 'R5C6'),

  new Modular(3, 'R1C1', 'R1C2', 'R1C3', 'R1C4'),
  new Modular(3, 'R3C3', 'R2C3', 'R1C3'),
  new Modular(3, 'R2C5', 'R3C5', 'R3C6'),
  new Modular(3, 'R4C6', 'R4C5', 'R4C4', 'R3C4'),
];
