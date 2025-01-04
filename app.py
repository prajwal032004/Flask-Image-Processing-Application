import os
from flask import Flask, render_template, request, redirect, url_for, jsonify
from werkzeug.utils import secure_filename
from PIL import Image, ImageEnhance, ImageFilter

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return redirect(url_for('edit', filename=filename))
    return render_template('index.html')

@app.route('/edit/<filename>')
def edit(filename):
    return render_template('edit.html', filename=filename)

@app.route('/apply_filter', methods=['POST'])
def apply_filter():
    data = request.json
    filename = data['filename']
    filter_type = data['filter']
    
    img_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    img = Image.open(img_path)

    if filter_type == 'grayscale':
        img = img.convert('L')
    elif filter_type == 'sepia':
        img = img.convert('RGB')
        data = img.getdata()
        new_data = []
        for item in data:
            r, g, b = item
            tr = int(0.393 * r + 0.769 * g + 0.189 * b)
            tg = int(0.349 * r + 0.686 * g + 0.168 * b)
            tb = int(0.272 * r + 0.534 * g + 0.131 * b)
            new_data.append((tr, tg, tb))
        img.putdata(new_data)
    elif filter_type == 'blur':
        img = img.filter(ImageFilter.BLUR)
    elif filter_type == 'sharpen':
        img = img.filter(ImageFilter.SHARPEN)
    elif filter_type == 'enhance':
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.5)

    new_filename = f"{filter_type}_{filename}"
    new_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
    img.save(new_path)

    return jsonify({'success': True, 'new_filename': new_filename})

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)

