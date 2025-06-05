import sqlite3
from datetime import datetime

def init_login_db():
    conn = sqlite3.connect("login.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            login_email TEXT UNIQUE NOT NULL,
            login_pw TEXT NOT NULL,
            division TEXT,
            role TEXT,
            first_name TEXT,
            last_name TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 최초 샘플 계정 추가 (없을 경우에만)
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO users (login_email, login_pw, division, role, first_name, last_name)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ("j.lee@univergy.com", "!l@v2jw92!@", "企画課", "admin", "俊完", "李"))
        cursor.execute("""
            INSERT INTO users (login_email, login_pw, division, role, first_name, last_name)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ("masada@univergy.com", "kikakumasada", "企画課", "user", "隆彦", "政田"))
        cursor.execute("""
            INSERT INTO users (login_email, login_pw, division, role, first_name, last_name)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ("yasui@univergy.com", "kikakuyasui", "企画課", "user", "由之", "安井"))

    conn.commit()
    conn.close()
