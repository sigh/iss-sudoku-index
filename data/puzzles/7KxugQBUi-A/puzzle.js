// Title: Foggy on the Details
// Author: Karl the Fog!
// Video: https://www.youtube.com/watch?v=7KxugQBUi-A
// Source: https://sudokupad.app/e3dz5lytps

// Normal 6x6 Sudoku, 2x3 boxes. The rules text is delivered by an unreliable
// narrator: every rule it first states turns out to be wrong somewhere in a
// fog-revealed correction, each sitting at the specific edge/cell it
// corrects (a mistaken "upper left" cage corner, "lines can't share cells",
// "digits can't repeat" are each corrected at the instance they describe).
// By that pattern, the line colours are also swapped from how they are first
// introduced: the "did I get the line colours backwards? Oh dear..." bubble
// is the same hesitant-but-correct voice as every other correction, so red
// lines are "Region Sum" and blue lines are "Modular", not as first stated.
// Two corrections are confirmed by the drawn geometry itself, not just by
// tone: the red line's own waypoints jump diagonally (R6C1->R5C2->R6C3), and
// the "lines can share cells" bubble sits on R1C3 -- the only cell where a
// short blue line (R3C3-R2C3) would otherwise need two identical values in
// the same column (R2C3=R3C3) if it stopped short, which normal Sudoku
// forbids, so the line must extend through the shared cell.
// The three numbered cage totals are not in any consistent corner -- three
// separate corrections about their placement end with "cage clues can go
// wherever, really" -- so each total is assigned by which cage's cells
// contain it, not by position. Two of the three cages (sums 15, 20) still
// resolve to fully distinct digits from their sum alone (5 distinct 1-6
// digits summing to 15 or 20 has only one set each), matching ordinary
// Killer-cage semantics. The third (sum 28) has 7 cells but only 6 possible
// digits, so an all-different reading is impossible by pigeonhole; its own
// "digits can repeat in cages after all!" bubble sits inside that cage,
// confirming the repeat-allowed reading is local to it.
return [
  new Shape('6x6'),

  // Killer cages: totals read from free-floating numbers, matched to their
  // cage by containment (position is explicitly unreliable, see above).
  new Cage(15, 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R3C5'),
  new Cage(20, 'R1C1', 'R2C1', 'R3C1', 'R3C2', 'R4C1'),
  // 7 cells, 6-symbol alphabet: all-different is impossible; repeats allowed
  // here only, per the correction bubble inside this cage.
  new Sum(28, 'R4C6', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R6C5'),

  // Red Region Sum line: each segment split by a box border sums equally.
  // Cell order follows the drawn path, including its diagonal jumps.
  new RegionSumLine('R5C1', 'R6C1', 'R5C2', 'R6C3', 'R6C4', 'R6C5', 'R5C5', 'R5C6'),

  // Blue Modular(3) lines: every 3 consecutive cells hold one digit each from
  // {1,4}, {2,5}, {3,6}.
  new Modular(3, 'R1C1', 'R1C2', 'R1C3', 'R1C4'),
  // Extended through R1C3, shared with the line above (see note at top).
  new Modular(3, 'R3C3', 'R2C3', 'R1C3'),
  new Modular(3, 'R2C5', 'R3C5', 'R3C6'),
  new Modular(3, 'R4C6', 'R4C5', 'R4C4', 'R3C4'),
];
