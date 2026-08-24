// Title: Regional Differences
// Author: apiyo
// Video: https://www.youtube.com/watch?v=h1h46S6y5b0
// Source: https://app.crackingthecryptic.com/sudoku/6PB3MLGpFN

// Rules: Normal sudoku rules apply. Along thermometers digits must increase
// from the bulb end. Digits along an arrow sum to the digit in that arrow's
// circle. Digits in cells connected by a white dot are consecutive. Digits in
// cells connected by a black dot have a ratio of 1:2. Each coloured line must
// contain the digits 1 to 9 once each, in any order.
//
// The payload's `regions` array is exactly the default 3x3 boxes, so the
// default Shape('9x9') box/row/column all-different groups already match --
// no NoBoxes/Jigsaw needed.
//
// Two families of lines are distinguished by colour/thickness, matching the
// rules' own vocabulary ("thermometers" vs "coloured line"): thick grey
// (#CFCFCF) lines with a filled grey circle at one end are the thermometers;
// thin orange (#EB7532) lines are the "coloured lines" that must each hold
// 1-9. Grey circles filled solid mark thermo bulbs; white-filled circles with
// a grey border mark arrow circles (see pipeline note: fill colour carries
// the meaning, not the border).

const at = (r, c) => makeCellId(r, c);

// Thermometers: bulb cell first, then increasing toward the tip.
const thermos = [
  ['R4C3', 'R3C2', 'R3C1', 'R4C1', 'R5C2'],
  ['R5C5', 'R4C6', 'R3C5', 'R3C6'],
  ['R6C8', 'R6C7', 'R7C8', 'R7C9', 'R6C9', 'R5C8'],
  ['R6C5', 'R7C4', 'R8C5'],
].map(cells => new Thermo(...cells));

// Arrows: circle cell first, then the arm cells (sum to the circle).
const arrows = [
  ['R4C9', 'R3C9', 'R3C8'],
  ['R6C1', 'R7C1', 'R7C2'],
].map(cells => new Arrow(...cells));

// White dots (consecutive) and black dot (ratio 1:2); only the drawn pairs --
// the rules give no "all dots shown" exhaustiveness clause.
const whiteDots = [
  ['R3C4', 'R3C5'],
  ['R3C5', 'R3C6'],
].map(cells => new WhiteDot(...cells));

const blackDots = [
  ['R7C5', 'R8C5'],
].map(cells => new BlackDot(...cells));

// Coloured lines: each must contain 1-9 once each. With exactly 9 distinct
// grid cells drawn on a 1-9 domain, "all distinct" and "contains every digit"
// coincide, so this is a plain AllDifferent over each line's cell set. Line
// #6 in the source payload draws its stroke crossing itself (revisiting
// R5C3 and R5C7 in the waypoint order) but only covers 9 distinct grid
// cells; the AllDifferent below is over the de-duplicated set.
const colouredLines = [
  ['R1C1', 'R2C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R4C3', 'R5C3', 'R6C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R4C7', 'R6C7'],
  ['R9C1', 'R8C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R8C8', 'R9C9'],
].map(cells => new AllDifferent(...cells));

return [
  new Shape('9x9'),
  ...thermos,
  ...arrows,
  ...whiteDots,
  ...blackDots,
  ...colouredLines,
];
