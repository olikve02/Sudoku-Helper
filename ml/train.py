import matplotlib.pyplot as plt
import numpy as np
import keras
import tensorflow as tf
import os as os

image = []
labels = []
sheet = []

for label in range(1,10):
    content = os.listdir(f"./ml/data/{label}")   
    for imagePath in content:
        sheetNr = int(imagePath.split("-")[0].removeprefix("sheet"))
        sheet.append(sheetNr)
        labels.append(label)
        loadedImg = keras.utils.load_img(f"./ml/data/{label}/{imagePath}", color_mode="grayscale")
        image.append(keras.utils.img_to_array(loadedImg))


npImages = np.array(image)
labelsNp = np.array(labels)
sheetNp = np.array(sheet)

normalizedImages = npImages/255
labelsNp = labelsNp -1

print("Image shape: ", normalizedImages.shape)
print("Image min: ", normalizedImages.min())
print("Image max: ", normalizedImages.max())

print("Label shape: ", labelsNp.shape)

print("Sheet shape: ", sheetNp.shape)
print("Sheets: ", np.unique(sheetNp))



testMask = np.isin(sheetNp, [3, 20, 24, 26])
validationMask = np.isin(sheetNp, [5, 6, 21, 22])
trainingMask = (~testMask & ~validationMask)

testImages = normalizedImages[testMask]
validationImages = normalizedImages[validationMask]
trainingImages = normalizedImages[trainingMask]

testLabels = labelsNp[testMask]
validationLabels = labelsNp[validationMask]
trainingLabels = labelsNp[trainingMask]

print(f"Test images: {testImages.shape} validation Images: {validationImages.shape} training images: {trainingImages.shape}")

print(f"Test Labels: {testLabels.shape} validation Labels: {validationLabels.shape} training Labels: {trainingLabels.shape}")


model = keras.Sequential([
    keras.layers.Input(shape= (28,28,1)),
    keras.layers.Flatten(),
    keras.layers.Dense(128, "relu"),
    keras.layers.Dense(9, "softmax")
])

model.summary()