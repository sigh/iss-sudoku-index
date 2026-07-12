// Title: Circus Maximus
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=DVy_zGc9UQI
// Source: https://sudokupad.app/cg5wlayzuj

// Rules:
// Normal sudoku rules apply.
// Digits along a pink line must form a non-repeating group of consecutive
// digits, but they may appear in any order along the line.
// Using red, green, and blue, colour all circles such that:
//   Orthogonally adjacent circles are different colours;
//   and the digit inside a circle appears that many times in circles of that colour.

// Circle layout: G/R/B mark a circle given that starting colour, "?" marks
// an uncoloured circle, "." marks a cell with no circle at all.
const circles = `
G  ?  ?  ?  G  ?  ?  ?  G
?  ?  ?  ?  .  ?  ?  .  ?
?  ?  R  .  ?  ?  .  .  ?
?  .  ?  .  .  ?  ?  ?  ?
B  .  .  ?  ?  G  ?  .  G
?  ?  ?  .  .  ?  .  ?  ?
?  .  ?  ?  ?  .  .  ?  ?
?  ?  G  ?  .  .  ?  .  ?
G  ?  ?  ?  G  ?  ?  ?  G
`.replaceAll(/\s/g, ``);

const base = [
  `.Renban~R1C4~R1C3~R1C2~R1C1~R2C1~R3C1~R4C1`,
  `.Renban~R6C1~R7C1~R8C1~R9C1~R9C2~R9C3~R9C4`,
  `.Renban~R9C6~R9C7~R9C8~R9C9~R8C9~R7C9~R6C9`,
  `.Renban~R4C9~R3C9~R2C9~R1C9~R1C8~R1C7~R1C6`,
];

function* rangeI(from, to) {
  for (let i = from; i <= to; i++) {
    yield i;
  }
}

function colorCandidates(cell, i) {
  return new Given(color.at(cell), ...[
    ("RGB".indexOf(circles[circleIndices[i]]) + 1) || [1, 2, 3]
  ].flat());
}

// The 50 uncoloured ("?") circles all start with the same candidate set
// [1, 2, 3], so Replicate stamps that template instead of hand-rolling each
// identical Given.
function isUncoloredCircle(_cell, i) {
  return circles[circleIndices[i]] === '?';
}

const graph = cellGraph();
const allCells = graph.cells();

const circleIndices = circles.split('').flatMap((value, i) =>
  value == '.' ? [] : [i]);
const circleCells = circleIndices.map(i => allCells[i]);

// The Color Var cell paired with each circle (VC1.., in circle order).
const color = graph.makeOverlay('VC', circleCells);

// Each orthogonally-adjacent pair of circles, once: the horizontal and vertical
// dominoes starting at each circle whose other cell is also a circle.
const circleAdjacencies = () => circleCells
  .flatMap(cell => [graph.block(cell, 1, 2), graph.block(cell, 2, 1)])
  .filter(domino => domino?.every(c => color.at(c) !== null))
  .map(domino => domino.map(c => color.at(c)));

const allCircleEntries = circleCells.flatMap(cell => [cell, color.at(cell)]);

function colorDigitSpec(color, digit) {
  return NFA.encodeSpec({
    startState: { count: 0 },
    transition: ({ count, digitMatch }, value) =>
      (digitMatch === undefined) ? { count, digitMatch: value == digit }
        : (digitMatch && value == color) ? ((count == digit) ? [] : { count: count + 1 })
          : { count },
    accept: ({ count, digitMatch }) =>
      (digitMatch === undefined) && (count == 0 || count == digit),
  }, 9);
}

function colorDigitNFAs() {
  const colorNames = `RGB`;
  const constraints = [];
  for (const color of rangeI(1, 3)) {
    for (const digit of rangeI(1, 9)) {
      constraints.push(new NFA(
        colorDigitSpec(color, digit),
        `${colorNames[color - 1]}${digit}`,
        ...allCircleEntries,
      ));
    }
  }
  return constraints;
}

const coloredGivens = circleCells
  .flatMap((c, i) => isUncoloredCircle(c, i) ? [] : [colorCandidates(c, i)]);
const uncoloredTargets = circleCells
  .filter((c, i) => isUncoloredCircle(c, i))
  .map(c => color.at(c));
const uncoloredOrigin = uncoloredTargets[0];

return [
  ...base,
  color.toVar("Color"),
  ...coloredGivens,
  new Replicate(
    [new Given(uncoloredOrigin, 1, 2, 3)],
    Replicate.encodeTargetCells(uncoloredTargets, uncoloredOrigin, color),
    uncoloredOrigin,
  ),
  new And([
    ...circleAdjacencies().map(cells => new AllDifferent(...cells))
  ]),
  new And([...colorDigitNFAs()]),
];
