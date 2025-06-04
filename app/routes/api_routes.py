from flask import Blueprint, jsonify, request, abort, send_file
from app.services.database import init_db, export_events_to_json, import_events_from_json
import sqlite3, os
from io import BytesIO

api = Blueprint("api", __name__)
DB_FILE = "schedule.db"
init_db(DB_FILE)

@api.route("/ping")
def ping():
    return "pong", 200

@api.route("/api/events", methods=["GET", "POST", "DELETE"])
def handle_events():
    if request.method == "GET":
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.execute("SELECT id, title, description, start, end, allDay FROM events")
            events = [{
                "id": row[0],
                "title": row[1],
                "description": row[2],
                "start": row[3],
                "end": row[4],
                "allDay": bool(row[5])  # 1이면 True, 0이면 False
            } for row in cursor]
        return jsonify(events)

    if request.method == "POST":
        data = request.get_json()
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.execute(
                "INSERT INTO events (title, description, start, end, allDay) VALUES (?, ?, ?, ?, ?)",
                (data["title"], data.get("description", ""), data["start"], data.get("end"), int(data.get("allDay", False)))
            )
            event_id = cursor.lastrowid
        return jsonify({"status": "created", "id": event_id}), 201

    if request.method == "DELETE":
        data = request.get_json()
        event_id = data.get("id")
        if not event_id:
            return jsonify({"error": "Missing event ID"}), 400
        with sqlite3.connect(DB_FILE) as conn:
            conn.execute("DELETE FROM events WHERE id = ?", (event_id,))
        return jsonify({"status": "deleted"}), 200
    ...

@api.route("/api/events/download")
def download_events():
    export_events_to_json(DB_FILE)
    path = "data/events.json"
    if not os.path.exists(path):
        abort(404, description="JSONファイルが見つかりませんでした。")
    with open(path, "rb") as f:
        data = BytesIO(f.read())
    os.remove(path)
    return send_file(data, as_attachment=True, download_name="calendar_events_backup.json", mimetype="application/json")

@api.route("/api/events/upload", methods=["POST"])
def upload_events():
    file = request.files["file"]
    if file and file.filename.endswith(".json"):
        file_path = "data/events.json"
        os.makedirs("data", exist_ok=True)
        file.save(file_path)

        try:
            import_events_from_json(DB_FILE, file_path)
            os.remove(file_path)  # ✅ 업로드 처리 후 파일 삭제
            return jsonify({"status": "success"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "invalid file"}), 400
