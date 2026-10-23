"""
Trener modellen som gjenkjenner sifrene 1–9 i sudokuceller.

Bildene leses fra ml/data/1 … ml/data/9 (28×28, hvitt siffer på svart bunn,
laget med merkeverktøyet i appen). Under treningen forskyves, roteres og
zoomes bildene litt tilfeldig (data augmentation), så modellen tåler ekte
kamerabilder bedre. Den ferdige modellen lagres til ml/digit-model.keras.

Bruk:
    python ml/train.py                  # tren og lagre
    python ml/train.py --plot           # vis læringskurven etterpå
    python ml/train.py --show-mistakes  # vis valideringsbildene modellen bommer på
    python ml/train.py --mnist 0        # tren uten MNIST, bare på egne bilder
"""

import argparse
import os
from pathlib import Path

import keras
import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf

ML_DIR = Path(__file__).parent
DATA_DIR = ML_DIR / "data"
MODEL_PATH = ML_DIR / "digit-model.keras"

# Delingen skjer per ark, så celler fra samme brett ikke havner i flere deler.
# Ark som er samme brett fotografert flere ganger (1/7, 2/4, 3/26, 5/6) holdes sammen.
# Ark 32 og 33 er brett der den gamle modellen leste håndskrevne 1-ere som 7
TEST_SHEETS = [3, 20, 24, 26, 32, 33]
VALIDATION_SHEETS = [5, 6, 21, 22]

# Antall håndskrevne MNIST-sifre som blandes inn i treningen (0 = bare egne bilder)
MNIST_COUNT = 10000

BATCH_SIZE = 32


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


def load_mnist(count, seed=0):
    """
    Henter et tilfeldig utvalg håndskrevne sifre 1–9 fra MNIST, i samme format
    som load_data(). processCells i appen lager bilder akkurat som MNIST
    (sifferet skalert til 20 px og sentrert i 28×28), så de kan blandes rett inn.
    """
    if count == 0:
        return np.empty((0, 28, 28, 1)), np.empty((0,), dtype=int)

    (images, labels), _ = keras.datasets.mnist.load_data()

    # Sudoku har ingen 0
    no_zero = labels != 0
    images, labels = images[no_zero], labels[no_zero]

    # Bare et utvalg, så MNIST ikke overdøver dine egne bilder
    chosen = np.random.default_rng(seed).choice(len(images), count, replace=False)
    images = images[chosen].reshape(-1, 28, 28, 1) / 255
    labels = labels[chosen] - 1
    return images, labels


def split_by_sheet(sheets):
    """Lager masker for trening, validering og test ut fra arknummeret."""
    test = np.isin(sheets, TEST_SHEETS)
    validation = np.isin(sheets, VALIDATION_SHEETS)
    training = ~test & ~validation
    return training, validation, test


def build_augmentation():
    """
    Små tilfeldige endringer av treningsbildene (data augmentation), så modellen
    tåler at sifrene ikke står helt likt i cella når bildet tas med kamera.
    Uten dette ble en 1 som var forskjøvet 2–3 piksler gjettet som 7 i 17 % av tilfellene.
    Brukes bare under treningen, og er ikke en del av modellen som eksporteres.
    """
    return keras.Sequential([
        keras.layers.RandomTranslation(0.1, 0.1, fill_mode="constant"),  # ±10 % (ca. 3 px)
        keras.layers.RandomRotation(8 / 360, fill_mode="constant"),  # ±8°
        keras.layers.RandomZoom((-0.1, 0.1), fill_mode="constant"),  # ±10 %
    ])


def augmented_dataset(images, labels):
    """Lager et datasett som stokkes og får nye tilfeldige endringer hver epoch."""
    augmentation = build_augmentation()
    return (
        tf.data.Dataset.from_tensor_slices((images.astype("float32"), labels))
        .shuffle(len(images))
        .batch(BATCH_SIZE)
        .map(
            lambda batch, batch_labels: (augmentation(batch, training=True), batch_labels),
            num_parallel_calls=tf.data.AUTOTUNE,
        )
        .prefetch(tf.data.AUTOTUNE)
    )


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
    parser.add_argument("--mnist", type=int, default=MNIST_COUNT, help=f"antall MNIST-bilder i treningen (standard {MNIST_COUNT})")
    args = parser.parse_args()

    images, labels, sheets, file_names = load_data()
    training, validation, test = split_by_sheet(sheets)
    print(f"Bilder: {len(images)}  trening: {training.sum()}  validering: {validation.sum()}  test: {test.sum()}")

    # MNIST legges bare til i treningen. Validering og test er bare egne brett,
    # siden det er de som viser om modellen virker i appen.
    mnist_images, mnist_labels = load_mnist(args.mnist)
    training_images = np.concatenate([images[training], mnist_images])
    training_labels = np.concatenate([labels[training], mnist_labels])
    print(f"Trener på {len(training_images)} bilder ({len(mnist_images)} fra MNIST)")

    model = build_model()
    model.summary()

    # Stopper når val_loss ikke har blitt bedre på 8 epochs, og går tilbake til den beste.
    # Litt mer tålmodighet enn uten augmentation, siden kurven blir mer ujevn
    early_stopping = keras.callbacks.EarlyStopping(
        monitor="val_loss", patience=8, restore_best_weights=True
    )
    history = model.fit(
        augmented_dataset(training_images, training_labels),
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
