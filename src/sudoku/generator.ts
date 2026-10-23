import { isValid } from "./solver";

function shuffle(numbers: number[]): number[] {
  return [...numbers].sort(() => Math.random() - 0.5);
}

function fillRandom(board: number[]): boolean {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const firstEmptyCell = board.indexOf(0);
  if (firstEmptyCell === -1) {
    return true;
  }
  for (const number of shuffle(numbers)) {
    if (!isValid(board, firstEmptyCell, number)) {
      continue;
    }
    board[firstEmptyCell] = number;
    if (fillRandom(board)) {
      return true;
    }
    board[firstEmptyCell] = 0;
  }
  return false;
}

function countSolutions(board: number[]): number {
  const firstEmptyCell = board.indexOf(0);
  if (firstEmptyCell === -1) {
    return 1;
  }
  let count = 0;
  for (let i = 1; i <= 9; i++) {
    if (!isValid(board, firstEmptyCell, i)) {
      continue;
    }
    board[firstEmptyCell] = i;

    count += countSolutions(board);

    board[firstEmptyCell] = 0;
    if (count >= 2) {
      break;
    }
  }
  return count;
}

export function generate(givens: number): {
  puzzle: number[];
  solution: number[];
} {
  const solution = new Array(81).fill(0);
  fillRandom(solution);
  const puzzle = [...solution];
  let positions: number[] = [];
  for (let i = 0; i < 81; i++) {
    positions.push(i);
  }
  positions = shuffle(positions);
  let remaining = 81;

  for (const position of positions) {
    // a) Nok få tall igjen? Stopp.
    if (remaining <= givens) break;

    // b) Husk tallet, og visk det ut
    const removed = puzzle[position];
    puzzle[position] = 0;

    // c) Sjekk: har oppgaven fortsatt bare én løsning?
    if (countSolutions(puzzle) !== 1) {
      // Nei → tallet var nødvendig. Sett det tilbake.
      puzzle[position] = removed;
    } else {
      // Ja → tallet er borte for godt. Ett tall mindre igjen.
      remaining -= 1;
    }
  }
  return { puzzle, solution };
}
