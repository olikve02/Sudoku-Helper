"""
Trener modellen som gjenkjenner sifrene 1–9 i sudokuceller.

Bildene leses fra ml/data/1 … ml/data/9 (28×28, hvitt siffer på svart bunn,
laget med merkeverktøyet i appen). Den ferdige modellen lagres til
ml/digit-model.keras.

Bruk:
    python ml/train.py                  # tren og lagre
    python ml/train.py --plot           # vis læringskurven etterpå
    python ml/train.py --show-mistakes  # vis valideringsbildene modellen bommer på
"""

import argparse
import os
from pathlib import Path

import keras
import matplotlib.pyplot as plt
import numpy as np

ML_DIR = Path(__file__).parent
DATA_DIR = ML_DIR / "data"
MODEL_PATH = ML_DIR / "digit-model.keras"

# Delingen skjer per ark, så celler fra samme brett ikke havner i flere deler.
# Ark som er samme brett fotografert flere ganger (1/7, 2/4, 3/26, 5/6) holdes sammen.
TEST_SHEETS = [3, 20, 24, 26]
VALIDATION_SHEETS = [5, 6, 21, 22]


def load_data():
    """Leser alle bildene. Returnerer bilder (0–1), klasser (0–8), arknummer og filnavn."""
    images, labels, sheets, file_names = [], [], [], []

    for digit in range(1, 10):
        folder = DATA_DIR / str(digit)
        for file_name in os.listdir(folder):
            # Filnavn: sheet12-cell-34.png
            sheets.append(int(file_name.split("-")[0].removeprefix("sheet")))
            image = keras.utils.load_img(folder / file_name, color_mode="grayscale")
            images.append(keras.utils.img_to_array(image))
            labels.append(digit)
            file_names.append(f"{digit}/{file_name}")

    images = np.array(images) / 255
    labels = np.array(labels) - 1  # Keras vil ha klasser fra 0: sifrene 1–9 blir 0–8
    return images, labels, np.array(sheets), np.array(file_names)


def split_by_sheet(sheets):
    """Lager masker for trening, validering og test ut fra arknummeret."""
    test = np.isin(sheets, TEST_SHEETS)
    validation = np.isin(sheets, VALIDATION_SHEETS)
    training = ~test & ~validation
    return training, validation, test


def build_model():
    model = keras.Sequential([
        keras.layers.Input(shape=(28, 28, 1)),
        keras.layers.Conv2D(32, (3, 3), activation="relu"),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Conv2D(64, (3, 3), activation="relu"),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Flatten(),
        keras.layers.Dense(64, activation="relu"),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(9, activation="softmax"),
    ])
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def plot_history(history):
    plt.plot(history.history["accuracy"], label="trening")
    plt.plot(history.history["val_accuracy"], label="validering")
    plt.xlabel("epoch")
    plt.ylabel("accuracy")
    plt.legend()
    plt.show()


def show_mistakes(model, images, labels, file_names):
    """Viser bildene modellen tar feil på, ett om gangen. Lukk vinduet for å se neste."""
    predictions = np.argmax(model.predict(images), axis=1)
    wrong = predictions != labels
    print(f"Feil: {wrong.sum()} av {len(labels)}")

    for image, prediction, label, file_name in zip(
        images[wrong], predictions[wrong], labels[wrong], file_names[wrong]
    ):
        plt.imshow(image, cmap="gray")
        plt.title(f"Gjettet: {prediction + 1}  Riktig: {label + 1}\n{file_name}")
        plt.show()


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--plot", action="store_true", help="vis læringskurven")
    parser.add_argument("--show-mistakes", action="store_true", help="vis feilene på valideringssettet")
    args = parser.parse_args()

    images, labels, sheets, file_names = load_data()
    training, validation, test = split_by_sheet(sheets)
    print(f"Bilder: {len(images)}  trening: {training.sum()}  validering: {validation.sum()}  test: {test.sum()}")

    model = build_model()
    model.summary()

    # Stopper når val_loss ikke har blitt bedre på 5 epochs, og går tilbake til den beste
    early_stopping = keras.callbacks.EarlyStopping(
        monitor="val_loss", patience=5, restore_best_weights=True
    )
    history = model.fit(
        images[training],
        labels[training],
        epochs=100,
        validation_data=(images[validation], labels[validation]),
        callbacks=[early_stopping],
    )

    test_loss, test_accuracy = model.evaluate(images[test], labels[test], verbose=0)
    print(f"Test: accuracy {test_accuracy:.1%}, loss {test_loss:.3f}")

    model.save(MODEL_PATH)
    print(f"Lagret modellen til {MODEL_PATH}")
    print("Eksporter til appen med: python ml/export_tfjs.py ml/digit-model.keras public/models/digits")

    if args.plot:
        plot_history(history)
    if args.show_mistakes:
        show_mistakes(model, images[validation], labels[validation], file_names[validation])


if __name__ == "__main__":
    main()
