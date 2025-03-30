# translator-app/backend-flask/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:WillH1860@localhost/translator_app'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    preferred_input_lang = db.Column(db.String(10), default='eng_Latn')
    preferred_output_lang = db.Column(db.String(10), default='spa_Latn')
    translations = db.relationship('Translation', backref='user', lazy=True)

class Translation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Nullable for now (no auth yet)
    input_text = db.Column(db.String(500), nullable=False)
    translated_text = db.Column(db.String(500), nullable=False)
    source_lang = db.Column(db.String(10), nullable=False)
    target_lang = db.Column(db.String(10), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Create database tables before the server starts
with app.app_context():
    db.create_all()

# Hugging Face API setup for NLLB-200
API_URL = "https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M"
API_TOKEN = "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"  # Replace with your API key

headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

# Log the model being used
print(f"Using Hugging Face model: {API_URL.split('/models/')[1]}")

@app.route('/api/translate-text', methods=['POST'])
def translate_text():
    data = request.get_json()
    print("Received data:", data)
    text = data.get('text')
    source_lang = data.get('sourceLang', 'eng_Latn')
    target_lang = data.get('targetLang', 'spa_Latn')

    # Add context if the input is a single word (e.g., "hello" or "hi")
    if len(text.split()) == 1 and text.lower() in ['hello', 'hi']:
        text = f"{text}, how are you?"

    try:
        print(f"Sending request to Hugging Face API: {text} from {source_lang} to {target_lang}")
        payload = {
            "inputs": text,
            "parameters": {
                "src_lang": source_lang,
                "tgt_lang": target_lang
            },
            "options": {"wait_for_model": True}
        }
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        print("API response:", result)
        if isinstance(result, list) and len(result) > 0:
            translated_text = result[0].get('translation_text', '')
            # If we added context, extract just the greeting part
            if len(text.split()) == 1 and text.lower() in ['hello', 'hi']:
                translated_text = translated_text.split(',')[0]
            print("Translated text:", translated_text)

            # Save the translation to the database (user_id is null for now, until auth is added)
            translation = Translation(
                user_id=None,
                input_text=text,
                translated_text=translated_text,
                source_lang=source_lang,
                target_lang=target_lang
            )
            db.session.add(translation)
            db.session.commit()

            return jsonify({'translatedText': translated_text})
        else:
            return jsonify({'error': 'Unexpected response format from API'}), 500
    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': 'Text translation failed', 'details': str(e)}), 500    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)