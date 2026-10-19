import * as tf from "@tensorflow/tfjs";
import type { ProcessedCell } from "./processCells";

// Modellen lastes bare første gang, og gjenbrukes etterpå
let model: tf.LayersModel | null = null;

/**
 * Gjenkjenner sifrene i 81 behandlede celler.
 * Returnerer 81 tall: 0 for tomme celler, ellers sifferet 1–9.
 */
export default async function recognizeDigits(
  cells: ProcessedCell[],
): Promise<number[]> {
  if (!model) {
    model = await tf.loadLayersModel("/models/digits/model.json");
  }

  // Tomme celler har allerede riktig svar (0)
  const result: number[] = new Array(cells.length).fill(0);

  // Plukk ut cellene med siffer, og husk hvilken plass (0–80) de hadde
  const canvases: HTMLCanvasElement[] = [];
  const positions: number[] = [];
  cells.forEach((cell, index) => {
    if (!cell.isEmpty) {
      canvases.push(cell.canvas);
      positions.push(index);
    }
  });
  if (canvases.length === 0) return result;

  // Samme behandling som i Python: gråtoner, 0–1, alle bildene i én bunke
  const classes = tf.tidy(() => {
    const images = tf.stack(
      canvases.map((canvas) => tf.browser.fromPixels(canvas, 1).div(255)),
    );
    const probabilities = model!.predict(images) as tf.Tensor;
    return probabilities.argMax(1);
  });

  const predicted = await classes.data();
  classes.dispose();

  // Klasse 0–8 er sifrene 1–9
  positions.forEach((position, i) => {
    result[position] = predicted[i] + 1;
  });

  return result;
}
