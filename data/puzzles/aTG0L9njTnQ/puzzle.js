// Title: Ten Ring Circus
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=aTG0L9njTnQ
// Source: https://sudokupad.app/ah1c5p6zcr

// Rules:
// Normal sudoku rules apply.
// Each gray line can be divided into segments of contiguous cells, where the
// digits in each segments sum to 10. These segments cannot overlap and every
// cell is part of exactly one segment.
// Using red, green, and blue, color in all circles such that:
//   Orthogonally adjacent circles are different colors;
//   and the digit inside a circle appears that many times in circles of that
//   colour.

// -- Gray sum-10 loops --
//
// Each gray line is drawn as a closed loop through a small cluster of cells
// (the traced order below). The loop must be partitioned into contiguous
// arcs that each sum to 10, covering every cell exactly once, with no
// overlaps. Because a partial-segment sum can only ever be extended or
// close exactly at 10 (adding any digit 1-9 to a sum already at 10 would
// overshoot), the whole partition is forced once a single segment boundary
// (a "start of segment" position) is fixed: greedily accumulate digits,
// resetting to 0 whenever the running sum hits exactly 10, and reject if it
// ever exceeds 10. A partition exists iff this deterministic walk closes
// cleanly (ends back at sum 0) starting from at least one of the loop's own
// cells -- so try every rotation of the loop as the assumed starting point.
function sum10LoopSpec() {
  return NFA.encodeSpec({
    startState: 0,
    transition: (sum, value) => {
      const newSum = sum + value;
      if (newSum > 10) return [];   // overshoot: this rotation is dead.
      if (newSum === 10) return 0;  // segment closes; next cell starts fresh.
      return newSum;                // segment continues.
    },
    accept: (sum) => sum === 0,     // must end exactly on a closed segment.
  }, 9);
}
const sum10Spec = sum10LoopSpec();

function rotations(cells) {
  return cells.map((_, i) => [...cells.slice(i), ...cells.slice(0, i)]);
}

function sum10Loop(cells) {
  return new Or(rotations(cells).map(rot => new NFA(sum10Spec, '', ...rot)));
}

const loops = [
  ['R1C1', 'R1C2', 'R2C2', 'R2C1'],
  ['R8C8', 'R9C8', 'R9C9', 'R8C9'],
  ['R9C4', 'R9C5', 'R8C5', 'R7C5', 'R7C4', 'R8C4'],
  ['R1C6', 'R2C6', 'R3C6', 'R3C5', 'R2C5', 'R1C5'],
  ['R4C8', 'R5C8', 'R5C7', 'R6C7', 'R6C8', 'R6C9', 'R5C9', 'R4C9'],
  ['R4C2', 'R4C3', 'R5C3', 'R5C2', 'R6C2', 'R6C1', 'R5C1', 'R4C1'],
];

// -- Circle colouring --
//
// Same colouring rule (verbatim) and encoding pattern as Jeff Wajes' "Circus
// Maximus" (data/scripts/circus_maximum.js in the ISS repo): a `Var` overlay
// gives each circle a colour in {1,2,3} = {R,G,B}; the three pre-coloured
// circles pin their own overlay cell via `Given`; adjacency is a `!=` `Pair`
// over every orthogonal domino whose both cells are circles; and, for every
// (colour, digit) pair, one NFA over all (digit-cell, colour-cell) pairs
// checks that the count of circles holding that digit in that colour is
// either 0 or exactly that digit -- which is exactly "the digit inside a
// circle appears that many times in circles of that colour" applied to every
// circle of that colour and digit.
const circles = `
?  ?  .  .  ?  ?  ?  ?  .
?  ?  G  ?  ?  ?  ?  .  .
.  .  ?  .  ?  ?  .  .  B
?  ?  ?  .  ?  .  .  ?  ?
?  ?  ?  ?  .  ?  ?  ?  ?
?  ?  .  .  ?  .  ?  ?  ?
.  ?  .  ?  ?  ?  .  .  .
.  ?  .  ?  ?  .  ?  ?  ?
.  .  R  ?  ?  .  ?  ?  ?
`.replaceAll(/\s/g, ``);

function* rangeI(from, to) {
  for (let i = from; i <= to; i++) {
    yield i;
  }
}

const graph = cellGraph();
const allCells = graph.cells();

const circleIndices = circles.split('').flatMap((value, i) =>
  value == '.' ? [] : [i]);
const circleCells = circleIndices.map(i => allCells[i]);

// The Color Var cell paired with each circle (VC1.., in circle order).
const color = graph.makeOverlay('VC', circleCells);
const fixedColourConstraints = circleCells.flatMap((cell, i) => {
  const value = 'RGB'.indexOf(circles[circleIndices[i]]) + 1;
  return value ? [new Given(color.at(cell), value)] : [];
});
const colourDomain = color.makeReplicate(
  [new Given(color.at(circleCells[0]), 1, 2, 3)],
  color.at(circleCells));

// Each orthogonally-adjacent pair of circles, once: the horizontal and
// vertical dominoes starting at each circle whose other cell is also a
// circle.
const circleAdjacencies = () => circleCells
  .flatMap(cell => [graph.block(cell, 1, 2), graph.block(cell, 2, 1)])
  .filter(domino => domino?.every(c => color.at(c) !== null));

const allCircleEntries = circleCells.flatMap(cell => [cell, color.at(cell)]);

// `colorValue`, not `color`: `color` is the overlay above, and shadowing it
// here would hide the thing these NFAs are written against.
function colorDigitSpec(colorValue, digit) {
  return NFA.encodeSpec({
    startState: { count: 0 },
    transition: ({ count, digitMatch }, value) =>
      (digitMatch === undefined) ? { count, digitMatch: value == digit }
        : (digitMatch && value == colorValue) ? ((count == digit) ? [] : { count: count + 1 })
          : { count },
    accept: ({ count, digitMatch }) =>
      (digitMatch === undefined) && (count == 0 || count == digit),
  }, 9);
}

// One NFA per (colour, digit): of the circles of that colour, either none or
// exactly `digit` of them hold `digit`.
function colorDigitNFAs() {
  const colorNames = `RGB`;
  return [...rangeI(1, 3)].flatMap(colorValue =>
    [...rangeI(1, 9)].map(digit => new NFA(
      colorDigitSpec(colorValue, digit),
      `${colorNames[colorValue - 1]}${digit}`,
      ...allCircleEntries,
    )));
}

return [
  new Shape('9x9'),
  ...loops.map(sum10Loop),
  color.toVar("Color"),
  colourDomain,
  ...fixedColourConstraints,
  new And([
    ...circleAdjacencies().map(domino => new AllDifferent(...color.at(domino)))
  ]),
  new And([...colorDigitNFAs()]),
];
