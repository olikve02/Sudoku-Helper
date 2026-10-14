import processCroppedCells from "./ProcessCroppedCells";

export default async function cropCells(
  canvas: HTMLCanvasElement,
): Promise<Array<string>> {
  const croppedCells: HTMLCanvasElement[] = [];

  const cellHeight = canvas.height / 9;
  const cellWidth = canvas.width / 9;

  let yAlign = 0;
  for (let i = 0; i < 9; i++) {
    //Row
    let xAlign = 0;
    for (let j = 0; j < 9; j++) {
      //Column
      const newCanvas = document.createElement("canvas");
      newCanvas.width = cellWidth;
      newCanvas.height = cellHeight;
      const canvasContext = newCanvas.getContext("2d");

      const margin = 5;

      canvasContext?.drawImage(
        canvas,
        xAlign + margin,
        yAlign + margin,
        cellWidth - margin * 2,
        cellHeight - margin * 2,
        0,
        0,
        cellWidth,
        cellHeight,
      );

      croppedCells.push(newCanvas);
      xAlign += cellWidth;
    }
    yAlign += cellHeight;
  }
  const processedCells = await processCroppedCells(croppedCells);
  const processedCellStrings = processedCells.map((cell) =>
    cell.toDataURL("image/png"),
  );
  return processedCellStrings;
}
