import matplotlib.pyplot as plt
import numpy as np
import keras
import tensorflow as tf
import os as os

image = []
labels = []
sheet = []
filePath = []

for label in range(1,10):
    content = os.listdir(f"./ml/data/{label}")   
    for imagePath in content:
        sheetNr = int(imagePath.split("-")[0].removeprefix("sheet"))
        sheet.append(sheetNr)
        labels.append(label)
        loadedImg = keras.utils.load_img(f"./ml/data/{label}/{imagePath}", color_mode="grayscale")
        image.append(keras.utils.img_to_array(loadedImg))
        filePath.append(imagePath)


npImages = np.array(image)
labelsNp = np.array(labels)
sheetNp = np.array(sheet)
filePathNp = np.array(filePath)

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

validationPaths = filePathNp[validationMask]

print(f"Test images: {testImages.shape} validation Images: {validationImages.shape} training images: {trainingImages.shape}")

print(f"Test Labels: {testLabels.shape} validation Labels: {validationLabels.shape} training Labels: {trainingLabels.shape}")


model = keras.Sequential([
    keras.layers.Input(shape= (28,28,1)),


    keras.layers.Conv2D(32, (3,3), activation = "relu"),
    keras.layers.MaxPooling2D((2, 2)),

    keras.layers.Conv2D(64, (3,3), activation = "relu"),
    keras.layers.MaxPooling2D((2, 2)),

    keras.layers.Flatten(),
    keras.layers.Dense(64, activation = "relu"),
    keras.layers.Dropout(0.3),
    keras.layers.Dense(9, activation = "softmax")

])

model.summary()


model.compile(
    optimizer= "adam",
    loss= "sparse_categorical_crossentropy",
    metrics= ["accuracy"]
)

earlyStopping = keras.callbacks.EarlyStopping(monitor= "val_loss", patience= 5, restore_best_weights= True)

history = model.fit(
    trainingImages,
    trainingLabels,
    epochs= 100,
    validation_data= (validationImages, validationLabels),
    callbacks= [earlyStopping]
)

print(model.evaluate(testImages, testLabels))

model.save("ml/digit-model.keras")

#accuracyHistory = history.history["accuracy"]
#validationAccuracyHistory = history.history["val_accuracy"]
#plt.plot(accuracyHistory)

#plt.plot(validationAccuracyHistory)
#plt.legend("training", "validation")
#plt.show()

#probabilities = model.predict(validationImages)
#predictions = np.argmax(probabilities, axis= 1)

#faliureMask = predictions != validationLabels

#wrongPredictions = predictions[faliureMask]
#actualLabel = validationLabels[faliureMask]
#wrongPredictedImg = validationImages[faliureMask]
#filePaths = validationPaths[faliureMask]


#for i in range(0, len(wrongPredictions)):
  #  plt.imshow(wrongPredictedImg[i], cmap= "gray")
   # plt.title(f"Prediction: {wrongPredictions[i]+1} Actual: {actualLabel[i]+1} \n filePath: {filePaths[i] }")    
    #plt.show()



