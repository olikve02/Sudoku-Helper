import { Box, Button } from "@mui/material";
import { useRef, useState } from "react";
import JSZip from "jszip";
import ImageFileInput from "./ImageFileInput";
import detectBoard from "../../scanner/detectBoard";
import cropCells from "../../scanner/cropCells";
import processCells, { type ProcessedCell } from "../../scanner/processCells";

const dataOf = (canvas: HTMLCanvasElement) =>
  canvas.toDataURL("image/png").split(",")[1];

/**
 * Utviklerverktøy for å lage treningsdata. Last opp et bilde av et brett,
 * skriv inn riktig siffer for hver celle, og last ned cellene som en zip
 * med én mappe per siffer (pluss de ubehandlede utsnittene i raw/).
 * Åpnes med ?label i adressen.
 */
function LabelingTool() {
  const [cells, setCells] = useState<ProcessedCell[]>([]);
  const [rawCells, setRawCells] = useState<HTMLCanvasElement[]>([]);
  const [sheetId, setSheetId] = useState(0);
  const [index, setIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [finished, setFinished] = useState(false);

  const savedPaths = useRef<string[][]>([]);
  const zip = useRef(new JSZip());
  const inputRef = useRef<HTMLInputElement>(null);

  const current = cells[index];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: 220 }}>
      <span>
        {cells.length
          ? `Ark ${sheetId} – celle ${index + 1} / ${cells.length}`
          : "Velg et bilde"}
      </span>

      {current && !finished && (
        <Box sx={{ display: "flex", gap: 1 }}>
          <img
            src={current.canvas.toDataURL("image/png")}
            style={{
              width: 100,
              imageRendering: "pixelated",
              background: "#000",
            }}
            title="Prosessert"
          />
          <img
            src={rawCells[index]?.toDataURL("image/png")}
            style={{ width: 100 }}
            title="Rå"
          />
        </Box>
      )}

      {finished && (
        <span>Arket er ferdig. Last ned zip eller velg nytt bilde.</span>
      )}

      <input
        ref={inputRef}
        autoFocus
        value={userInput}
        placeholder="0-9 (0 = tom)"
        onChange={() => {}}
        onKeyDown={(e) => {
          if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            label(e.key);
          } else if (e.key === "Enter" && userInput !== "") {
            label(userInput);
          } else if (e.key === "ArrowLeft") {
            goBack();
          }
        }}
      />

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button onClick={goBack} disabled={index === 0}>
          Tilbake
        </Button>
        <Button onClick={downloadZip}>Last ned zip</Button>
      </Box>

      <ImageFileInput onImageSelected={handleImageSelected} />
    </Box>
  );

  async function handleImageSelected(image: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);

    const board = await detectBoard(canvas);
    if (!board || board.width === 0) {
      alert("Fant ikke sudokubrettet i bildet.");
      return;
    }

    const raw = await cropCells(board);
    const processed = await processCells(raw);

    savedPaths.current = [];
    setSheetId(sheetId + 1);
    setRawCells(raw);
    setCells(processed);
    setFinished(false);
    show(0, processed);
  }

  // Viser celle i, med "0" ferdig utfylt hvis den ser tom ut
  function show(i: number, list: ProcessedCell[] = cells) {
    setIndex(i);
    setUserInput(list[i].isEmpty ? "0" : "");
    inputRef.current?.focus();
  }

  function label(value: string) {
    if (!current || finished) return;

    // Hvis cella allerede er merket (etter "Tilbake"), fjern den gamle
    savedPaths.current[index]?.forEach((p) => zip.current.remove(p));

    const name = `sheet${sheetId}-cell-${String(index + 1).padStart(2, "0")}.png`;
    const processedPath = `${value}/${name}`;
    const rawPath = `raw/${value}/${name}`;

    zip.current.file(processedPath, dataOf(current.canvas), { base64: true });
    zip.current.file(rawPath, dataOf(rawCells[index]), { base64: true });
    savedPaths.current[index] = [processedPath, rawPath];

    if (index + 1 >= cells.length) {
      setFinished(true);
      setUserInput("");
    } else {
      show(index + 1);
    }
  }

  function goBack() {
    if (index === 0 && !finished) return;
    setFinished(false);
    show(finished ? cells.length - 1 : index - 1);
  }

  async function downloadZip() {
    const blob = await zip.current.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sudoku-cells.zip";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export default LabelingTool;
