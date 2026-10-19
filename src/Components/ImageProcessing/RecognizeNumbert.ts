import * as tf from "@tensorflow/tfjs";

let model: tf.LayersModel | null = null;

async function loadModel(): Promise<tf.LayersModel> {
  if (!model) {
    model = await tf.loadLayersModel("/models/digit-recognition/model.json");
  }

  return model;
}

export default async function recognizeHandwriting(
  images: HTMLCanvasElement[],
): Promise<number[]> {
  const loadedModel = await loadModel();
  const predictions: number[] = [];

  for (const image of images) {
    const input = tf.tidy(() => {
      const pixels = tf.browser.fromPixels(image, 1);
      const resized = tf.image.resizeBilinear(pixels, [28, 28]);
      const inverted = tf.scalar(255).sub(resized);

      return inverted.div(255).expandDims(0);
    });

    let prediction: tf.Tensor | undefined;

    try {
      prediction = loadedModel.predict(input) as tf.Tensor;
      const probabilities = await prediction.data();

      let bestIndex = 0;

      for (let i = 1; i < probabilities.length; i++) {
        if (probabilities[i] > probabilities[bestIndex]) {
          bestIndex = i;
        }
      }

      predictions.push(bestIndex);
    } finally {
      prediction?.dispose();
      input.dispose();
    }
  }

  return predictions;
}
