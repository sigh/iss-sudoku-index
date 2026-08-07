// Title: Diophantine Addict
// Author: Glen Fletcher
// Video: https://www.youtube.com/watch?v=oETiygzjlvk
// Source: https://app.crackingthecryptic.com/sudoku/tJDTF2TbgP

// Normal sudoku (9x9, standard boxes). Killer cages: digits don't repeat and
// sum to the total. Black dots: Kropki ratio 1:2, adjacent cells only.
// Arrows: digits along the arrow sum to the digit(s) shown in the circle at
// its start; several arrows may share one circle, each giving an independent
// equation on that same circled value (the puzzle's titular Diophantine
// systems). A two-cell circle shows a 2-digit number read left-to-right
// (side-by-side pair) or top-to-bottom (stacked pair); the circle cells
// themselves are not part of any arm. Orange line: palindrome (values read
// the same in both directions).

// Cages: sum + distinct-digits per group (raw cages array).
const cages = [
  new Cage(10, 'R1C1', 'R1C2', 'R1C3'),
  new Cage(35, 'R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9'),
  new Cage(24, 'R7C5', 'R7C6', 'R8C5', 'R8C6'),
  new Cage(43, 'R5C2', 'R6C2', 'R7C2', 'R7C3', 'R8C2', 'R8C3', 'R9C2', 'R9C3'),
];

// Black dots (edge-sized filled-black overlays): Kropki ratio 1:2.
const blackDots = [
  new BlackDot('R6C1', 'R7C1'),
  new BlackDot('R6C5', 'R7C5'),
  new BlackDot('R8C7', 'R9C7'),
];

// Orange line, path R4C6-R5C6-R6C6-R6C7-R6C8 (odd length: R6C6 is its own
// centre, unconstrained beyond the mirrored pairs).
const palindrome = new Palindrome(
  'R4C6', 'R5C6', 'R6C6', 'R6C7', 'R6C8');

// Single-cell circles: Arrow(bulb, ...arm) -- the first cell is the circle.
const arrows = [
  new Arrow('R3C1', 'R4C1', 'R5C1'),
  new Arrow('R3C1', 'R4C2'),
  new Arrow('R3C4', 'R4C3', 'R5C3'),
  new Arrow('R3C4', 'R4C4', 'R5C4', 'R5C5'),
  new Arrow('R3C4', 'R4C5'),
  new Arrow('R5C2', 'R6C2', 'R7C2'),
  new Arrow('R9C3', 'R8C3', 'R7C3'),
  new Arrow('R9C3', 'R9C2', 'R8C2'),
];

// Two-cell circles: PillArrow(2, pillCell1, pillCell2, ...armCells) -- pill
// digits first in reading order (left-to-right / top-to-bottom), then the
// non-pill arm; the two arrows sharing a circle each get their own
// PillArrow against the same pill cells.
const pillArrows = [
  new PillArrow(2, 'R3C8', 'R3C9', 'R4C8', 'R5C8', 'R5C7', 'R4C7'),
  new PillArrow(2, 'R3C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new PillArrow(2, 'R7C4', 'R8C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R8C8'),
  new PillArrow(2, 'R7C4', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R9C7', 'R9C8'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...blackDots,
  palindrome,
  ...arrows,
  ...pillArrows,
];
