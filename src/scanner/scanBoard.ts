import detectBoard from "./detectBoard";
import cropCells from "./cropCells";
import processCells from "./processCells";
import recognizeDigits from "./recognizeDigits";

/**
 * Tar bilde av området innenfor guideboksen og gjenkjenner sudokubrettet.
 * Returnerer 81 tall (rad for rad): 0 for tomme celler, ellers 1–9.
 * Returnerer en tom liste hvis brettet ikke ble funnet.
 */
export default async function scanBoard(
  video: HTMLVideoElement,
  guideBox: HTMLDivElement,
): Promise<number[]> {
  // Klipp ut området innenfor guideboksen
  const image = captureGuideBox(video, guideBox);

  // Finn brettet og rett opp perspektivet
  const board = await detectBoard(image);
  if (!board) return [];

  // Del i 81 celler, gjør dem klare for modellen og gjenkjenn sifrene
  const cells = await cropCells(board);
  const processedCells = await processCells(cells);
  return recognizeDigits(processedCells);
}

// Tegner den delen av videoen som ligger innenfor guideboksen over på et canvas
function captureGuideBox(
  video: HTMLVideoElement,
  guideBox: HTMLDivElement,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");

  const guideRect = guideBox.getBoundingClientRect();
  const videoRect = video.getBoundingClientRect();

  const scaleX = video.videoWidth / videoRect.width;
  const scaleY = video.videoHeight / videoRect.height;

  canvas.width = guideRect.width;
  canvas.height = guideRect.height;

  const sx = (guideRect.left - videoRect.left) * scaleX;
  const sy = (guideRect.top - videoRect.top) * scaleY;
  const sw = guideRect.width * scaleX;
  const sh = guideRect.height * scaleY;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Kunne ikke opprette canvas-kontekst");
  }

  context.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}
