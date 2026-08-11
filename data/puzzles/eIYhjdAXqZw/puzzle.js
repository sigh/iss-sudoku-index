// Title: One Ring to Rule 8 of 9
// Author: Legor455
// Video: https://www.youtube.com/watch?v=eIYhjdAXqZw
// Source: https://app.crackingthecryptic.com/sudoku/ndLtJqfLhd

// Normal sudoku on the default 3x3 boxes (payload regions equal the default
// boxes, so no explicit Regions/NoBoxes are needed). One given: R9C9=3.
//
// Six cages: "Digits in a cage must sum to the number in the top left
// corner. Digits CAN repeat in a cage when allowed by the normal rules of
// sudoku" -> Sum (not Cage: the rule explicitly allows repeats beyond
// row/column/box, so cage membership adds no extra all-different).
//
// Twelve white dots: "Digits separated by a white dot must be consecutive.
// Not all white dots are given" -> WhiteDot on each drawn pair only; no
// negative constraint for undotted adjacent pairs.
//
// Circles: "Digits in a circle appear in the surrounding 4 cells." The
// payload draws, at each of the 4 grid corners, one blank ring-styled
// circle (no printed digits, part of the puzzle's decorative "ring" motif)
// plus two separate printed circles, each holding 2 digits, both centred on
// the same 2x2 corner (raw overlay coordinates for each pair sit within
// ~0.15-0.3 grid units of the same corner intersection, nudged apart only
// so the app can render two circles without full overlap). ISS's Quad has
// UNIQUENESS_KEY_FIELD 'topLeftCell' and merges same-corner constraints
// "last one wins", so the two circles at a corner are combined into one
// Quad carrying both digit sets -- equivalent to their conjunction, since
// each just requires its own digits present among the same 4 cells. The
// blank ring circles carry no digits, so the rule constrains nothing at
// them; they are decorative and unencoded.
const cages = [
  new Sum(9, 'R2C2', 'R2C3', 'R2C4'),
  new Sum(11, 'R1C7', 'R1C8'),
  new Sum(47, 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7', 'R6C7'),
  new Sum(17, 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R7C5', 'R7C6', 'R7C4'),
  new Sum(21, 'R4C5', 'R6C5', 'R5C4', 'R5C5', 'R5C6'),
  new Sum(14, 'R9C6', 'R9C5'),
];

const whiteDots = [
  new WhiteDot('R1C5', 'R2C5'),
  new WhiteDot('R3C2', 'R3C3'),
  new WhiteDot('R3C3', 'R4C3'),
  new WhiteDot('R3C6', 'R3C7'),
  new WhiteDot('R3C7', 'R4C7'),
  new WhiteDot('R4C8', 'R5C8'),
  new WhiteDot('R6C6', 'R6C7'),
  new WhiteDot('R7C6', 'R7C7'),
  new WhiteDot('R8C8', 'R8C9'),
  new WhiteDot('R7C2', 'R7C3'),
  new WhiteDot('R6C3', 'R6C4'),
  new WhiteDot('R1C9', 'R2C9'),
];

return [
  new Shape('9x9'),
  new Given('R9C9', 3),
  ...cages,
  ...whiteDots,
  new Quad('R1C1', 1, 2, 5, 8),
  new Quad('R1C8', 7, 8, 4, 6),
  new Quad('R8C1', 1, 2, 3, 4),
  new Quad('R8C8', 3, 5, 6, 7),
];
