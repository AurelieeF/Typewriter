from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/api/test", methods=["GET"])
def test():
    return jsonify({
        "message": "The backend is workingggg!"
    })

@app.route("/api/notes", methods=["POST"])
def save_note():

    note = request.get_json()

    print(note)

    return jsonify({
        "message": "Note received!",
        "note": note
    })

