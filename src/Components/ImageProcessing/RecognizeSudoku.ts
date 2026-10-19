import { createWorker, PSM } from "tesseract.js";

export default async function recognizeSudoku(
  cellImages: string[],
): Promise<number[]> {
  const worker = await createWorker("eng");

  try {
    await worker.setParameters({
      tessedit_char_whitelist: "123456789",
      tessedit_pageseg_mode: PSM.SINGLE_WORD,
    });

    const sudokuNumbers: number[] = [];

    for (const image of cellImages) {
      const preparedImage = await prepareImageForOCR(image);

      const {
        data: { text },
      } = await worker.recognize(preparedImage);

      const match = text.trim().match(/[1-9]/);
      sudokuNumbers.push(match ? Number(match[0]) : 0);
    }

    return sudokuNumbers;
  } finally {
    await worker.terminate();
  }
}
export async function testScaleImages(cellImages: string[]): Promise<string[]> {
  const preparedImages: string[] = [];
  cellImages.forEach(async (image) => {
    preparedImages.push(await prepareImageForOCR(image));
  });

  return preparedImages;
}
function prepareImageForOCR(image: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = 3;
      const padding = 15;
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale + padding * 2;
      canvas.height = img.height * scale + padding * 2;
      const canvasContext = canvas.getContext("2d");

      if (!canvasContext) {
        reject(new Error("Kunne ikke lage canvas"));
        return;
      }
      canvasContext.fillStyle = "white";
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);
      canvasContext.drawImage(
        img,
        padding,
        padding,
        img.width * scale,
        img.height * scale,
      );
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      reject(new Error("Kunne ikke laste bildet"));
    };
    img.src = image;
  });
}
