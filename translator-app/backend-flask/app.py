from flask import Flask, request, jsonify, send_file, session
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import requests
from datetime import datetime, timedelta
import os
import tempfile
import uuid
from pydub import AudioSegment
import whisper
from gtts import gTTS  # Google Text-to-Speech


app = Flask(__name__)

# Configure secret key
app.config['SECRET_KEY'] = '186020041199'  

# Configure CORS properly
CORS(app, origins=["http://localhost:5173"], 
     supports_credentials=True, 
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:WillH1860@localhost/translator_app'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

TEMP_DIR = tempfile.gettempdir()

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
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    input_text = db.Column(db.String(500), nullable=False)
    translated_text = db.Column(db.String(500), nullable=False)
    source_lang = db.Column(db.String(10), nullable=False)
    target_lang = db.Column(db.String(10), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_audio = db.Column(db.Boolean, default=False)

with app.app_context():
    db.create_all()

# Translation API URL for NLLB text translation
API_URL = "https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M"
API_TOKEN = "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"
headers = {"Authorization": f"Bearer {API_TOKEN}", "Content-Type": "application/json"}

# Language code mappings
LANG_CODE_MAP = {
    'eng_Latn': 'en', 'spa_Latn': 'es', 'fra_Latn': 'fr', 'deu_Latn': 'de',
    'ita_Latn': 'it', 'por_Latn': 'pt', 'zho_Hans': 'zh-CN', 'jpn_Jpan': 'ja',
    'rus_Cyrl': 'ru', 'ara_Arab': 'ar', 'hin_Deva': 'hi', 'auto': 'auto'
}

# Reverse language code mapping for TTS
REVERSE_LANG_CODE_MAP = {
    'en': 'eng_Latn', 'es': 'spa_Latn', 'fr': 'fra_Latn', 'de': 'deu_Latn',
    'it': 'ita_Latn', 'pt': 'por_Latn', 'zh-CN': 'zho_Hans', 'ja': 'jpn_Jpan',
    'ru': 'rus_Cyrl', 'ar': 'ara_Arab', 'hi': 'hin_Deva'
}

# Mapping Whisper language codes to NLLB language codes
WHISPER_TO_NLLB = {
    'en': 'eng_Latn', 'es': 'spa_Latn', 'fr': 'fra_Latn', 'de': 'deu_Latn',
    'it': 'ita_Latn', 'pt': 'por_Latn', 'zh': 'zho_Hans', 'ja': 'jpn_Jpan',
    'ru': 'rus_Cyrl', 'ar': 'ara_Arab', 'hi': 'hin_Deva'
}

# Initialize Whisper model - choose the appropriate size based on your requirements
# Options: "tiny", "base", "small", "medium", "large"
whisper_model = None

def load_whisper_model():
    global whisper_model
    if whisper_model is None:
        whisper_model = whisper.load_model("medium")
    return whisper_model

# Simple test route
@app.route('/api/test', methods=['GET'])
def test_connection():
    return jsonify({'status': 'success', 'message': 'Connection to backend established'}), 200

@app.route('/api/audio-to-audio', methods=['POST'])
def audio_to_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    audio_file = request.files['audio']
    source_lang = request.form.get('sourceLang', 'eng_Latn')
    target_lang = request.form.get('targetLang', 'spa_Latn')
    
    if audio_file.filename == '':
        return jsonify({'error': 'No audio file selected'}), 400
    
    try:
        # Save the uploaded audio file
        input_filename = os.path.join(TEMP_DIR, f"{uuid.uuid4()}.wav")
        audio_file.save(input_filename)
        
        # Load the Whisper model
        model = load_whisper_model()
        
        # Step 1: Speech-to-Text using Whisper
        print("Transcribing audio with Whisper...")
        
        # Determine language for Whisper
        whisper_lang = None
        if source_lang != 'auto' and source_lang in WHISPER_TO_NLLB.values():
            # Find the Whisper language code from NLLB code
            whisper_lang = next((k for k, v in WHISPER_TO_NLLB.items() if v == source_lang), None)
        
        # Transcribe the audio
        transcription_options = {}
        if whisper_lang:
            transcription_options["language"] = whisper_lang
        
        # If source is "auto", we'll use Whisper's auto-detection
        result = model.transcribe(input_filename, **transcription_options)
        
        # Get the transcribed text and detected language
        transcribed_text = result["text"]
        detected_language = result.get("language", "en")
        detected_nllb_lang = WHISPER_TO_NLLB.get(detected_language, 'eng_Latn')
        
        print(f"Transcribed text: {transcribed_text}")
        print(f"Detected language: {detected_language} (NLLB: {detected_nllb_lang})")
        
        # If auto-detection was requested, use the detected language
        if source_lang == 'auto':
            source_lang = detected_nllb_lang
        
        # Step 2: Translate the transcribed text using NLLB
        print(f"Translating text from {source_lang} to {target_lang}...")
        
        payload = {
            "inputs": transcribed_text,
            "parameters": {"src_lang": source_lang, "tgt_lang": target_lang},
            "options": {"wait_for_model": True}
        }
        
        translation_response = requests.post(API_URL, headers=headers, json=payload)
        translation_response.raise_for_status()
        
        translation_result = translation_response.json()
        if isinstance(translation_result, list) and len(translation_result) > 0:
            translated_text = translation_result[0].get('translation_text', '')
        else:
            raise Exception("Unexpected response format from translation API")
        
        print(f"Translated text: {translated_text}")
        
        # Step 3: Text-to-Speech
        print("Converting translated text to speech...")
        
        # Convert NLLB language code to TTS language code
        tts_lang = LANG_CODE_MAP.get(target_lang, 'en')
        
        # Generate speech from translated text
        tts_output_filename = os.path.join(TEMP_DIR, f"{uuid.uuid4()}.mp3")
        
        # Use gTTS for text-to-speech
        tts = gTTS(text=translated_text, lang=tts_lang, slow=False)
        tts.save(tts_output_filename)
        
        print(f"TTS output saved to {tts_output_filename}")
        
        # Check if the file is valid
        file_size = os.path.getsize(tts_output_filename)
        print(f"TTS file size: {file_size} bytes")
        
        if file_size == 0:
            raise Exception("Generated audio file is empty")
        
        # Create an audio ID and store the file path
        audio_id = str(uuid.uuid4())
        app.config[f"AUDIO_{audio_id}"] = tts_output_filename
        
        # Store the translation in the database
        translation = Translation(
            user_id=None, 
            input_text=transcribed_text, 
            translated_text=translated_text, 
            source_lang=source_lang, 
            target_lang=target_lang, 
            is_audio=True
        )
        db.session.add(translation)
        db.session.commit()
        
        # Clean up the input file
        os.remove(input_filename)
        
        return jsonify({
            'translatedText': translated_text,
            'originalText': transcribed_text,
            'audioUrl': f"/api/audio/{audio_id}",
            'detectedLang': detected_nllb_lang,
            'status': 'success'
        })
        
    except Exception as e:
        print(f"Error in audio-to-audio: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Audio translation failed', 'details': str(e)}), 500

@app.route('/api/audio/<audio_id>', methods=['GET'])
def get_audio(audio_id):
    audio_path = app.config.get(f"AUDIO_{audio_id}")
    if not audio_path or not os.path.exists(audio_path):
        return jsonify({'error': 'Audio file not found'}), 404
    
    mime_type = 'audio/mpeg' if audio_path.endswith('.mp3') else 'audio/wav'
    print(f"Serving audio: {audio_path}, MIME: {mime_type}")
    
    try:
        response = send_file(audio_path, mimetype=mime_type, as_attachment=False)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    except Exception as e:
        print(f"Error serving audio: {str(e)}")
        return jsonify({'error': 'Failed to serve audio', 'details': str(e)}), 500

@app.route('/api/cleanup', methods=['POST'])
def cleanup_audio_files():
    audio_keys = [k for k in app.config.keys() if k.startswith('AUDIO_')]
    count = 0
    for key in audio_keys:
        file_path = app.config.get(key)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                count += 1
            except Exception as e:
                print(f"Failed to remove {file_path}: {e}")
        del app.config[key]
    return jsonify({'message': f'Cleaned up {count} audio files'})

@app.route('/api/login', methods=['POST'])
def login():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'success'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400
            
        email = data.get('email')
        password = data.get('password')
        
        # Validate input
        if not email or not password:
            return jsonify({'error': 'Missing email or password'}), 400
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        # Check if user exists and password is correct
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate token
        token = jwt.encode({
            'user_id': user.id,
            'username': user.username,
            'exp': datetime.utcnow() + timedelta(days=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@app.route('/api/user', methods=['GET'])
def get_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Token is missing'}), 401
    
    try:
        # Extract token (remove 'Bearer ' prefix if present)
        token = auth_header.split(' ')[1] if len(auth_header.split(' ')) > 1 else auth_header
        
        # Decode token
        data = jwt.decode(token, app.config.get('SECRET_KEY', 'your-secret-key'), algorithms=['HS256'])
        user = User.query.filter_by(id=data['user_id']).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'preferred_input_lang': user.preferred_input_lang,
            'preferred_output_lang': user.preferred_output_lang
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

# Add a token required decorator for protected routes
def token_required(f):
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            # Extract token (remove 'Bearer ' prefix if present)
            token = auth_header.split(' ')[1] if len(auth_header.split(' ')) > 1 else auth_header
            
            # Decode token
            data = jwt.decode(token, app.config.get('SECRET_KEY'), algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    
    decorated.__name__ = f.__name__
    return decorated

# Example of a protected route
@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email,
        'preferred_input_lang': current_user.preferred_input_lang,
        'preferred_output_lang': current_user.preferred_output_lang
    })

@app.route('/api/translations', methods=['GET'])
@token_required
def get_user_translations(current_user):
    try:
        # Get user translations from database
        translations = Translation.query.filter_by(user_id=current_user.id).order_by(Translation.timestamp.desc()).all()
        
        # Convert to JSON serializable format
        translations_list = []
        for translation in translations:
            translations_list.append({
                'id': translation.id,
                'input_text': translation.input_text,
                'translated_text': translation.translated_text,
                'source_lang': translation.source_lang,
                'target_lang': translation.target_lang,
                'timestamp': translation.timestamp.isoformat(),
                'is_audio': translation.is_audio
            })
        
        return jsonify(translations_list), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch translations', 'details': str(e)}), 500

@app.route('/api/translate-text', methods=['POST'])
def translate_text():
    data = request.get_json()
    text = data.get('text')
    source_lang = data.get('sourceLang', 'eng_Latn')
    target_lang = data.get('targetLang', 'spa_Latn')
    
    # Get user_id from token if available
    user_id = None
    auth_header = request.headers.get('Authorization')
    if auth_header:
        try:
            token = auth_header.split(' ')[1] if len(auth_header.split(' ')) > 1 else auth_header
            data = jwt.decode(token, app.config.get('SECRET_KEY', 'your-secret-key'), algorithms=['HS256'])
            user_id = data.get('user_id')
        except:
            # If token is invalid, continue without user_id
            pass

    if len(text.split()) == 1 and text.lower() in ['hello', 'hi']:
        text = f"{text}, how are you?"

    try:
        payload = {
            "inputs": text,
            "parameters": {"src_lang": source_lang, "tgt_lang": target_lang},
            "options": {"wait_for_model": True}
        }
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        if isinstance(result, list) and len(result) > 0:
            translated_text = result[0].get('translation_text', '')
            if len(text.split()) == 1 and text.lower() in ['hello', 'hi']:
                translated_text = translated_text.split(',')[0]
            
            # Save with user_id if available
            translation = Translation(
                user_id=user_id,
                input_text=text,
                translated_text=translated_text,
                source_lang=source_lang,
                target_lang=target_lang
            )
            db.session.add(translation)
            db.session.commit()
            
            return jsonify({'translatedText': translated_text})
        return jsonify({'error': 'Unexpected response format from API'}), 500
    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': 'Text translation failed', 'details': str(e)}), 500

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'success'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        #response.headers.add('Access-Control-Allow-Credentials', 'true')  # Add this line
        return response
        
    try:
        # Get request data and print for debugging
        data = request.get_json()
        if not data:
            return jsonify({'error':'No Json data recieved'}), 400
        
        print('Registration request data',data)

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        # Validate input
        if not username or not email or not password:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create new user
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(
            username=username,
            email=email,
            password_hash=hashed_password
        )
        
        # Add and commit with error handling
        try:
            db.session.add(new_user)
            db.session.commit()
        except Exception as db_error:
            db.session.rollback()
            print(f"Database error: {str(db_error)}")
            return jsonify({'error': 'Database error', 'details': str(db_error)}), 500
        
        return jsonify({'message': 'User registered successfully'}), 201
        
        # Add CORS headers to response
        #response = jsonify({'message': 'User registered successfully'})
        #response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        #response.headers.add('Access-Control-Allow-Credentials', 'true')  # Add this line
        #return response, 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")
        # Add CORS headers even to error responses
        #response = jsonify({'error': 'Registration failed', 'details': str(e)})
        #response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        #response.headers.add('Access-Control-Allow-Credentials', 'true')  # Add this line
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)