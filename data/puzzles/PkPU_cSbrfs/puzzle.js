// Title: Fibreglass Acoustic Diffusers
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=PkPU_cSbrfs
// Source: https://sudokupad.app/x0xwsud0hq

// Normal sudoku rules apply.
//
// REGION SUM LINE (blue "R"): the line is split by a box border into two
// segments whose digits have the same sum. The letter shape only touches
// two boxes, so it is encoded directly as: sum(cells in the upper box) ==
// sum(cells in the lower box).
const regionSumUpper = ['R5C1', 'R5C2', 'R6C1', 'R6C3'];
const regionSumLower = ['R7C1', 'R7C2', 'R8C1', 'R8C2', 'R9C1', 'R9C3'];

// PARITY LINE (red "A"): each pair of adjacent digits contains one odd and
// one even digit. Drawn as two strokes: the two diagonal legs (meeting at
// the apex) and the crossbar.
const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const parityLegs = [
  'R9C4', 'R8C4', 'R7C4', 'R6C4', 'R5C5', 'R6C6', 'R7C6', 'R8C6', 'R9C6',
];
const parityCrossbar = ['R7C6', 'R7C5', 'R7C4'];

// GERMAN WHISPER LINE (green "H"): each pair of adjacent digits differs by
// at least 5. Drawn as two verticals joined by a crossbar.
const whisperLeft = ['R5C7', 'R6C7', 'R7C7', 'R8C7', 'R9C7'];
const whisperRight = ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'];
const whisperBar = ['R7C7', 'R7C8', 'R7C9'];

// FIBREGLASS ACOUSTIC DIFFUSERS (mushrooms): a digit on a mushroom shows how
// many times that digit appears among mushroom cells; and a mushroom and its
// up to four orthogonal neighbours contain different digits.
const mushrooms = [
  'R5C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C9', 'R5C4',
  'R1C1', 'R3C1', 'R3C3', 'R2C5', 'R1C5', 'R1C6', 'R2C7', 'R2C9',
];

function digitCountSpec(digit) {
  return NFA.encodeSpec({
    startState: { count: 0 },
    transition: ({ count }, value) =>
      (value === digit)
        ? (count === digit ? [] : { count: count + 1 })
        : { count },
    accept: ({ count }) => (count === 0 || count === digit),
  }, 9);
}

function mushroomSelfCountNFAs() {
  return Array.from({length: 9}, (_, i) =>
    new NFA(digitCountSpec(i + 1), `mushroom count ${i + 1}`, ...mushrooms)
  );
}

function mushroomNoEchoPairs() {
  const graph = cellGraph('9x9');
  return mushrooms.map(cell => {
    const cluster = [cell, ...graph.neighbours(cell)];
    return new AllDifferent(...cluster);
  });
}

return [
  new Shape('9x9'),

  new EqualSum(regionSumUpper, regionSumLower),

  new Pair(parityKey, 'parity A', ...parityLegs),
  new Pair(parityKey, 'parity A crossbar', ...parityCrossbar),

  new Whisper(5, ...whisperLeft),
  new Whisper(5, ...whisperRight),
  new Whisper(5, ...whisperBar),

  ...mushroomSelfCountNFAs(),
  ...mushroomNoEchoPairs(),
];
