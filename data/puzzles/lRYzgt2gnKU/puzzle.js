// Title: Earthquakes In Turkey
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=lRYzgt2gnKU
// Source: https://app.crackingthecryptic.com/sudoku/4dHgHjFHdT

// Normal sudoku rules apply (default 3x3 boxes match the puzzle's regions).
// 10 city names run along the 10 grey lines/arrows, one letter per cell. A
// plain grey line (no arrowhead) reads in either direction; a grey line drawn
// with an arrowhead must read in the arrow's direction (its waypoints run
// tail to tip). A cell's letter restricts its digit to the digits 1-9 whose
// English name contains that letter (eg the letter O appears in ONE, TWO and
// FOUR, so an O-cell must hold 1, 2 or 4); a letter absent from every digit's
// spelling leaves the cell unrestricted.
// Of the two red lines, one reads magnitude 7.7 and the other 7.6, decimal
// point dropped: the 7.7 line's two cells both hold 7, the 7.6 line's two
// cells hold 6 and 7 in some order. The rules do not say which red line is
// which, so both assignments are encoded.
// Each of the 10 lines/arrows carries one of the 10 distinct cities. Three
// lines share length 5, two share length 8, and one line plus one arrow
// share length 9; the source does not say which same-length city goes on
// which same-length line, so each such same-length group is encoded as the
// disjunction over every way to assign its cities to its lines (a matching),
// not left free line-by-line -- see the group constraints below.

// digit name -> letters it contains, per the rule's own worked examples.
const NUMBER_WORDS = {
  1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE',
  6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE',
};
// letter -> digits whose name contains that letter (derived from the table above).
const LETTER_DIGITS = {};
for (const [digit, word] of Object.entries(NUMBER_WORDS)) {
  for (const ch of new Set(word)) {
    (LETTER_DIGITS[ch] ??= []).push(Number(digit));
  }
}

// Named grey line/arrow cell paths, in drawn (waypoint) order.
const LINE_5A = { cells: ['R2C4', 'R2C5', 'R3C6', 'R3C5', 'R3C4'], directed: false };
const LINE_5B = { cells: ['R5C7', 'R6C7', 'R5C6', 'R4C5', 'R5C5'], directed: false };
const LINE_5C = { cells: ['R8C4', 'R9C5', 'R9C6', 'R8C6', 'R7C5'], directed: false };
const LINE_8A = { cells: ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R2C2', 'R3C2', 'R4C1', 'R3C1'], directed: false };
const LINE_8B = { cells: ['R9C9', 'R9C8', 'R8C8', 'R9C7', 'R8C7', 'R7C7', 'R7C6', 'R6C6'], directed: false };
const LINE_9 = { cells: ['R4C4', 'R4C3', 'R3C3', 'R2C3', 'R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C7'], directed: false };
const ARROW_9 = { cells: ['R9C1', 'R8C2', 'R9C2', 'R9C3', 'R8C3', 'R9C4', 'R8C5', 'R7C4', 'R7C3'], directed: true };
// Only DIYARBAKIR has 10 letters.
const LINE_10 = { cells: ['R2C9', 'R3C9', 'R4C9', 'R4C8', 'R5C8', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R7C8'], directed: false };
// Only KAHRAMANMARAS has 13 letters.
const LINE_13 = { cells: ['R5C1', 'R4C2', 'R5C2', 'R5C3', 'R5C4', 'R6C5', 'R6C4', 'R6C3', 'R6C2', 'R6C1', 'R7C1', 'R8C1', 'R7C2'], directed: false };
// Only MALATYA has 7 letters.
const ARROW_7 = { cells: ['R4C7', 'R3C8', 'R2C8', 'R1C7', 'R2C7', 'R1C8', 'R1C9'], directed: true };

const reversed = (s) => [...s].reverse().join('');

// One `Given` per cell for a concrete word placed along `cells`: the letter's
// digits when restricted, the full 1-9 range when it is not (an explicit,
// literal encoding of "any digit can be placed in that cell").
const ALL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const wordGivens = (cells, word) => cells.map(
  (cell, i) => new Given(cell, ...(LETTER_DIGITS[word[i]] || ALL_DIGITS))
);

// A line's Given-branches for one concrete word: one branch if the line is
// directed (the arrow fixes the direction), two (forward/reversed) if not.
const lineReadings = ({ cells, directed }, word) =>
  (directed ? [word] : [word, reversed(word)]).map((w) => wordGivens(cells, w));

// Constraint children for one line committed to one word: always wrapped in
// an Or of its direction reading(s) (even the single-reading, directed case)
// so every one of its cells is inside an Or/And branch, not a bare top-level
// Given -- see the group-constraint comment below for why that distinction
// matters here.
const lineConstraints = (line, word) => {
  const readings = lineReadings(line, word);
  return [new Or(readings.map((g) => new And(g)))];
};

// Small helper: every permutation of a short array (used for the <=3-city
// same-length groups below, so this never needs to scale further).
function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) result.push([arr[i], ...p]);
  }
  return result;
}

