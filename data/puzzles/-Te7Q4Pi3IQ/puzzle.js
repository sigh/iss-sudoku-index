// Title: Renban Circus
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=-Te7Q4Pi3IQ
// Source: https://sudokupad.app/bwevls7kjx

// Normal Sudoku applies. Purple paths are Renbans. Each drawn circle has one
// red, green, or blue colour: orthogonally adjacent circles differ, circles on
// a purple path share a colour, and a digit occurs either zero or that digit's
// number of times among circles of each colour. The coloured circle map below
// is transcribed from the drawn circles; W marks an initially white circle.
const circles = `
. W W W . W W W .
W R . W . W . G W
W . W . G . W . W
R . . W W W . . G
W . . B . B . . W
. G . . . . . R .
W . W . W . W . W
. B W W W W W B .
. W R . W . G W .
`.replaceAll(/\s/g, '');

const renbans = [
  ['R5C2', 'R4C2', 'R4C3'],
  ['R4C7', 'R4C8', 'R3C8'],
  ['R2C3', 'R3C4'],
  ['R7C3', 'R8C4'],
  ['R7C7', 'R8C6'],
];

const graph = cellGraph();
const allCells = graph.cells();
const circleIndices = circles.split('').flatMap((value, i) => value === '.' ? [] : [i]);
const circleCells = circleIndices.map(i => allCells[i]);
const color = graph.makeOverlay('VC', circleCells);
const allCircleEntries = circleCells.flatMap(cell => [cell, color.at(cell)]);

function* rangeI(from, to) {
  for (let i = from; i <= to; i++) yield i;
}

function colorCandidates(cell, i) {
  const fixedColor = 'RGB'.indexOf(circles[circleIndices[i]]) + 1;
  return new Given(color.at(cell), ...[fixedColor || [1, 2, 3]].flat());
}

// The grid value is read before its paired colour variable. The state tracks
// whether this digit/colour pair has appeared, and caps its count at the digit.
function colorDigitSpec(colorValue, digit) {
  return NFA.encodeSpec({
    startState: { count: 0 },
    transition: ({ count, digitMatch }, value) =>
      digitMatch === undefined ? { count, digitMatch: value === digit }
        : digitMatch && value === colorValue
          ? (count === digit ? [] : { count: count + 1 })
          : { count },
    accept: ({ count, digitMatch }) =>
      digitMatch === undefined && (count === 0 || count === digit),
  }, 9);
}

function colorDigitNFAs() {
  const names = 'RGB';
  return [...rangeI(1, 3)].flatMap(colorValue =>
    [...rangeI(1, 9)].map(digit => new NFA(
      colorDigitSpec(colorValue, digit), `${names[colorValue - 1]}${digit}`,
      ...allCircleEntries,
    )));
}

const circleSet = new Set(circleCells);
const colorRenbans = renbans
  .map(cells => cells.filter(cell => circleSet.has(cell)))
  .filter(cells => cells.length > 1);
const adjacentCircleCells = circleCells
  .flatMap(cell => [graph.block(cell, 1, 2), graph.block(cell, 2, 1)])
  .filter(domino => domino?.every(cell => circleSet.has(cell)));

return [
  new Shape('9x9'),
  ...renbans.map(cells => new Renban(...cells)),
  color.toVar('Color'),
  ...circleCells.map(colorCandidates),
  ...adjacentCircleCells.map(cells => new AllDifferent(...color.at(cells))),
  ...colorRenbans.map(cells => new SameValues(cells.length, ...color.at(cells))),
  ...colorDigitNFAs(),
];
