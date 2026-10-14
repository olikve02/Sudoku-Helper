import { createWorker, PSM } from "tesseract.js";

export default async function recognizeSudoku(
  cellImages: string[],
): Promise<number[]> {
  const worker = await createWorker("eng");

  try {
    await worker.setParameters({
      tessedit_char_whitelist: "123456789",
      tessedit_pageseg_mode: PSM.SINGLE_CHAR,
    });

    const sudokuNumbers: number[] = [];

    for (const image of cellImages) {
      const {
        data: { text },
      } = await worker.recognize(image);

      const match = text.trim().match(/[1-9]/);
      sudokuNumbers.push(match ? Number(match[0]) : 0);
    }

    return sudokuNumbers;
  } finally {
    await worker.terminate();
  }
}
