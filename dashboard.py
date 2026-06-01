from rich.console import Console
from rich.table   import Table
from rich.panel   import Panel
from rich.columns import Columns
from rich.live    import Live
from database     import get_protocol_summary, get_top_talkers, get_recent_anomalies
import time

console = Console()

def build_protocol_table():
    t = Table(title="Protocol Breakdown", show_header=True,
              header_style="bold cyan")
    t.add_column("Protocol", style="cyan",  min_width=10)
    t.add_column("Packets",  style="white", justify="right")
    t.add_column("Total KB", style="green", justify="right")
    for proto, cnt, total in get_protocol_summary():
        t.add_row(proto, str(cnt), f"{round(total/1024, 1)}")
    return t

def build_talkers_table():
    t = Table(title="Top Talkers", show_header=True,
              header_style="bold magenta")
    t.add_column("Source IP", style="magenta", min_width=15)
    t.add_column("Packets",   style="white",   justify="right")
    for ip, cnt in get_top_talkers():
        t.add_row(ip, str(cnt))
    return t

def build_anomalies_table():
    t = Table(title="Recent Anomalies", show_header=True,
              header_style="bold red")
    t.add_column("Source IP",  style="red",   min_width=15)
    t.add_column("Protocol",   style="white", min_width=8)
    t.add_column("Reason",     style="yellow")
    t.add_column("Detected",   style="white")
    for ip, proto, reason, ts in get_recent_anomalies():
        t.add_row(ip, proto, reason, str(ts))
    return t

def run_dashboard(refresh=5):
    with Live(console=console, refresh_per_second=1) as live:
        while True:
            proto_t   = build_protocol_table()
            talkers_t = build_talkers_table()
            anom_t    = build_anomalies_table()
            live.update(Columns([proto_t, talkers_t]))
            console.print(anom_t)
            time.sleep(refresh)

if __name__ == "__main__":
    run_dashboard()
