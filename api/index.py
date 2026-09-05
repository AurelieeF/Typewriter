from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import psycopg

app = Flask(__name__)
CORS(app)
DATABASE_URL = os.environ.get("DATABASE_URL")


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

@app.route("/api/db-test", methods=["GET"])
def db_test():

    with psycopg.connect(DATABASE_URL) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()

    return jsonify({
        "message": "Database connected!",
        "result": result[0]
    })

#test temporaire
@app.route("/api/create-table", methods=["GET"])
def create_table():

    with psycopg.connect(DATABASE_URL) as connection:
        with connection.cursor() as cursor:

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS notes (
                    id SERIAL PRIMARY KEY,
                    text TEXT NOT NULL,
                    character_count INTEGER NOT NULL,
                    note_date DATE NOT NULL,
                    started_at TIMESTAMPTZ NOT NULL,
                    finished_at TIMESTAMPTZ NOT NULL,
                    duration_minutes INTEGER NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                )
            """)

        connection.commit()

    return jsonify({
        "message": "Notes table created!"
    })