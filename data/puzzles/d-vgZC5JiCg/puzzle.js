// Title: Roman Circus
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=d-vgZC5JiCg
// Source: https://sudokupad.app/cd0mh5vccv

// Normal Sudoku applies. Circles are coloured red, green, or blue: orthogonally
// adjacent circles differ, and a digit D occurs either zero or D times per colour.
// The `circles` diagram transcribes the drawn circle positions and fixed colours.
const circles = `
o  o  o  .  o  .  .  o  o
o  .  .  o  o  o  .  .  .
.  .  o  R  o  .  o  .  o
.  o  .  o  .  o  B  o  .
o  .  o  .  .  .  o  o  o
.  o  G  o  .  o  .  o  .
.  o  o  .  o  G  o  .  o
o  .  o  .  .  o  .  o  o
.  o  .  o  o  .  o  .  .
`.replaceAll(/\s/g, '');

const graph = cellGraph('9x9');
const allCells = graph.cells();
const circleIndices = circles.split('').flatMap((value, i) => value === '.' ? [] : [i]);
const circleCells = circleIndices.map(i => allCells[i]);

// Colour Vars are paired with circles in the diagram's row-major order:
// 1=red, 2=blue, 3=green. The fixed letters are the drawn coloured circles.
const colour = graph.makeOverlay('VC', circleCells);
const colourCandidates = circleCells.map((cell, i) => {
  const fixed = 'RGB'.indexOf(circles[circleIndices[i]]);
  return new Given(colour.at(cell), ...(fixed < 0 ? [1, 2, 3] : [fixed + 1]));
});

// Every drawn pair of orthogonally adjacent circles, derived from the diagram.
const adjacentCirclePairs = circleCells
  .flatMap(cell => [graph.block(cell, 1, 2), graph.block(cell, 2, 1)])
  .filter(pair => pair?.every(cell => circleCells.includes(cell)))
  .map(pair => new AllDifferent(...colour.at(pair)));

const circleEntries = circleCells.flatMap(cell => [cell, colour.at(cell)]);

// The NFA reads each digit then its paired colour. It counts occurrences of one
// digit in one colour, rejecting a count above that digit; its two phases are
// `digitMatch` unset (read a grid digit) and set (read the paired colour Var).
function colourDigitSpec(colourValue, digit) {
  return NFA.encodeSpec({
    startState: { count: 0 },
    transition: ({ count, digitMatch }, value) =>
      digitMatch === undefined ? { count, digitMatch: value === digit }
        : digitMatch && value === colourValue
          ? (count === digit ? [] : { count: count + 1 })
          : { count },
    accept: ({ count, digitMatch }) =>
      digitMatch === undefined && (count === 0 || count === digit),
  }, 9);
}

const colourNames = ['R', 'G', 'B'];
const colourCounts = [1, 2, 3].flatMap(colourValue =>
  [1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => new NFA(
    colourDigitSpec(colourValue, digit), `${colourNames[colourValue - 1]}${digit}`,
    ...circleEntries,
  )));

// The X and V glyphs are the drawn adjacent-cell dominoes; absent glyphs carry
// no negative constraint because the rules explicitly say not every one is given.
const xClues = [
  ['R3C4', 'R4C4'], ['R3C4', 'R3C5'], ['R3C7', 'R4C7'], ['R4C7', 'R4C8'],
  ['R5C3', 'R6C3'], ['R6C3', 'R6C4'], ['R6C6', 'R7C6'], ['R7C5', 'R7C6'],
].map(pair => new X(...pair));
const vClues = [
  ['R2C4', 'R3C4'], ['R3C3', 'R3C4'], ['R4C6', 'R4C7'], ['R4C7', 'R5C7'],
  ['R6C2', 'R6C3'], ['R6C3', 'R7C3'], ['R7C6', 'R8C6'], ['R7C6', 'R7C7'],
].map(pair => new V(...pair));

return [
  new Shape('9x9'),
  new Given('R9C9', 5),
  colour.toVar('Circle colours'),
  ...colourCandidates,
  new And(adjacentCirclePairs),
  new And(colourCounts),
  ...xClues,
  ...vClues,
];
