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

@app.route("/api/notes", methods=["GET"])
def get_notes():

    with psycopg.connect(DATABASE_URL) as connection:
        with connection.cursor() as cursor:

            cursor.execute("""
                SELECT
                    id,
                    text,
                    character_count,
                    note_date,
                    started_at,
                    finished_at,
                    duration_minutes,
                    created_at
                FROM notes
                ORDER BY created_at DESC
            """)

            rows = cursor.fetchall()

    notes = []

    for row in rows:
        notes.append({
            "id": row[0],
            "text": row[1],
            "characterCount": row[2],
            "date": row[3].isoformat(),
            "startedAt": row[4].isoformat(),
            "finishedAt": row[5].isoformat(),
            "durationMinutes": row[6],
            "createdAt": row[7].isoformat()
        })

    return jsonify({
        "notes": notes
    })
@app.route("/api/notes", methods=["POST"])
def save_note():

    note = request.get_json()

    with psycopg.connect(DATABASE_URL) as connection:
        with connection.cursor() as cursor:

            cursor.execute("""
                INSERT INTO notes (
                    text,
                    character_count,
                    note_date,
                    started_at,
                    finished_at,
                    duration_minutes
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                note["text"],
                note["characterCount"],
                note["date"],
                note["startedAt"],
                note["finishedAt"],
                note["durationMinutes"]
            ))

            note_id = cursor.fetchone()[0]

        connection.commit()

    return jsonify({
        "message": "Note saved!",
        "id": note_id
    })