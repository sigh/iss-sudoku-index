// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=kxcFKeyER0o
// Source: https://cracking-the-cryptic.web.app/sudoku/pdbPTjmPBj

// Normal 6x6 sudoku: digits 1-6, no repeat in a row, column or box. The six
// regions drawn in the source are the standard 2-row-by-3-column boxes, which
// are exactly what Shape('6x6') already builds, so no explicit Region is
// needed. There are no givens.
//
// Four light-grey strokes are drawn, each with one solid grey filled circle on
// an end cell: a thermometer-family clue (an arrow bulb would be a hollow
// circle with a coloured border; a between-line would carry a circle at both
// ends). Digits along a stroke are strictly ordered end to end.
//
// The usual orientation of that family -- circled end low, increasing away from
// it -- is impossible here, and so is its mirror. Taking strokes A and B alone
// with only the row and column rules: each is six cells long, so increasing
// from its circle forces A to read 1,2,3,4,5,6 from R5C6 and B to read
// 1,2,3,4,5,6 from R2C1; column 1 then holds 1-5 in rows 2-6, forcing R1C1=6,
// which collides with R1C5=6 from A. Reading both the other way is the digit
// complement of that picture and collides at 1 instead. So the two strokes run
// in opposite senses and the circle does not fix a direction grid-wide.
//
// Nothing drawn says which strokes rise from their circle and which fall: the
// four circles and four strokes are identical in colour, size and style, and
// no written rule accompanies the grid. OMITTED: the per-stroke orientation
// rule. What is encoded is the part the drawing does settle -- each stroke is
// strictly monotone along its own length, in one direction or the other --
// as a disjunction of the two Thermos over each stroke's cells. This is a
// relaxation: it accepts every orientation assignment, including any the
// unrecovered rule would forbid.

// One stroke, direction unresolved: increasing along the listed cells, or
// increasing along their reverse.
function monotoneStroke(...cells) {
  return new Or([new Thermo(...cells), new Thermo(...cells.slice().reverse())]);
}

// The four drawn strokes, each listed from its circled end. Strokes B, C and D
// are drawn tip-first in the source, so these lists reverse the drawn waypoint
// order; the circle marks the end, not the drawing order.
return [
  new Shape('6x6'),

  monotoneStroke('R5C6', 'R4C6', 'R3C6', 'R2C6', 'R1C6', 'R1C5'),
  monotoneStroke('R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R6C2'),
  monotoneStroke('R2C2', 'R1C2', 'R1C3', 'R1C4'),
  monotoneStroke('R6C4', 'R5C4', 'R5C3', 'R5C2'),
];
