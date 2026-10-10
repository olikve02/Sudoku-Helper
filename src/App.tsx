import { Box } from "@mui/material";
import Board from "./Components/Board";
import { useState } from "react";
import CandidateButtonRow from "./Components/Buttons/CandidateButtonRow";
import NumberButtonRow from "./Components/Buttons/NumberButtonRow";
import ClearSelectedCellsButton from "./Components/Buttons/ClearSelectedCellsButton";
import ToggleSelectModeButton from "./Components/Buttons/ToggleSelectModeButton";
import UndoButton from "./Components/Buttons/UndoButton";
import sudokuImage from "./assets/Sudoku-page.jpg";

function App() {
  const [selectMultipleCells, setSelectMultipleCells] = useState(false);
  const [cells, setCells] = useState<
    {
      row: number;
      cell: number;
      value: number | null;
      candidates: number[];
      selected: boolean;
    }[]
  >(addCells);

  const [cellHistory, setCellHistory] = useState<(typeof cells)[]>([]);
  return (
    <Box className="screen-container">
      <Board cells={cells} handleCellClicked={handleCellClicked}></Board>

      <CandidateButtonRow
        handleCandidateButtonClicked={handleCandidateButtonClicked}
      ></CandidateButtonRow>

      <NumberButtonRow
        handleNumberButtonClicked={handleNumberButtonClicked}
      ></NumberButtonRow>

      <ClearSelectedCellsButton
        handleClearSelectedCellsClicked={handleClearSelectedCellsClicked}
      ></ClearSelectedCellsButton>

      <ToggleSelectModeButton
        handleSelectModeClicked={handleSelectModeClicked}
      ></ToggleSelectModeButton>

      <UndoButton handleUndoClick={handleUndoClick}></UndoButton>
    </Box>
  );

  function handleCellClicked(row: number, cell: number) {
    var newCells = cells;
    if (!selectMultipleCells) {
      newCells = cells.map((cellState) => {
        if (cellState.row == row && cellState.cell == cell) {
          return { ...cellState, selected: true };
        } else {
          return { ...cellState, selected: false };
        }
      });
    } else {
      newCells = cells.map((cellState) => {
        if (cellState.row == row && cellState.cell == cell) {
          return { ...cellState, selected: !cellState.selected };
        } else {
          return cellState;
        }
      });
    }

    setCells(newCells);
  }

  function handleCandidateButtonClicked(buttonNr: number) {
    const newCells = cells.map((cell) => {
      if (cell.selected) {
        if (cell.candidates.includes(buttonNr)) {
          return {
            ...cell,
            candidates: cell.candidates.filter(
              (candidate) => candidate != buttonNr,
            ),
          };
        } else {
          return { ...cell, candidates: [...cell.candidates, buttonNr] };
        }
      } else {
        return cell;
      }
    });

    setCellHistory([...cellHistory, cells]);
    setCells(newCells);
  }

  function handleNumberButtonClicked(buttonNr: number) {
    const newCells = cells.map((cell) => {
      if (cell.selected) {
        return { ...cell, value: buttonNr };
      } else {
        return cell;
      }
    });
    setCellHistory([...cellHistory, cells]);
    setCells(newCells);
  }

  function handleClearSelectedCellsClicked() {
    const newCells = cells.map((cell) => {
      if (cell.selected) {
        return { ...cell, selected: false };
      } else {
        return cell;
      }
    });
    setCells(newCells);
  }

  function handleSelectModeClicked() {
    setSelectMultipleCells(!selectMultipleCells);
  }

  function handleUndoClick() {
    const previousBoards = cellHistory.slice(0, -1);
    console.log(previousBoards);
    setCellHistory(previousBoards);
    const snapshot = cellHistory.at(-1);
    if (snapshot != undefined) {
      setCells(snapshot);
    }
  }
}

function addCells() {
  const cells = [];
  for (let row = 1; row <= 9; row++) {
    for (let cell = 1; cell <= 9; cell++) {
      cells.push({
        row: row,
        cell: cell,
        value: null,
        candidates: [],
        selected: false,
      });
    }
  }
  return cells;
}
export default App;
