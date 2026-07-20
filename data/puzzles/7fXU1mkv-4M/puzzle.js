// Title: Think inside the...
// Author: Kennet's Dad
// Video: https://www.youtube.com/watch?v=7fXU1mkv-4M
// Source: https://sudokupad.app/cki7pvc7ts

// Box values can exceed ISS's maximum single-cell alphabet. Each value is
// represented canonically by a tens Var (0-3) and a ones Var (0-9).
const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const digitDomain = graph.makeReplicate(
  new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Each array is one drawn box. Array indexes are used by the colored rule
// declarations below; only the drawn geometry is listed as cell literals.
const pinkBoxes = [
  ['R5C1', 'R6C1', 'R6C2', 'R6C3'],
  ['R5C2'],
  ['R5C3'],
  ['R5C4', 'R6C4'],
  ['R7C4'],
  ['R8C4'],
  ['R9C4'],
];
const tealBoxes = [
  ['R1C5', 'R1C6', 'R2C5', 'R2C6'],
  ['R3C6'],
  ['R4C6'],
  ['R4C7', 'R4C8', 'R4C9'],
  ['R3C5'],
  ['R4C5'],
];
const purpleBoxes = [
  ['R5C5', 'R6C5'],
  ['R7C5', 'R7C6', 'R8C5'],
  ['R8C6', 'R9C5', 'R9C6'],
  ['R5C6', 'R6C6'],
  ['R5C7', 'R5C8', 'R5C9', 'R6C7'],
  ['R6C8', 'R6C9'],
];
const blueBoxes = [
  ['R8C2', 'R9C1', 'R9C2'],
  ['R9C3'],
  ['R7C2', 'R7C3'],
  ['R7C7', 'R7C8'],
  ['R8C8', 'R8C9', 'R9C8'],
  ['R9C7'],
];
const greyBoxes = [
  ['R1C7', 'R1C8', 'R2C7', 'R2C8'],
  ['R1C4', 'R2C4', 'R3C4', 'R4C1', 'R4C2', 'R4C3', 'R4C4'],
];

const pinkTens = new Var('PT', 'pink box tens digits', pinkBoxes.length);
const pinkOnes = new Var('PO', 'pink box ones digits', pinkBoxes.length);
const tealTens = new Var('TT', 'teal box tens digits', tealBoxes.length);
const tealOnes = new Var('TO', 'teal box ones digits', tealBoxes.length);
const purpleTens = new Var('UT', 'purple box tens digits', purpleBoxes.length);
const purpleOnes = new Var('UO', 'purple box ones digits', purpleBoxes.length);
const blueTens = new Var('BT', 'blue box tens digits', blueBoxes.length);
const blueOnes = new Var('BO', 'blue box ones digits', blueBoxes.length);
// Only the first grey box needs a value: it participates in a white-dot rule.
const greyTens = new Var('GT', 'grey box tens digit', 1);
const greyOnes = new Var('GO', 'grey box ones digit', 1);

const valueGroups = [
  [pinkBoxes, pinkTens, pinkOnes],
  [tealBoxes, tealTens, tealOnes],
  [purpleBoxes, purpleTens, purpleOnes],
  [blueBoxes, blueTens, blueOnes],
  [greyBoxes.slice(0, 1), greyTens, greyOnes],
];
const boxVars = valueGroups.flatMap(([, tens, ones]) => [tens, ones]);
const boxDigitDomains = valueGroups.flatMap(([, tens, ones]) => [
  ...tens.cells().map(cell => new Given(cell, 0, 1, 2, 3)),
  ...ones.cells().map(cell => new Given(cell, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9)),
]);
const boxSums = valueGroups.flatMap(([boxes, tens, ones]) => boxes.map((cells, i) =>
  new Sum(0, ...cells, [tens.cell(i + 1), -10], [ones.cell(i + 1), -1])));

// No orthogonal domino may sum to 10. The key uses the widened 16-value
// alphabet, while digitDomain restricts both grid endpoints to 1-9.
const noTenKey = Pair.fnToKey((a, b) => a + b !== 10, shape);
const horizontalStarts = graph.cells().filter(cell => graph.step(cell, 0, 1));
const verticalStarts = graph.cells().filter(cell => graph.step(cell, 1, 0));
const noTenDominoes = [
  graph.makeReplicate(
    new Pair(noTenKey, 'no sum 10', 'R1C1', 'R1C2'), horizontalStarts),
  graph.makeReplicate(
    new Pair(noTenKey, 'no sum 10', 'R1C1', 'R2C1'), verticalStarts),
];

const greyAllDifferent = greyBoxes.map(cells => new AllDifferent(...cells));

const valueTerms = (tens, ones, index, sign = 1) => [
  [tens.cell(index + 1), 10 * sign],
  [ones.cell(index + 1), sign],
];

// Pink order is P3-P2-P1-P4-P5-P6-P7; P4 is the marked center.
const pinkOrder = [2, 1, 0, 3, 4, 5, 6];
const pinkZipper = [0, 1, 2].map(i => new Sum(0,
  ...valueTerms(pinkTens, pinkOnes, pinkOrder[i]),
  ...valueTerms(pinkTens, pinkOnes, pinkOrder[6 - i]),
  ...valueTerms(pinkTens, pinkOnes, pinkOrder[3], -1)));

// Teal box values are reduced modulo 3 from their decimal digits. Since
// 10 = 1 (mod 3), a box value has remainder (tens + ones) mod 3.
const tealRemainders = new Var('TR', 'teal box modulo remainders', tealBoxes.length);
const tealModuloDomains = tealRemainders.cells().map(cell =>
  new Given(cell, 0, 1, 2));
const tealRemainderMachine = NFA.encodeSpec({
  startState: { phase: 0, remainder: 0 },
  transition: ({ phase, remainder }, value) => {
    if (phase === 0) return { phase: 1, remainder: value % 3 };
    if (phase === 1) return { phase: 2, remainder: (remainder + value) % 3 };
    if (phase === 2 && value === remainder) return { phase: 3, remainder };
    return undefined;
  },
  accept: ({ phase }) => phase === 3,
}, shape);
const tealModuloValues = tealBoxes.map((_, i) => new NFA(
  tealRemainderMachine, 'teal box remainder',
  tealTens.cell(i + 1), tealOnes.cell(i + 1), tealRemainders.cell(i + 1)));
// Teal order is T4-T3-T2-T1-T5-T6.
const tealOrder = [3, 2, 1, 0, 4, 5];
const tealModular = tealOrder.slice(0, 4).map((_, start) =>
  new AllDifferent(...tealOrder.slice(start, start + 3).map(i =>
    tealRemainders.cell(i + 1))));

// Six values are consecutive iff they are base+0 through base+5 once each.
const purpleBaseTens = new Var('UBT', 'purple renban base tens digit', 1);
const purpleBaseOnes = new Var('UBO', 'purple renban base ones digit', 1);
const purpleOffsets = new Var('UD', 'purple renban offsets', purpleBoxes.length);
const purpleRenbanDomains = [
  new Given(purpleBaseTens.cell(1), 0, 1, 2, 3),
  new Given(purpleBaseOnes.cell(1), 0, 1, 2, 3, 4, 5, 6, 7, 8, 9),
  ...purpleOffsets.cells().map(cell => new Given(cell, 0, 1, 2, 3, 4, 5)),
];
const purpleConsecutive = purpleBoxes.map((_, i) => new Sum(0,
  ...valueTerms(purpleTens, purpleOnes, i),
  [purpleBaseTens.cell(1), -10], [purpleBaseOnes.cell(1), -1],
  [purpleOffsets.cell(i + 1), -1]));
const purpleRenban = new AllDifferent(...purpleOffsets.cells());

// The two blue components each contain three equal-valued boxes.
const blueEquality = [
  new SameValues(3, ...[2, 0, 1].map(i => blueTens.cell(i + 1))),
  new SameValues(3, ...[2, 0, 1].map(i => blueOnes.cell(i + 1))),
  new SameValues(3, ...[3, 4, 5].map(i => blueTens.cell(i + 1))),
  new SameValues(3, ...[3, 4, 5].map(i => blueOnes.cell(i + 1))),
];

const consecutiveValues = (aTens, aOnes, aIndex, bTens, bOnes, bIndex) => new Or([
  new Sum(1,
    ...valueTerms(aTens, aOnes, aIndex),
    ...valueTerms(bTens, bOnes, bIndex, -1)),
  new Sum(-1,
    ...valueTerms(aTens, aOnes, aIndex),
    ...valueTerms(bTens, bOnes, bIndex, -1)),
]);
const whiteDots = [
  consecutiveValues(tealTens, tealOnes, 0, greyTens, greyOnes, 0),
  consecutiveValues(purpleTens, purpleOnes, 0, purpleTens, purpleOnes, 3),
];

return [
  shape,
  digitDomain,
  ...boxVars,
  ...boxDigitDomains,
  ...boxSums,
  ...noTenDominoes,
  ...greyAllDifferent,
  ...pinkZipper,
  tealRemainders,
  ...tealModuloDomains,
  ...tealModuloValues,
  ...tealModular,
  purpleBaseTens,
  purpleBaseOnes,
  purpleOffsets,
  ...purpleRenbanDomains,
  ...purpleConsecutive,
  purpleRenban,
  ...blueEquality,
  ...whiteDots,
];
