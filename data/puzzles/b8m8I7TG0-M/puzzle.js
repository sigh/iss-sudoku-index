// Title: My Strange Zebra
// Author: Lake
// Video: https://www.youtube.com/watch?v=b8m8I7TG0-M
// Source: https://app.crackingthecryptic.com/sudoku/rPNr3q67Rj

// Normal sudoku rules apply. Shade cells so each shade is orthogonally
// connected and no 2x2 block is monochrome. On every grey path, each maximal
// shaded segment is a renban, each maximal unshaded segment is a German
// whisper, and every segment has at least two cells.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// Paths transcribed from the grey lines in the source artwork.
const paths = [
  ['R2C9','R1C9','R1C8','R1C7','R1C6','R1C5','R1C4','R1C3','R1C2','R1C1','R2C1','R3C1','R4C1','R5C1','R6C1','R7C1','R8C1','R9C1','R9C2'],
  ['R4C9','R5C9','R6C9'],
  ['R8C7','R8C8','R7C8','R7C7','R6C6'],
  ['R5C6','R5C5','R6C5'], ['R5C4','R6C4'], ['R4C3','R5C2','R6C3'],
  ['R6C2','R7C3'], ['R8C6','R9C7'], ['R4C7','R3C6','R3C5','R2C5','R2C4'],
  ['R2C3','R3C2'], ['R4C2','R3C3','R3C4'],
];

// A candidate segment is active only when it is a whole maximal run of its
// shade. The alternative literals make this an implication; when the run is
// active, its digit rule is required.
function segmentRule(cells, start, end, colour) {
  const run = cells.slice(start, end + 1);
  const opposite = colour === SHADED ? UNSHADED : SHADED;
  const expected = [
    ...shade.at(run).map(cell => [cell, colour]),
    ...(start > 0 ? [[shade.at(cells[start - 1]), opposite]] : []),
    ...(end + 1 < cells.length ? [[shade.at(cells[end + 1]), opposite]] : []),
  ];
  const digitRule = colour === SHADED
    ? new Renban(...run)
    : new Whisper(5, ...run);
  return new Or([digitRule, ...expected.map(([cell, value]) =>
    new Given(cell, value === SHADED ? UNSHADED : SHADED))]);
}

function pathRules(cells) {
  const rules = [];
  // A colour run cannot have length one, including at an endpoint.
  rules.push(new SameValues(2, shade.at(cells[0]), shade.at(cells[1])));
  rules.push(new SameValues(2, shade.at(cells.at(-2)), shade.at(cells.at(-1))));
  for (let i = 1; i < cells.length - 1; i++) {
    rules.push(new Or([
      new SameValues(2, shade.at(cells[i - 1]), shade.at(cells[i])),
      new SameValues(2, shade.at(cells[i]), shade.at(cells[i + 1])),
    ]));
  }
  for (const colour of [SHADED, UNSHADED]) {
    for (let start = 0; start < cells.length; start++) {
      for (let end = start + 1; end < cells.length; end++) {
        rules.push(segmentRule(cells, start, end, colour));
      }
    }
  }
  return rules;
}

return [
  new Shape('9x9'),
  new YinYang(),
  new Given('R1C1', 4), new Given('R4C4', 4),
  new Given('R5C3', 3), new Given('R9C5', 3),
  ...paths.flatMap(pathRules),
];
