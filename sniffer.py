from scapy.all import sniff, IP, TCP, UDP, ARP, ICMP
from database import insert_packet, get_connection
from datetime import datetime
import collections, threading, time

packet_counts = collections.defaultdict(int)
src_counts    = collections.defaultdict(int)
dst_tracking = collections.defaultdict(set)
ANOMALY_THRESHOLD = 10


def detect_anomaly(src, dst, proto, size):

    # ---------- High Traffic Detection ----------
    key = (src, proto)
    src_counts[key] += 1


    if src_counts[key] == ANOMALY_THRESHOLD:
        log_anomaly(
            src,
            proto,
            f"High traffic detected: {ANOMALY_THRESHOLD}+ packets"
        )

    # ---------- Port Scan Style Detection ----------
    dst_tracking[src].add(dst)

    if len(dst_tracking[src]) > 5:
        log_anomaly(
            src,
            proto,
            "Possible port scan behavior detected"
        )

    # ---------- Large Packet Detection ----------
    if size > 1500:
        log_anomaly(
            src,
            proto,
            f"Large packet detected: {size} bytes"
        )
def log_anomaly(src, proto, reason):
    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        "INSERT INTO anomalies (src_ip, protocol, reason, detected_at) "
        "VALUES (%s, %s, %s, %s)",
        (src, proto, reason, datetime.now())
    )
    conn.commit()
    conn.close()
    print(f"[ANOMALY] {src} ({proto}): {reason}")

def process_packet(pkt):
    ts   = datetime.now()
    size = len(pkt)

    if pkt.haslayer(ARP):
        src = pkt[ARP].psrc
        dst = pkt[ARP].pdst
        insert_packet(src, dst, "ARP", size, ts)
        packet_counts["ARP"] += 1
        detect_anomaly(src,dst, "ARP",size)

    elif pkt.haslayer(IP):
        src   = pkt[IP].src
        dst   = pkt[IP].dst
        proto = "TCP" if pkt.haslayer(TCP) else \
                "UDP" if pkt.haslayer(UDP) else \
                "ICMP" if pkt.haslayer(ICMP) else "IP"
        insert_packet(src, dst, proto, size, ts)
        packet_counts[proto] += 1
        detect_anomaly(src,dst,proto,size)

def stats_printer():
    while True:
        time.sleep(10)
        print("\n--- Packet counts (last interval) ---")
        for proto, count in sorted(packet_counts.items()):
            print(f"  {proto:<8} {count}")
        packet_counts.clear()

if __name__ == "__main__":
    print("[*] Starting packet capture. Press Ctrl+C to stop.")
    t = threading.Thread(target=stats_printer, daemon=True)
    t.start()
    sniff(prn=process_packet, store=False)

