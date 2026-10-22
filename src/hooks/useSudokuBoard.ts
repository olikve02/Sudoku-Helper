import { useEffect, useState } from "react";
import type { CellState } from "../types";
import { solve } from "../sudoku/solver";

/**
 * All tilstand og logikk for sudokubrettet: hvilke celler som er valgt,
 * tall og kandidater, og angre-historikk.
 */
export default function useSudokuBoard() {
  const [cells, setCells] = useState<CellState[]>(loadBoard);
  const [history, setHistory] = useState<CellState[][]>([]);
  const [selectMultiple, setSelectMultiple] = useState(false);
  const [candidateMode, setCandidateMode] = useState(false);
  const [solution, setSolution] = useState<number[] | null>(loadSolution);
  const [showAllPeers, setShowAllPeers] = useState(false);

  useEffect(() => {
    localStorage.setItem("cells", JSON.stringify(cells));
    localStorage.setItem("solution", JSON.stringify(solution));
  }, [cells, solution]);

  // Velger en celle. I flervalgsmodus slås cella av og på uten å påvirke de andre.
  function selectCell(row: number, col: number) {
    setCells(
      cells.map((cell) => {
        const isClicked = cell.row === row && cell.col === col;
        if (selectMultiple) {
          return isClicked ? { ...cell, selected: !cell.selected } : cell;
        }
        return { ...cell, selected: isClicked };
      }),
    );
  }

  // Setter tallet i de valgte cellene, eller slår kandidaten av/på i kandidatmodus
  function enterNumber(number: number) {
    const selectedCells = cells.filter((cell) => cell.selected == true);

    const newCells = cells.map((cell) => {
      if (cell.selected) {
        if (!candidateMode) {
          return { ...cell, value: number };
        }

        const candidates = cell.candidates.includes(number)
          ? cell.candidates.filter((candidate) => candidate !== number)
          : [...cell.candidates, number];
        return { ...cell, candidates };
      }

      if (
        selectedCells.some((cell2) => isPeer(cell, cell2)) &&
        !candidateMode
      ) {
        return {
          ...cell,
          candidates: cell.candidates.filter(
            (candidate) => candidate != number,
          ),
        };
      }

      return cell;
    });

    setHistory([...history, cells]);
    setCells(newCells);
  }

  // Går tilbake til brettet slik det var før forrige endring
  function undo() {
    const previous = history.at(-1);
    if (!previous) return;

    setHistory(history.slice(0, -1));
    setCells(previous);
  }

  // Legger inn 81 skannede tall (0 = tom celle)
  function setScannedValues(digits: number[]) {
    const board = [...digits];
    if (solve(board)) {
      setSolution(board);
    } else {
      setSolution(null);
    }

    setCells(
      cells.map((cell, index) => ({
        ...cell,
        value: digits[index] ? digits[index] : null,
        candidates: [],
        selected: false,
      })),
    );
  }
  //Fjerner alt i cellene som er markert
  function erase() {
    const newCells = cells.map((cell) => {
      if (cell.selected) {
        return { ...cell, value: null, candidates: [] };
      } else {
        return cell;
      }
    });
    setHistory([...history, cells]);
    setCells(newCells);
  }

  function clearBoard() {
    if (confirm("Vil du tømme brettet")) {
      const newCells = createEmptyBoard();
      setCells(newCells);
      setSolution(null);
    }
  }

  function toggleShowAllPeers() {
    setShowAllPeers(!showAllPeers);
  }

  return {
    cells,
    selectMultiple,
    candidateMode,
    selectCell,
    enterNumber,
    undo,
    setScannedValues,
    erase,
    clearBoard,
    solution,
    showAllPeers,
    toggleShowAllPeers,
    toggleSelectMultiple: () => setSelectMultiple(!selectMultiple),
    toggleCandidateMode: () => setCandidateMode(!candidateMode),
  };
}
//Returns true if cells are is in same row, column or block
function isPeer(cell1: CellState, cell2: CellState): boolean {
  const cell1BlockRow = Math.floor((cell1.row - 1) / 3);
  const cell1BlockCol = Math.floor((cell1.col - 1) / 3);

  const cell2BlockRow = Math.floor((cell2.row - 1) / 3);
  const cell2BlockCol = Math.floor((cell2.col - 1) / 3);

  if (
    cell1.row === cell2.row ||
    cell1.col === cell2.col ||
    (cell1BlockRow === cell2BlockRow && cell1BlockCol == cell2BlockCol)
  )
    return true;
  return false;
}

export function isPeerOfSelectedCell(
  cell: CellState,
  cells: CellState[],
): boolean {
  if (cell.selected) return false;

  return cells.some((cell2) => isPeer(cell, cell2) && cell2.selected);
}

export function isPeerOfSameValueAsSelected(
  cell: CellState,
  cells: CellState[],
): boolean {
  const selectedCell = cells.find((restCell) => restCell.selected === true);

  if (!selectedCell) return false;
  if (!selectedCell.value) return false;
  return cells.some(
    (cell2) => isPeer(cell, cell2) && cell2.value == selectedCell.value,
  );
}

export function hasConflict(cell: CellState, cells: CellState[]): boolean {
  if (!cell.value) return false;

  const hasConflict = cells.some(
    (cell2) =>
      isPeer(cell, cell2) &&
      cell.value === cell2.value &&
      (cell.col !== cell2.col || cell.row !== cell2.row),
  );
  return hasConflict;
}

export function isWrong(
  cell: CellState,
  index: number,
  solution: number[] | null,
): boolean {
  if (!solution) return false;
  if (!cell.value) return false;
  if (cell.value !== solution[index]) return true;
  return false;
}

export function sameValueAsSelected(
  cell: CellState,
  cells: CellState[],
): boolean {
  if (cell.selected) return false;
  if (cell.value === null) return false;

  return cells.some((cell2) => cell.value === cell2.value && cell2.selected);
}

export function completedNumbers(cells: CellState[]): number[] {
  const NUMBERS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const completedNums = [];
  for (const number of NUMBERS) {
    if (cells.filter((cell) => cell.value === number).length >= 9) {
      completedNums.push(number);
    }
  }
  console.log(completedNums);
  return completedNums;
}

function createEmptyBoard(): CellState[] {
  const cells: CellState[] = [];
  for (let row = 1; row <= 9; row++) {
    for (let col = 1; col <= 9; col++) {
      cells.push({ row, col, value: null, candidates: [], selected: false });
    }
  }
  return cells;
}

function loadBoard(): CellState[] {
  const localCells = localStorage.getItem("cells");
  try {
    if (localCells) {
      return JSON.parse(localCells);
    }
  } catch {
    return createEmptyBoard();
  }
  return createEmptyBoard();
}

function loadSolution(): number[] | null {
  const localSolution = localStorage.getItem("solution");
  try {
    if (localSolution) {
      return JSON.parse(localSolution);
    }
  } catch {
    return null;
  }
  return null;
}
