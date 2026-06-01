#!/bin/bash

PROJECT_DIR="/home/shobha/network-analyzer"
REPORT_DIR="$PROJECT_DIR/reports"

mkdir -p "$REPORT_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$REPORT_DIR/report_$TIMESTAMP.txt"

echo "=== Network Capture Report ===" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Protocol Summary:" >> "$REPORT_FILE"

mysql -u netuser -p'Netpass@123' network_analyzer -e "
SELECT protocol,
COUNT(*) as packets,
SUM(size_bytes) as bytes
FROM packets
WHERE captured_at >= NOW() - INTERVAL 5 MINUTE
GROUP BY protocol
ORDER BY packets DESC;
" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"

echo "Anomalies detected:" >> "$REPORT_FILE"

mysql -u netuser -p'Netpass@123' network_analyzer -e "
SELECT src_ip, protocol, reason, detected_at
FROM anomalies
WHERE detected_at >= NOW() - INTERVAL 5 MINUTE;
" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"

echo "Report saved: $REPORT_FILE"
