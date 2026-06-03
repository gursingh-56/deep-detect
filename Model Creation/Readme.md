# Model Creation

Notebooks for preprocessing a dataset, training the detection model, and running
predictions on unseen video.

**Note:** [Google Colab](https://colab.research.google.com/) is a convenient place to
run these if you don't have a local GPU.

## Datasets

Public datasets suitable for training:

- [FaceForensics++](https://github.com/ondyari/FaceForensics)
- [Celeb-DF](https://github.com/yuezunli/celeb-deepfakeforensics)
- [Deepfake Detection Challenge](https://www.kaggle.com/c/deepfake-detection-challenge/data)

## Preprocessing

- Load the dataset
- Split each video into frames
- Crop the face from each frame
- Save the face-cropped video

## Model and training

- Load the preprocessed videos and labels from a CSV file
- Build a PyTorch model using transfer learning with ResNeXt50 + LSTM
- Split into train and test sets
- Train, then evaluate
- Save the trained weights as a `.pt` file

Label data for preprocessed video lives in `labels/Gobal_metadata.csv`.

## Predict

- Load the saved PyTorch model
- Predict using the trained weights

## Helpers

`Helpers/` contains utilities for common dataset chores:

- Converting a JSON label file to CSV
- Copying files between directories
- Removing audio-altered files from the Deepfake Detection Challenge dataset
