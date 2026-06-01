from flask import Flask, jsonify
from flask_cors import CORS
from database import get_connection
import time, datetime


app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return jsonify({
        "message": "Network Analyzer API Running",
        "routes": [
            "/api/stats",
            "/api/protocols",
            "/api/talkers",
            "/api/anomalies",
            "/api/traffic-over-time",
            "/api/packet-sizes"
        ]
    })
START_TIME = time.time()

@app.route("/api/stats")
def stats():
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM packets")
    total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM anomalies")
    anomalies = cur.fetchone()[0]
    cur.execute("SELECT COUNT(DISTINCT reason) FROM anomalies")
    anom_types = cur.fetchone()[0]
    cur.execute("SELECT SUM(size_bytes) FROM packets")
    total_bytes = cur.fetchone()[0] or 0
    cur.execute(
        "SELECT COUNT(*) FROM packets "
        "WHERE captured_at >= NOW() - INTERVAL 1 SECOND"
    )
    pps = cur.fetchone()[0]
    cur.execute(
        "SELECT captured_at FROM packets "
        "ORDER BY captured_at DESC LIMIT 1"
    )
    row = cur.fetchone()
    last_capture = str(row[0]) if row else "N/A"
    conn.close()
    return jsonify({
        "total_packets":    total,
        "total_anomalies":  anomalies,
        "anomaly_types":    anom_types,
        "total_mb":         round(total_bytes / 1024 / 1024, 1),
        "packets_per_sec":  pps,
        "uptime_seconds":   int(time.time() - START_TIME),
        "sniffer_running":  True,
        "last_capture":     last_capture
    })

@app.route("/api/protocols")
def protocols():
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "SELECT protocol, COUNT(*) as cnt FROM packets "
        "GROUP BY protocol ORDER BY cnt DESC"
    )
    rows = cur.fetchall()
    conn.close()
    return jsonify([{"protocol": r[0], "count": r[1]} for r in rows])

@app.route("/api/talkers")
def talkers():
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "SELECT src_ip, COUNT(*) as cnt FROM packets "
        "GROUP BY src_ip ORDER BY cnt DESC LIMIT 8"
    )
    rows = cur.fetchall()
    conn.close()
    return jsonify([{"ip": r[0], "count": r[1]} for r in rows])

@app.route("/api/anomalies")
def anomalies():
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "SELECT src_ip, protocol, reason, detected_at "
        "FROM anomalies ORDER BY detected_at DESC LIMIT 30"
    )
    rows = cur.fetchall()
    conn.close()
    def severity(reason):
        if "High frequency" in reason: return "high"
        if "Scan"           in reason: return "medium"
        return "low"
    return jsonify([{
        "id":          i,
        "ip":          r[0],
        "protocol":    r[1],
        "reason":      r[2],
        "detected_at": str(r[3]),
        "severity":    severity(r[2])
    } for i, r in enumerate(rows)])

@app.route("/api/traffic-over-time")
def traffic_over_time():
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "SELECT DATE_FORMAT(captured_at,'%H:%i') as t, "
        "COUNT(*) as cnt, "
        "SUM(protocol='TCP') as tcp, "
        "SUM(protocol='UDP') as udp "
        "FROM packets "
        "WHERE captured_at >= NOW() - INTERVAL 1 HOUR "
        "GROUP BY t ORDER BY t ASC"
    )
    rows = cur.fetchall()
    conn.close()
    return jsonify([{
        "time": r[0], "count": r[1],
        "tcp": r[2] or 0, "udp": r[3] or 0
    } for r in rows])

@app.route("/api/packet-sizes")
def packet_sizes():
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute("""
        SELECT
          CASE
            WHEN size_bytes BETWEEN 0   AND 64   THEN '0-64'
            WHEN size_bytes BETWEEN 65  AND 128  THEN '65-128'
            WHEN size_bytes BETWEEN 129 AND 256  THEN '129-256'
            WHEN size_bytes BETWEEN 257 AND 512  THEN '257-512'
            WHEN size_bytes BETWEEN 513 AND 1024 THEN '513-1024'
            ELSE '1025-1500+'
          END as range_label,
          COUNT(*) as cnt
        FROM packets
        GROUP BY range_label
        ORDER BY MIN(size_bytes)
    """)
    rows = cur.fetchall()
    conn.close()
    return jsonify([{"range": r[0], "count": r[1]} for r in rows])

if __name__ == "__main__":
    app.run(port=5000, debug=True)
