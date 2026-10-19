import { useState } from "react";
import type { CellState } from "../types";

/**
 * All tilstand og logikk for sudokubrettet: hvilke celler som er valgt,
 * tall og kandidater, og angre-historikk.
 */
export default function useSudokuBoard() {
  const [cells, setCells] = useState<CellState[]>(createEmptyBoard);
  const [history, setHistory] = useState<CellState[][]>([]);
  const [selectMultiple, setSelectMultiple] = useState(false);
  const [candidateMode, setCandidateMode] = useState(false);

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
    const newCells = cells.map((cell) => {
      if (!cell.selected) return cell;

      if (!candidateMode) {
        return { ...cell, value: number };
      }

      const candidates = cell.candidates.includes(number)
        ? cell.candidates.filter((candidate) => candidate !== number)
        : [...cell.candidates, number];
      return { ...cell, candidates };
    });

    setHistory([...history, cells]);
    setCells(newCells);
  }

  // Fjerner markeringen fra alle celler
  function clearSelection() {
    setCells(cells.map((cell) => ({ ...cell, selected: false })));
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
    setCells(
      cells.map((cell, index) => ({
        ...cell,
        value: digits[index] ? digits[index] : null,
      })),
    );
  }

  return {
    cells,
    selectMultiple,
    candidateMode,
    selectCell,
    enterNumber,
    clearSelection,
    undo,
    setScannedValues,
    toggleSelectMultiple: () => setSelectMultiple(!selectMultiple),
    toggleCandidateMode: () => setCandidateMode(!candidateMode),
  };
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
