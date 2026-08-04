// Title: And Then There Were None
// Author: fjam
// Video: https://www.youtube.com/watch?v=PnWctUoudKk
// Source: https://app.crackingthecryptic.com/sudoku/mJ84P77h6g

// Normal sudoku rules (rows, columns, boxes) apply, but the digit alphabet is
// 0-9 (ten symbols) and only nine of them are used: "one unidentified digit
// confesses to the murder of the other nine ... filling in the grid
// legitimately with the nine victims, leaving out the murderer." Every row,
// column and box must therefore hold the SAME nine-digit subset of 0-9 --
// widen the value range and force every largest region to agree on one
// nine-digit set.
//
// The rules text tells the story of the murders as a rhyming countdown; each
// line names a drawn clue type. One line of the rhyme is not encoded at all:
// the "red herring" that "took a trip out to sea" (a short mark near
// R1C9/R2C8 with no numeric value anywhere in the payload). "Crushed by
// stones" also has no geometry that could be matched to it with confidence:
// the two same-coloured, same-thickness, same-shaped red lines below are the
// only candidates, and nothing drawn or stated distinguishes which one is
// the parity line of verse 6 and which is left over for "stones" -- so both
// pairings are encoded as a disjunction rather than asserting one.
// The four single-cell "no total" cages in the payload (R6C6, R8C2, R8C9, R4C8)
// each coincide with a cell already pinned by one of the encoded clues below
// (arrow tip, Renban centre, dot-chain end, the odd cell); a one-cell
// no-total cage adds no independent constraint of its own.
const shape = new Shape('9x9', '0-9');

// Sandwich (verse 1): thin-rectangle marks at R1C3 and R1C5 are the crusts.
// "Sandwich crusts ... contain the highest and lowest digits in the grid."
// Because every row shares the same nine-digit set (RegionSameValues above),
// row 1's own maximum and minimum ARE the grid's maximum and minimum, so the
// crust cells can be checked against the other seven cells of row 1 alone.
// Which crust is the max and which is the min is left open by the rules, so
// both assignments are encoded as a disjunction. ("Evenly spread" is not
// encoded: no clue number or further arithmetic is given anywhere in the
// payload to fix a numeric reading.)
const crustA = 'R1C3';
const crustB = 'R1C5';
const row1Others = ['R1C1', 'R1C2', 'R1C4', 'R1C6', 'R1C7', 'R1C8', 'R1C9'];
const ge = Pair.fnToKey((a, b) => a >= b, shape);
const sandwichOrder = (hi, lo) => new And([
  ...row1Others.map(c => new Pair(ge, '', hi, c)),
  ...row1Others.map(c => new Pair(ge, '', c, lo)),
]);
const sandwich = new Or([
  sandwichOrder(crustA, crustB),
  sandwichOrder(crustB, crustA),
]);

// Whisper (verse 3), two green lines crossing at R2C2 -- "the crossing" is
// just which cell is shared, not an extra rule.
const whispers = [
  new Whisper(5, 'R1C2', 'R2C2', 'R3C2', 'R4C2'),
  new Whisper(5, 'R2C1', 'R2C2', 'R2C3'),
];

// Renban (verse 4): purple line, three cells holding a consecutive,
// non-repeating set in any order.
const renban = new Renban('R7C2', 'R8C2', 'R9C2');

// Arrow (verse 5): grey line with bulb at R6C2; the arm sums to the bulb.
const arrow = new Arrow('R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6');

// Parity (verse 6), "shot for different parity": adjacent cells alternate
// odd/even, which is exactly Modular(2). Two red lines share both endpoints
// (R4C4, R4C7) and are visually identical (colour, thickness, waypoint
// count); which one is verse 6's parity line is left open by the source, so
// the disjunction over both is encoded rather than picking one. (The other
// line, whichever it is, also does not fit any other tested line class, so
// no reading is asserted for it beyond this disjunction.)
const parityLine = new Or([
  new Modular(2, 'R5C3', 'R4C4', 'R3C5', 'R3C6', 'R4C7'),
  new Modular(2, 'R3C3', 'R4C4', 'R5C5', 'R5C6', 'R4C7'),
]);

// Glue (verse 8): a chain of white (consecutive) Kropki dots down the right
// edge, R4C9 through R8C9.
const glueChain = new WhiteDot('R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9');

// Thermometer (verse 9), "melted at peak temperature": thick grey line with
// a filled bulb at R9C6 (the peak); values strictly increase away from it.
const thermo = new Thermo('R9C6', 'R9C5', 'R8C4', 'R7C4', 'R8C5', 'R8C6');

// Odd (verse 10), "oddly still killed": solid grey circle shading on R4C8,
// the standard odd-cell marker.
const oddCell = new Given('R4C8', 1, 3, 5, 7, 9);

return [
  shape,
  new RegionSameValues(),
  sandwich,
  ...whispers,
  renban,
  arrow,
  parityLine,
  glueChain,
  thermo,
  oddCell,
];