// Every combination of one item per input array.
function cartesianProduct(arrays) {
  return arrays.reduce(
    (acc, arr) => acc.flatMap((prefix) => arr.map((item) => [...prefix, item])),
    [[]]
  );
}

// A same-length group of lines and its candidate cities: the true assignment
// is some permutation of `cities` onto `lines`, so the group's rule is a
// disjunction over every permutation, crossed with every line's own
// direction choice. Each branch is a flat list of `Given`s (one word and
// direction fully committed per line) rather than a further-nested Or: a
// branch of Or containing its own nested Or (3 levels of Or/And) does not
// propagate correctly in ISS (confirmed with a minimal repro), so the
// permutation x direction choices are expanded into flat branches up front
// instead of nesting a per-line direction Or inside each permutation's And.
const groupConstraint = (lines, cities) => {
  const branches = [];
  for (const assignment of permutations(cities)) {
    const perLineReadings = lines.map((line, i) => lineReadings(line, assignment[i]));
    for (const combo of cartesianProduct(perLineReadings)) {
      branches.push(new And(combo.flat()));
    }
  }
  return new Or(branches);
};
const cityConstraints = [
  ...lineConstraints(LINE_10, 'DIYARBAKIR'),
  ...lineConstraints(LINE_13, 'KAHRAMANMARAS'),
  ...lineConstraints(ARROW_7, 'MALATYA'),
  groupConstraint([LINE_5A, LINE_5B, LINE_5C], ['ADANA', 'HATAY', 'KILIS']),
  groupConstraint([LINE_8A, LINE_8B], ['ADIYAMAN', 'OSMANIYE']),
  groupConstraint([LINE_9, ARROW_9], ['GAZIANTEP', 'SANLIURFA']),
];

// Earthquake lines: the two red lines, each drawn as a jagged 2-cell mark
// running R3C7-R4C6 and R7C7-R6C8. See the header comment for the 7.7/7.6
// reading.
const magnitude77 = (cells) => [new Given(cells[0], 7), new Given(cells[1], 7)];
const magnitude76 = (cells) => [
  new Given(cells[0], 6, 7), new Given(cells[1], 6, 7), new AllDifferent(...cells),
];
const EQ_A = ['R3C7', 'R4C6'];
const EQ_B = ['R7C7', 'R6C8'];
const earthquakeConstraint = new Or([
  new And([...magnitude77(EQ_A), ...magnitude76(EQ_B)]),
  new And([...magnitude77(EQ_B), ...magnitude76(EQ_A)]),
]);

return [
  new Shape('9x9'),
  // The two given digits.
  new Given('R5C3', 6),
  new Given('R5C7', 2),
  ...cityConstraints,
  earthquakeConstraint,
];
