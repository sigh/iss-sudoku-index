// Title: Bomb Defusal
// Author: Deckatron
// Video: https://www.youtube.com/watch?v=5_ADzH2E06Y
// Source: https://sudokupad.app/0pzyej3gwf

// A cut removes one connection from a coloured wire. Since each drawn wire is
// a tree, enumerating cut-edge sets also enumerates its resulting wires. Layouts
// leaving a component shorter than four cells are discarded.

const greenEdges = [
  ['R5C8', 'R5C7'], ['R5C7', 'R6C7'], ['R6C7', 'R7C6'],
  ['R7C6', 'R7C5'], ['R7C5', 'R8C5'], ['R5C7', 'R4C7'],
  ['R4C7', 'R3C6'], ['R3C6', 'R3C5'], ['R3C5', 'R3C4'],
  ['R3C4', 'R4C3'], ['R3C5', 'R2C5'], ['R7C4', 'R6C3'],
  ['R6C3', 'R5C3'], ['R5C3', 'R5C2'], ['R4C3', 'R5C3'],
  ['R7C4', 'R7C5'],
];

const blueEdges = [
  ['R8C8', 'R7C8'], ['R7C8', 'R7C7'], ['R7C7', 'R6C6'],
  ['R6C6', 'R5C5'], ['R5C5', 'R6C4'], ['R6C4', 'R7C3'],
  ['R7C3', 'R7C2'], ['R7C2', 'R8C2'], ['R5C5', 'R4C4'],
  ['R4C4', 'R3C3'], ['R3C3', 'R3C2'], ['R3C2', 'R2C2'],
  ['R4C6', 'R3C7'], ['R3C7', 'R3C8'], ['R3C8', 'R2C8'],
  ['R4C6', 'R5C5'],
];

function components(edges, cutMask, sameBoxOnly = false) {
  const cells = [...new Set(edges.flat())];
  const links = new Map(cells.map(cell => [cell, []]));
  edges.forEach(([a, b], index) => {
    if (cutMask & (1 << index)) return;
    if (sameBoxOnly) {
      const pa = parseCellId(a);
      const pb = parseCellId(b);
      if (Math.floor((pa.row - 1) / 3) !== Math.floor((pb.row - 1) / 3)
          || Math.floor((pa.col - 1) / 3) !== Math.floor((pb.col - 1) / 3)) {
        return;
      }
    }
    links.get(a).push(b);
    links.get(b).push(a);
  });

  const unseen = new Set(cells);
  const result = [];
  while (unseen.size) {
    const todo = [unseen.values().next().value];
    const component = [];
    unseen.delete(todo[0]);
    while (todo.length) {
      const cell = todo.pop();
      component.push(cell);
      for (const next of links.get(cell)) {
        if (unseen.delete(next)) todo.push(next);
      }
    }
    result.push(component);
  }
  return result;
}

function validCutMasks(edges) {
  const masks = [];
  for (let mask = 1; mask < (1 << edges.length); ++mask) {
    const pieces = components(edges, mask);
    if (pieces.every(piece => piece.length >= 4)) masks.push(mask);
  }
  return masks;
}

function cutCount(mask) {
  let count = 0;
  for (; mask; mask &= mask - 1) ++count;
  return count;
}

const greenLayouts = validCutMasks(greenEdges).map(mask => new And([
  new Given('R8C5', cutCount(mask)),
  ...greenEdges.flatMap(([a, b], index) =>
    mask & (1 << index) ? [] : [new Whisper(5, a, b)]),
]));

const blueLayouts = validCutMasks(blueEdges).map(mask => {
  const wireByCell = new Map();
  components(blueEdges, mask).forEach((wire, index) =>
    wire.forEach(cell => wireByCell.set(cell, index)));
  const boxSegments = components(blueEdges, mask, true);
  const segmentsByWire = new Map();
  for (const segment of boxSegments) {
    const wire = wireByCell.get(segment[0]);
    if (!segmentsByWire.has(wire)) segmentsByWire.set(wire, []);
    segmentsByWire.get(wire).push(segment);
  }
  return new And([
    new Given('R2C8', cutCount(mask)),
    ...[...segmentsByWire.values()].map(segments => new EqualSum(...segments)),
  ]);
});

const blackDots = [
  ['R8C5', 'R9C5'], ['R1C5', 'R2C5'], ['R5C8', 'R5C9'],
  ['R5C1', 'R5C2'], ['R4C4', 'R5C4'], ['R7C3', 'R7C4'],
  ['R6C7', 'R6C8'],
];

const whiteDots = [
  ['R8C2', 'R9C2'], ['R9C4', 'R9C5'], ['R8C8', 'R9C8'],
  ['R9C5', 'R9C6'], ['R1C5', 'R1C6'], ['R1C4', 'R1C5'],
  ['R5C4', 'R6C4'], ['R4C6', 'R5C6'], ['R1C2', 'R2C2'],
  ['R1C8', 'R2C8'], ['R5C6', 'R6C6'],
];

return [
  new Shape('9x9'),
  new Or(greenLayouts),
  new Or(blueLayouts),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
