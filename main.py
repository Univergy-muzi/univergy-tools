from flask import Flask, send_from_directory, request, send_file, jsonify, abort
from app import func_list
import os, sqlite3

app = Flask(__name__, static_folder='static')

DB_FILE = "schedule.db"
func_list.init_db(DB_FILE)

@app.route("/")
def homepage():
    return open("index.html", encoding="utf-8").read()


@app.route("/static/<path:filename>")
def serve_static(filename):
    return send_from_directory("static", filename)


@app.route('/kakutei', methods=['POST'])
def kakutei():
    from def_kakutei import analyze_kakutei_xml
    files = request.files.getlist('files')
    xml_file_list = []
    analyze_file_list = []

    for file in files:
        filename = file.filename
        if filename.lower().endswith('.xml'):
            xml_file_list.append(filename)
            analyze_file_list.append(file)
            # 파일 저장하려면 여기에 추가 가능:
            # file.save(os.path.join('uploads', filename))

    excel_stream = analyze_kakutei_xml(analyze_file_list)

    return send_file(
        excel_stream,
        as_attachment=True,
        download_name="analyze_data.xlsx",
        mimetype=
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


@app.route("/run-csv-tool")
def run_csv_tool():
    # 여기 나중에 CSV 처리 코드 추가
    return "✅ TESTを処理しました！"

@app.route("/ping")
def ping():
    return "pong", 200

@app.route("/api/events", methods=["GET", "POST", "DELETE"])
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

# 서버에서 JSON 다운로드
@app.route("/api/events/download")
def download_events():
    func_list.export_events_to_json(DB_FILE)
    path = "data/events.json"
    if not os.path.exists(path):
        abort(404, description="JSONファイルが見つかりませんでした。")

    # 파일을 읽어서 메모리에 올림
    from io import BytesIO
    with open(path, "rb") as f:
        data = BytesIO(f.read())

    os.remove(path)  # ✅ 다운로드 직후 파일 삭제

    return send_file(
        data,
        as_attachment=True,
        download_name="calendar_events_backup.json",
        mimetype="application/json"
    )

# 서버로 JSON 업로드
@app.route("/api/events/upload", methods=["POST"])
def upload_events():
    file = request.files["file"]
    if file and file.filename.endswith(".json"):
        file_path = "data/events.json"
        os.makedirs("data", exist_ok=True)
        file.save(file_path)

        try:
            func_list.import_events_from_json(DB_FILE, file_path)
            os.remove(file_path)  # ✅ 업로드 처리 후 파일 삭제
            return jsonify({"status": "success"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "invalid file"}), 400

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port)
