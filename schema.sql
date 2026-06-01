cat > ~/network-analyzer/schema.sql << 'EOF'
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
    INDEX idx_src_ip   (src_ip),
    INDEX idx_time     (captured_at)
);

CREATE TABLE IF NOT EXISTS anomalies (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    src_ip      VARCHAR(45),
    protocol    VARCHAR(10),
    reason      VARCHAR(255),
    detected_at DATETIME
);
EOF
