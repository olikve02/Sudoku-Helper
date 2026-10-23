import { Box } from "@mui/material";
import { useState } from "react";
import {
  Crosshair,
  Eraser,
  Grid2x2Check,
  PencilLine,
  Trash,
  Undo2,
} from "lucide-react";
import Board from "./components/Board";
import NewGameMenu from "./components/NewGameMenu";
import NumberButtonRow from "./components/NumberButtonRow";
import CameraScanner from "./components/CameraScanner";
import ToolButton from "./components/ToolButton";
import useSudokuBoard, { completedNumbers } from "./hooks/useSudokuBoard";
import scanBoard from "./scanner/scanBoard";
import LabelingTool from "./tools/labeling/LabelingTool";
import "./App.css";
import useTimer from "./hooks/useTimer";

// Merkeverktøyet for treningsdata åpnes med ?label i adressen
const showLabelingTool = new URLSearchParams(window.location.search).has(
  "label",
);

type Screen = "board" | "camera";

function App() {
  const [screen, setScreen] = useState<Screen>("board");
  const board = useSudokuBoard();
  const timer = useTimer();
  if (showLabelingTool) {
    return <LabelingTool />;
  }

  return (
    <Box className="screen-container">
      {screen === "board" ? (
        <Box className="board-screen">
          <header className="app-header">
            <h1 className="app-title">
              Sudoku <span>Helper</span>
            </h1>
            <span className="timer">{timer.time}</span>
            <NewGameMenu
              onNewGame={(givens) => {
                board.newGame(givens);
                timer.restart();
              }}
              onScan={() => setScreen("camera")}
            />
          </header>

          <Board
            cells={board.cells}
            onCellClick={board.selectCell}
            solution={board.solution}
            showAllPeers={board.showAllPeers}
          />

          <Box className="toolbar">
            <ToolButton icon={Undo2} label="Angre" onClick={board.undo} />
            <ToolButton icon={Eraser} label="Visk ut" onClick={board.erase} />
            <ToolButton
              icon={PencilLine}
              label="Notater"
              onClick={board.toggleCandidateMode}
              active={board.candidateMode}
            />
            <ToolButton
              icon={Grid2x2Check}
              label="Flervalg"
              onClick={board.toggleSelectMultiple}
              active={board.selectMultiple}
            />
            <ToolButton
              icon={Crosshair}
              label="Naboer"
              onClick={board.toggleShowAllPeers}
              active={board.showAllPeers}
            />
            <ToolButton icon={Trash} label="Tøm" onClick={board.clearBoard} />
          </Box>

          <NumberButtonRow
            onNumberClick={board.enterNumber}
            completedNumbers={completedNumbers(board.cells)}
            candidateMode={board.candidateMode}
          />
        </Box>
      ) : (
        <CameraScanner
          onCapture={handleCapture}
          onBack={() => setScreen("board")}
        />
      )}
    </Box>
  );

  async function handleCapture(
    video: HTMLVideoElement,
    guideBox: HTMLDivElement,
  ) {
    const digits = await scanBoard(video, guideBox);
    if (digits.length > 0) {
      board.setScannedValues(digits);
      setScreen("board");
    } else {
      alert("Fant ikke brettet. Hold det innenfor rammen og prøv igjen");
    }
  }
}
export default App;
