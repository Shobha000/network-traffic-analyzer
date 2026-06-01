import mysql.connector
from config import DB_CONFIG
SCHEMA = """
CREATE DATABASE IF NOT EXISTS network_analyzer;
USE network_analyzer;

CREATE TABLE IF NOT EXISTS packets (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    src_ip      VARCHAR(45),
    dst_ip      VARCHAR(45),
    protocol    VARCHAR(10),
    size_bytes  INT,
    captured_at DATETIME,
    INDEX idx_protocol (protocol),
    INDEX idx_src_ip   (src_ip)
);

CREATE TABLE IF NOT EXISTS anomalies (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    src_ip      VARCHAR(45),
    protocol    VARCHAR(10),
    reason      VARCHAR(255),
    detected_at DATETIME
);
"""

def get_connection():
    return mysql.connector.connect(**DB_CONFIG)

def insert_packet(src, dst, proto, size, ts):
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "INSERT INTO packets "
        "(src_ip, dst_ip, protocol, size_bytes, captured_at) "
        "VALUES (%s, %s, %s, %s, %s)",
        (src, dst, proto, size, ts)
    )
    conn.commit()
    conn.close()

def get_protocol_summary():
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "SELECT protocol, COUNT(*) as cnt, SUM(size_bytes) as total_bytes "
        "FROM packets GROUP BY protocol ORDER BY cnt DESC"
    )
    rows = cur.fetchall()
    conn.close()
    return rows

def get_top_talkers(limit=10):
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "SELECT src_ip, COUNT(*) as cnt "
        "FROM packets GROUP BY src_ip "
        "ORDER BY cnt DESC LIMIT %s",
        (limit,)
    )
    rows = cur.fetchall()
    conn.close()
    return rows

def get_recent_anomalies(limit=5):
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "SELECT src_ip, protocol, reason, detected_at "
        "FROM anomalies ORDER BY detected_at DESC LIMIT %s",
        (limit,)
    )
    rows = cur.fetchall()
    conn.close()
    return rows


