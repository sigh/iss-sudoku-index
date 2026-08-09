// Title: Region Renbanmos
// Author: Memeristor
// Video: https://www.youtube.com/watch?v=bQ-h4VWrm4g
// Source: https://app.crackingthecryptic.com/sudoku/Qj9jRR9r7f

// Normal sudoku rules apply (rows, columns, boxes all-different -- ISS
// default). Along each coloured line, the digit-sum within each box the line
// passes through must form a consecutive ascending sequence read in the
// line's drawn order; a box the line re-enters contributes a separate segment
// per visit (transcribed from `lines[].wayPoints`, walked segment-by-segment
// on a box-boundary crossing). No class expresses "segment sums are
// consecutive ascending" directly, so each line is a chain of coefficient
// `Sum` constraints: consecutive segments A, B get `Sum(1, ...B(+1),
// ...A(-1))`, i.e. sum(B) - sum(A) = 1. Chaining every adjacent pair forces
// the whole sequence to consecutive ascending values without naming them.
//
// The rules' own worked example fixes a reading direction only for the
// deepskyblue line: box3, then box2, then box6, "ordered from lowest to
// highest" -- so deepskyblue's segment order (as drawn) must run low to
// high. No other line has a directional marker (arrowhead, bulb) in the
// geometry or a mention in the rules text, so which end of each other line
// is the low end is not decidable from the source. Encoding every line
// low-to-high in its drawn order is not a safe default here: that reading is
// globally unsatisfiable in combination with deepskyblue's forced direction
// (proved by exhaustive search on the two lines alone, independent of any
// solution). Each other line is therefore encoded as the disjunction of
// both reading directions.

const given = new Given('R6C7', 1);

// Each line's cells grouped into box-segments, in the order the line is
// drawn (from the geometry summary's walk order, which also names re-entered
// boxes as separate segments).

// deepskyblue: box3 | box2 | box6 -- direction fixed by the rules' example
const blueSegments = [['R2C8', 'R2C7', 'R3C7'], ['R3C6'], ['R4C7', 'R4C8', 'R4C9']];

// Every other line: direction not decidable from the source (see above).
const otherLineSegments = [
  // gold: box2 | box1 | box4 | box1 (re-enter) | box4 (re-enter)
  [['R1C4'], ['R1C3', 'R2C2', 'R3C1'], ['R4C1'], ['R3C2', 'R3C3'], ['R4C3', 'R5C3']],
  // purple: box7 | box4 | box8
  [['R9C3', 'R8C3', 'R7C3'], ['R6C3'], ['R7C4', 'R8C5']],
  // red: box3 | box2
  [['R1C8', 'R1C7'], ['R2C6', 'R3C5']],
  // yellowgreen: box5 | box6
  [['R4C4', 'R4C5', 'R4C6'], ['R5C7', 'R6C7']],
  // chocolate: box5 | box8 | box9 | box6
  [['R6C5'], ['R7C6'], ['R8C7', 'R7C8', 'R7C9'], ['R6C9']],
  // lightgray: box8 | box9
  [['R8C6', 'R9C6'], ['R9C7']],
];

// Consecutive-ascending Sum chain for one drawn direction through a list of
// segments: sum(segments[i+1]) - sum(segments[i]) = 1 for every adjacent
// pair.
function ascendingChain(segments) {
  return segments.slice(1).map((seg, i) => {
    const prev = segments[i];
    return new Sum(
      1,
      ...seg.map(c => [c, 1]),
      ...prev.map(c => [c, -1]));
  });
}

const blueChain = ascendingChain(blueSegments);

// Either the drawn order is ascending, or the reverse of it is.
const otherLineChoices = otherLineSegments.map(segments => new Or([
  new And(ascendingChain(segments)),
  new And(ascendingChain([...segments].reverse())),
]));

return [
  new Shape('9x9'),
  given,
  ...blueChain,
  ...otherLineChoices,
];
