"""
Start the local dashboard. Opens your browser to the case study picker.
Serves the whole repo so /data and /web both load correctly.
"""

import http.server
import socketserver
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = 8765


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        # less noise in the terminal while clicking around
        pass


def main():
    import os

    os.chdir(ROOT)
    url = f"http://127.0.0.1:{PORT}/web/"
    print(f"Dashboard: {url}")
    print("Press Ctrl+C to stop.")
    webbrowser.open(url)
    with socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler) as httpd:
        httpd.serve_forever()


if __name__ == "__main__":
    main()
