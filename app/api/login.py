from flask import Blueprint, request, jsonify
import sqlite3

log_in = Blueprint("log_in", __name__, url_prefix="/api")

@log_in.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("username")
    password = data.get("password")

    if not email or not password:
        return jsonify(success=False, message="필수 필드 누락")

    conn = sqlite3.connect("login.db")
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, division, role, first_name, last_name FROM users
        WHERE login_email = ? AND login_pw = ?
    """, (email, password))

    row = cursor.fetchone()
    conn.close()

    if row:
        return jsonify(
            success=True,
            user_id=row[0],
            division=row[1],
            role=row[2],
            first_name=row[3],
            last_name=row[4]
        )
    else:
        return jsonify(success=False, message="ログイン情報が正しくありません")