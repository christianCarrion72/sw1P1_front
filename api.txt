import os
from dotenv import load_dotenv
from flask_cors import CORS
from flask import Flask, request, jsonify
from langchain_core.messages import AIMessage, HumanMessage
from src.helpers.qa_chain import qa_chain
from src.helpers.web_qa_prompt import web_qa_chain, analyze_image_web
from src.helpers.angular_web_prompt import angular_web_chain, analyze_image_angular, generate_angular_components
import base64
import requests

app = Flask(__name__)
CORS(app)
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

qa_chain = qa_chain()
web_chain = web_qa_chain()
angular_chain = angular_web_chain()

@app.route('/query', methods=['POST'])
def query():
    data = request.get_json()
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "No se proporcionó una pregunta"}), 400
    response = qa_chain.invoke({
        "question": question
    })
    
    return jsonify({"response": response})

@app.route('/web-query', methods=['POST'])
def web_query():
    data = request.get_json()
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "No se proporcionó una pregunta"}), 400
    try:
        response = web_chain.invoke({
            "question": question
        })
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({"error": "No se envió ninguna imagen"}), 400
    image = request.files['image']
    prompt = request.form.get("prompt", "Describe la imagen")
    img_bytes = image.read()
    img_base64 = base64.b64encode(img_bytes).decode("utf-8")

    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{img_base64}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 500
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        print(response.json())  # <-- Agrega esto para depurar
        result = response.json()["choices"][0]["message"]["content"]
        return jsonify({"response": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analyze-image-web', methods=['POST'])
def analyze_image_web_endpoint():
    if 'image' not in request.files:
        return jsonify({"error": "No se envió ninguna imagen"}), 400
    image = request.files['image']
    prompt = request.form.get("prompt", "Describe la imagen para una interfaz web en Angular")
    try:
        # Guardar la imagen temporalmente
        temp_path = "temp_image_web.jpg"
        image.save(temp_path)
        result = analyze_image_web(temp_path, prompt)
        os.remove(temp_path)
        return jsonify({"response": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/angular-query', methods=['POST'])
def angular_query():
    data = request.get_json()
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "No se proporcionó una pregunta"}), 400
    try:
        response = angular_chain.invoke({
            "question": question,
            "id": "angular_id",
            "roomCode": "angular_room"
        })
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate-angular', methods=['POST'])
def generate_angular():
    data = request.get_json()
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"error": "No se proporcionó un prompt"}), 400
    try:
        result = generate_angular_components(prompt)
        return jsonify({"response": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analyze-image-angular', methods=['POST'])
def analyze_image_angular_endpoint():
    if 'image' not in request.files:
        return jsonify({"error": "No se envió ninguna imagen"}), 400
    image = request.files['image']
    prompt = request.form.get("prompt", "Describe la imagen para una interfaz web en Angular")
    try:
        # Guardar la imagen temporalmente
        temp_path = "temp_image_angular.jpg"
        image.save(temp_path)
        result = analyze_image_angular(temp_path, prompt)
        os.remove(temp_path)
        return jsonify({"response": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500