export function solve(board: number[]): boolean {
  const firstEmptyCell = board.indexOf(0);
  if (firstEmptyCell === -1) {
    return true;
  }
  for (let i = 1; i <= 9; i++) {
    if (!isValid(board, firstEmptyCell, i)) {
      continue;
    }
    board[firstEmptyCell] = i;
    if (solve(board)) {
      return true;
    }
    board[firstEmptyCell] = 0;
  }
  return false;
}

export function isValid(
  board: number[],
  index: number,
  number: number,
): boolean {
  for (let i = 0; i < board.length; i++) {
    if (isPeerIndex(index, i) && board[i] === number && i !== index) {
      return false;
    }
  }
  return true;
}

function isPeerIndex(a: number, b: number): boolean {
  const rowA = Math.floor(a / 9);
  const colA = a % 9;
  const blockRowA = Math.floor(rowA / 3);
  const blockColA = Math.floor(colA / 3);

  const rowB = Math.floor(b / 9);
  const colB = b % 9;
  const blockRowB = Math.floor(rowB / 3);
  const blockColB = Math.floor(colB / 3);

  if (
    rowA === rowB ||
    colA === colB ||
    (blockRowA === blockRowB && blockColA === blockColB)
  ) {
    return true;
  }
  return false;
}
