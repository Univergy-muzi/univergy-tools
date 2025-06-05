def init_db(DB_FILE):
    import sqlite3
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                description TEXT,
                start TEXT,
                end TEXT,
                allDay INTEGER,
                created_by TEXT,        -- ← full name
                created_division TEXT   -- ← division
            )
        """)

def export_events_to_json(DB_FILE, path="data/events.json"):
    import json, sqlite3, os
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.execute("""
            SELECT id, title, description, start, end, allDay, created_by, created_division 
            FROM events
        """)
        events = [ {
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "start": row[3],
            "end": row[4],
            "allDay": bool(row[5]),
            "created_by": row[6],
            "created_division": row[7]
        } for row in cursor ]

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)

def import_events_from_json(db_file, json_path="data/events.json"):
    import json, sqlite3
    with open(json_path, encoding="utf-8") as f:
        events = json.load(f)

    with sqlite3.connect(db_file) as conn:
        conn.execute("DELETE FROM events")
        for ev in events:
            conn.execute("""
                INSERT INTO events 
                (title, description, start, end, allDay, created_by, created_division)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                ev["title"],
                ev.get("description", ""),
                ev["start"],
                ev.get("end"),
                int(ev.get("allDay", False)),
                ev.get("created_by", ""),
                ev.get("created_division", "")
            ))