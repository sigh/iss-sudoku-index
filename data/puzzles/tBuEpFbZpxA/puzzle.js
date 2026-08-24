// Title: The Tree
// Author: Garford
// Video: https://www.youtube.com/watch?v=tBuEpFbZpxA
// Source: https://app.crackingthecryptic.com/sudoku/6tnBLrmPgh

// Normal sudoku rules (default Shape('9x9') row/column/box all-different).
// No given digits.
//
// A tree of 32 two-digit numbers is drawn through 64 of the 81 cells,
// rooted at a bulb (R9C4 tens, R9C5 units, read left to right) in box 8.
// Away from the bulb, cells alternate tens/units by their distance from the
// bulb; at every branch point the shared cell keeps the role/number it
// already had, and each child branch starts a fresh number (tens first) at
// the next cell. That partitions the 64 tree cells into the 32 numbers
// below, each with an immediate parent number except the root (N1). Each
// number's originating drawn line (per the source payload's line list) is
// noted next to it.
//
// "The numbers must increase along the branches" and "numbers on all new
// branches must be greater than ... the parent branch" are the same
// relationship in this parent/child structure: every non-root number must
// be strictly greater than its immediate parent. "Must not repeat across
// the whole tree" is a single all-different over all 32 numbers.
const NUMBERS = [
  { name: 'N1', tens: 'R9C4', units: 'R9C5', parent: null }, // bulb
  { name: 'N2', tens: 'R8C4', units: 'R9C3', parent: 'N1' }, // line #0
  { name: 'N3', tens: 'R9C2', units: 'R9C1', parent: 'N2' }, // line #0
  { name: 'N4', tens: 'R8C5', units: 'R7C5', parent: 'N1' }, // line #1
  { name: 'N5', tens: 'R7C6', units: 'R8C7', parent: 'N4' }, // line #1
  { name: 'N6', tens: 'R9C7', units: 'R9C6', parent: 'N5' }, // line #1
  { name: 'N7', tens: 'R6C6', units: 'R5C6', parent: 'N4' }, // line #2
  { name: 'N8', tens: 'R4C6', units: 'R3C7', parent: 'N7' }, // line #2
  { name: 'N9', tens: 'R2C7', units: 'R2C8', parent: 'N8' }, // line #2
  { name: 'N10', tens: 'R2C9', units: 'R3C9', parent: 'N9' }, // line #2
  { name: 'N11', tens: 'R2C6', units: 'R1C7', parent: 'N8' }, // line #3
  { name: 'N12', tens: 'R4C7', units: 'R4C8', parent: 'N7' }, // line #4
  { name: 'N13', tens: 'R5C9', units: 'R5C8', parent: 'N12' }, // line #4
  { name: 'N14', tens: 'R6C9', units: 'R7C9', parent: 'N13' }, // line #4
  { name: 'N15', tens: 'R5C7', units: 'R6C8', parent: 'N7' }, // line #5
  { name: 'N16', tens: 'R7C7', units: 'R8C8', parent: 'N15' }, // line #5
  { name: 'N17', tens: 'R6C5', units: 'R5C4', parent: 'N4' }, // line #6
  { name: 'N18', tens: 'R4C5', units: 'R3C6', parent: 'N17' }, // line #6
  { name: 'N19', tens: 'R2C5', units: 'R1C5', parent: 'N18' }, // line #6
  { name: 'N20', tens: 'R1C4', units: 'R1C3', parent: 'N19' }, // line #6
  { name: 'N21', tens: 'R6C3', units: 'R7C3', parent: 'N17' }, // line #7
  { name: 'N22', tens: 'R8C2', units: 'R8C3', parent: 'N21' }, // line #7
  { name: 'N23', tens: 'R5C3', units: 'R5C2', parent: 'N17' }, // line #8
  { name: 'N24', tens: 'R6C1', units: 'R6C2', parent: 'N23' }, // line #8
  { name: 'N25', tens: 'R7C2', units: 'R8C1', parent: 'N24' }, // line #8
  { name: 'N26', tens: 'R5C1', units: 'R4C1', parent: 'N23' }, // line #9
  { name: 'N27', tens: 'R3C1', units: 'R3C2', parent: 'N26' }, // line #9
  { name: 'N28', tens: 'R4C3', units: 'R4C2', parent: 'N17' }, // line #10
  { name: 'N29', tens: 'R4C4', units: 'R3C3', parent: 'N17' }, // line #11
  { name: 'N30', tens: 'R2C4', units: 'R3C5', parent: 'N29' }, // line #11
  { name: 'N31', tens: 'R2C3', units: 'R2C2', parent: 'N29' }, // line #12
  { name: 'N32', tens: 'R2C1', units: 'R1C1', parent: 'N31' }, // line #12
];

const byName = Object.fromEntries(NUMBERS.map(n => [n.name, n]));

// Binary relation keys over plain grid digits (1-9, the default range for a
// bare numeric arg to Pair.fnToKey).
const GT = Pair.fnToKey((a, b) => a > b, 9);
const EQ = Pair.fnToKey((a, b) => a === b, 9);
const NEQ = Pair.fnToKey((a, b) => a !== b, 9);

// value(child) > value(parent) as a lexicographic (tens, units) comparison:
// tens strictly greater, or tens equal and units strictly greater. This
// avoids materializing the 2-digit value itself (11-99 exceeds ISS's
// 16-value Var/cell domain cap).
function greaterThanParent(child, parent) {
  return new Or([
    new Pair(GT, `${child.name}>${parent.name} tens`, child.tens, parent.tens),
    new And([
      new Pair(EQ, `${child.name}=${parent.name} tens`, child.tens, parent.tens),
      new Pair(GT, `${child.name}>${parent.name} units`, child.units, parent.units),
    ]),
  ]);
}

// value(a) != value(b): the tens or the units digit differs.
function distinctNumbers(a, b) {
  return new Or([
    new Pair(NEQ, `${a.name}!=${b.name} tens`, a.tens, b.tens),
    new Pair(NEQ, `${a.name}!=${b.name} units`, a.units, b.units),
  ]);
}

const orderConstraints = NUMBERS
  .filter(n => n.parent)
  .map(n => greaterThanParent(n, byName[n.parent]));

const distinctConstraints = [];
for (let i = 0; i < NUMBERS.length; i++) {
  for (let j = i + 1; j < NUMBERS.length; j++) {
    distinctConstraints.push(distinctNumbers(NUMBERS[i], NUMBERS[j]));
  }
}

return [
  new Shape('9x9'),
  ...orderConstraints,
  ...distinctConstraints,
];
