import sys
import os
from pathlib import Path
import torch
import requests
import cv2
import time
import numpy as np

# Add YOLOv5 to path
FILE = Path(__file__).resolve()
ROOT = FILE.parents[0] / 'yolov5'
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

from models.common import DetectMultiBackend
from utils.general import check_img_size, non_max_suppression, scale_boxes
from utils.plots import Annotator
from utils.torch_utils import select_device
from utils.augmentations import letterbox

def load_model():
    # Load YOLOv5 model
    weights = ROOT / 'yolov5s.pt'
    device = select_device('')
    model = DetectMultiBackend(weights, device=device)
    stride, names = model.stride, model.names
    return model, stride, names

def process_frame(frame, model, stride, names):
    # Preprocess frame
    im = letterbox(frame, 640, stride=stride)[0]
    im = im.transpose((2, 0, 1))[::-1]  # HWC to CHW, BGR to RGB
    im = np.ascontiguousarray(im)  # ensure contiguous memory
    im = torch.from_numpy(im).float()
    im /= 255  # 0 - 255 to 0.0 - 1.0
    if len(im.shape) == 3:
        im = im[None]  # expand for batch dim

    # Inference
    pred = model(im)
    pred = non_max_suppression(pred, conf_thres=0.25, iou_thres=0.45, classes=[0])  # person class only

    # Process predictions
    person_count = 0
    for det in pred[0]:
        if det[5] == 0:  # class 0 is person
            person_count += 1

    return person_count

def main():
    # Initialize model
    model, stride, names = load_model()
    
    # Initialize webcam
    cap = cv2.VideoCapture(0)
    
    last_notification_time = 0
    notification_cooldown = 1  # seconds between notifications
    
    print("Starting webcam detection...")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error reading from webcam")
            break

        # Process frame
        person_count = process_frame(frame, model, stride, names)
        
        # Send notification if exactly 2 people detected
        current_time = time.time()
        if person_count == 2 and (current_time - last_notification_time) >= notification_cooldown:
            try:
                response = requests.post('http://localhost:3000/detection', 
                                      json={'personCount': person_count})
                if response.status_code == 200:
                    print(f"Notification sent: {person_count} people detected (Server responded OK)")
                    last_notification_time = current_time
            except requests.exceptions.RequestException as e:
                print(f"Error sending notification: {e}")

        # Display frame with person count
        cv2.putText(frame, f"People: {person_count}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.imshow('Webcam Detection', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main() 