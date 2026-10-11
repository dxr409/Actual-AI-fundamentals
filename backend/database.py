"""
SQLite database setup using Python's built-in sqlite3.
Stores students and progress; no heavy ORM needed for a local app.
"""
import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).parent / "qairu.db"

def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS students (
            id       TEXT PRIMARY KEY,
            email    TEXT UNIQUE NOT NULL,
            name     TEXT NOT NULL,
            password TEXT NOT NULL,
            role     TEXT NOT NULL DEFAULT 'student',
            created  TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS progress (
            student_id  TEXT NOT NULL,
            chapter_id  INTEGER NOT NULL,
            completed   INTEGER NOT NULL DEFAULT 0,
            updated     TEXT DEFAULT (datetime('now')),
            PRIMARY KEY (student_id, chapter_id)
        );

        CREATE TABLE IF NOT EXISTS knowledge_progress (
            student_id     TEXT NOT NULL,
            topic_id       TEXT NOT NULL,
            status         TEXT NOT NULL,
            mastery_score  INTEGER NOT NULL,
            brightness     REAL NOT NULL,
            updated        TEXT DEFAULT (datetime('now')),
            PRIMARY KEY (student_id, topic_id)
        );

        -- Seed a demo instructor account (password: demo1234)
        INSERT OR IGNORE INTO students (id, email, name, password, role)
        VALUES (
            'instructor-1',
            'instructor@qairu.kz',
            'Instructor',
            '$2b$12$placeholder_hashed_password',
            'instructor'
        );
    """)
    conn.commit()
    conn.close()

init_db()
