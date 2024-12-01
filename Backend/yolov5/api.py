from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename
import uuid
from pathlib import Path
from detect import run

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'runs/detect'
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'mp4'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULTS_FOLDER'] = RESULTS_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/detect', methods=['POST'])
def detect():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)

    try:
        results_path = os.path.join(app.config['RESULTS_FOLDER'], 'exp')
        run(
            weights='yolov5s.pt',
            source=file_path,
            project=app.config['RESULTS_FOLDER'],
            name='exp',
            exist_ok=True,
        )
        return jsonify({"message": "Detection completed", "results": results_path}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
    return jsonify({"message": "YOLOv5 API is running. Use the /detect endpoint."})

if __name__ == "__main__":
    app.run(debug=True)