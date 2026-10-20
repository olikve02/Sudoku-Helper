import detectBoard from "./detectBoard";
import cropCells from "./cropCells";
import processCells from "./processCells";
import recognizeDigits from "./recognizeDigits";

const GUIDE_MARGIN = 0.1; // ta med 10 % ekstra på hver side av guideboksen

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

// Tegner den delen av videoen som ligger innenfor guideboksen over på et canvas.
// Tar med litt ekstra rundt boksen, så brettet blir funnet selv om kanten av det
// ligger på eller litt utenfor den grønne linja.
function captureGuideBox(
  video: HTMLVideoElement,
  guideBox: HTMLDivElement,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");

  const guideRect = guideBox.getBoundingClientRect();
  const videoRect = video.getBoundingClientRect();

  const scaleX = video.videoWidth / videoRect.width;
  const scaleY = video.videoHeight / videoRect.height;

  const marginX = guideRect.width * GUIDE_MARGIN;
  const marginY = guideRect.height * GUIDE_MARGIN;
  const left = Math.max(0, (guideRect.left - videoRect.left - marginX) * scaleX);
  const top = Math.max(0, (guideRect.top - videoRect.top - marginY) * scaleY);
  const right = Math.min(
    video.videoWidth,
    (guideRect.right - videoRect.left + marginX) * scaleX,
  );
  const bottom = Math.min(
    video.videoHeight,
    (guideRect.bottom - videoRect.top + marginY) * scaleY,
  );

  // Bruk kameraets egen oppløsning, ikke skjermstørrelsen på guideboksen
  const sw = right - left;
  const sh = bottom - top;
  canvas.width = Math.round(sw);
  canvas.height = Math.round(sh);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Kunne ikke opprette canvas-kontekst");
  }

  context.drawImage(video, left, top, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}
