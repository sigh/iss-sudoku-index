// Title: Murder by Numbers
// Author: Lil_Sis and Big_Bro
// Video: https://www.youtube.com/watch?v=CSwuLgHwCDI
// Source: https://sudokupad.app/nxzelh1c6v

// Normal sudoku rules apply. The grey outline is cut into segments by the thick
// cell walls and each segment sums to the total given. If the outline only cuts
// through half a cell, only half the value of the number is included in the
// total. Cells divided in half always contain an even number. In cells joined by
// a red dot, one digit is double the other. Neighbouring digits along a green
// line have a difference of at least 5. The yellow squares reveal a number that
// corresponds to a letter of the alphabet (based on a=1 ... z=26). Revealing the
// killer in this way is required!
//
// Omitted: the letters read out of the yellow squares must name the killer. The
// puzzle supplies no cast of suspects and no name, so there is no candidate set
// to test a five-letter string against; only "each yellow number is a letter",
// i.e. at most 26, is encoded.

const shape = new Shape('9x9');

// The grey outline is an open stroke whose two ends both sit on the row3/row4
// box wall, at the top-left corner of R4C3 and the top-right corner of R4C6; that
// wall closes it. Its diagonal stretches cut cells corner to corner, so every
// cell it crosses is split into exactly two halves and no cell is split any other
// way -- which is what "only cuts through half a cell" and "cells divided in half"
// describe. The enclosed area falls entirely in boxes 4, 5, 7 and 8, one segment
// per box, matching the four printed totals, each drawn in a wholly-enclosed cell
// of its own segment.
//
// Per segment: [total, cells wholly inside, cells the outline halves].
const outlineSegments = [
  [27, ['R4C3', 'R5C3', 'R6C3'], ['R4C2', 'R5C1', 'R5C2', 'R6C1']],
  [16, ['R4C4', 'R4C5', 'R5C4', 'R6C4'], ['R4C6', 'R6C5']],
  [11, ['R7C3', 'R9C2'], ['R8C2', 'R8C3']],
  [17, ['R7C5'], ['R7C4', 'R8C4', 'R8C5']],
];

// Halved cells count half their value, so the equation is doubled to stay
// integral: 2*total = 2*(whole cells) + 1*(halved cells).
const segmentSums = outlineSegments.map(
  ([total, whole, halved]) =>
    new Sum(2 * total, ...whole.map((cell) => [cell, 2]), ...halved));

const halvedAreEven = outlineSegments.flatMap(
  ([, , halved]) => halved.map((cell) => new Given(cell, 2, 4, 6, 8)));

// Green lines. The first is drawn as three strokes that share endpoints and form
// one connected line: a springgreen bend R2C4-R2C5-R3C5-R3C6, a lime diagonal
// R2C4-R3C3, and a lime stub leaving R3C6 that reaches no further cell centre.
// Both lime strokes run half a cell past their last centre, ending on the two
// ends of the grey outline; that overshoot carries no cell of its own.
const whispers = [
  ['R3C3', 'R2C4', 'R2C5', 'R3C5', 'R3C6'],
  ['R2C8', 'R3C8', 'R3C7', 'R4C7'],
  ['R9C7', 'R9C8', 'R8C8', 'R8C9', 'R7C9'],
].map((cells) => new Whisper(5, ...cells));

const redDots = [
  ['R5C1', 'R6C1'],
  ['R4C4', 'R5C4'],
  ['R4C6', 'R5C6'],
  ['R7C3', 'R8C3'],
  ['R8C5', 'R8C6'],
].map((pair) => new BlackDot(...pair));

// The nine yellow squares sit as four horizontally adjacent pairs plus the lone
// R1C4. A pair is read left to right as a two-digit number, which is what makes
// the rule's range run to z=26; the lone square is a one-digit number and is
// unrestricted, since 1..9 are all letters.
const letterKey = Pair.fnToKey((tens, ones) => 10 * tens + ones <= 26, shape);
const yellowPairs = [
  ['R2C1', 'R2C2'],
  ['R5C8', 'R5C9'],
  ['R7C7', 'R7C8'],
  ['R9C3', 'R9C4'],
].map(([tens, ones]) => new Pair(letterKey, 'letter <= 26', tens, ones));

return [
  shape,
  ...segmentSums,
  ...halvedAreEven,
  ...redDots,
  ...whispers,
  ...yellowPairs,
];
