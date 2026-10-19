"""
Eksporterer en Keras-modell til TensorFlow.js-format (model.json + weights.bin),
så appen kan laste den med tf.loadLayersModel("/models/digits/model.json").

Vi bruker ikke tensorflowjs-pakken, fordi den ikke er helt kompatibel med Keras 3
(feil navn på vektene og input-formen) og drar med seg tunge avhengigheter.

Bruk:
    python ml/export_tfjs.py ml/digit-model.keras public/models/digits
"""

import json
import os
import sys

import keras
import numpy as np


def export_tfjs(model, out_dir):
    os.makedirs(out_dir, exist_ok=True)

    # Modellens oppbygning. TF.js bruker det gamle navnet batch_input_shape
    topology = json.loads(model.to_json())

    def rename(o):
        if isinstance(o, dict):
            if "batch_shape" in o:
                o["batch_input_shape"] = o.pop("batch_shape")
            for v in o.values():
                rename(v)
        elif isinstance(o, list):
            for v in o:
                rename(v)

    rename(topology)

    # Vektene, i navneformatet TF.js forventer: "lagnavn/kernel", "lagnavn/bias"
    specs, chunks = [], []
    for layer in model.layers:
        for w in layer.weights:
            value = np.asarray(w.numpy(), dtype="<f4")
            specs.append(
                {"name": f"{layer.name}/{w.name}", "shape": list(value.shape), "dtype": "float32"}
            )
            chunks.append(value.tobytes())

    with open(os.path.join(out_dir, "weights.bin"), "wb") as f:
        f.write(b"".join(chunks))

    with open(os.path.join(out_dir, "model.json"), "w") as f:
        json.dump(
            {
                "format": "layers-model",
                "generatedBy": f"keras v{keras.__version__}",
                "convertedBy": "export_tfjs.py",
                "modelTopology": {"model_config": topology},
                "weightsManifest": [{"paths": ["weights.bin"], "weights": specs}],
            },
            f,
        )


if __name__ == "__main__":
    model = keras.models.load_model(sys.argv[1], compile=False)
    export_tfjs(model, sys.argv[2])
    print(f"Eksporterte {sys.argv[1]} til {sys.argv[2]}")
