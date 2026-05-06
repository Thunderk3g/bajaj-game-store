#!/usr/bin/env python3
import os
import shutil
import subprocess
import sys
import threading
import time
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler

BASE = os.path.dirname(os.path.abspath(__file__))
PORT = 8004
GAME_NAME = "Shield Marble Vita"


def check_and_install_npm():
    if shutil.which("npm"):
        return True

    print("\nWARNING: npm is not installed or not in PATH")
    response = input("Would you like to install Node.js (which includes npm)? (y/n): ").strip().lower()
    if response != "y":
        print("npm is required to build this game.")
        return False

    if shutil.which("choco"):
        print("\nInstalling Node.js via Chocolatey...")
        subprocess.run(["choco", "install", "nodejs", "-y"], check=False)
        if shutil.which("npm"):
            print("Node.js installed successfully.")
            return True

    if shutil.which("scoop"):
        print("\nInstalling Node.js via Scoop...")
        subprocess.run(["scoop", "install", "nodejs"], check=False)
        if shutil.which("npm"):
            print("Node.js installed successfully.")
            return True

    print("\nCould not automatically install Node.js")
    print("Please download and install from: https://nodejs.org/")
    return False


def check_and_install_python():
    if shutil.which("python") or shutil.which("python3"):
        return True

    print("\nWARNING: Python is not installed or not in PATH")
    response = input("Would you like to install Python 3? (y/n): ").strip().lower()
    if response != "y":
        print("Python is required to serve this game.")
        return False

    if shutil.which("choco"):
        print("\nInstalling Python via Chocolatey...")
        subprocess.run(["choco", "install", "python", "-y"], check=False)
        if shutil.which("python") or shutil.which("python3"):
            print("Python installed successfully.")
            return True

    if shutil.which("scoop"):
        print("\nInstalling Python via Scoop...")
        subprocess.run(["scoop", "install", "python"], check=False)
        if shutil.which("python") or shutil.which("python3"):
            print("Python installed successfully.")
            return True

    print("\nCould not automatically install Python")
    print("Please download and install from: https://www.python.org/")
    return False


def open_browser():
    time.sleep(1)
    webbrowser.open(f"http://localhost:{PORT}")


os.chdir(BASE)

if not check_and_install_npm():
    sys.exit(1)

if not check_and_install_python():
    sys.exit(1)

print("Installing dependencies...")
subprocess.run(["npm", "install"], check=True)

print(f"\nBuilding {GAME_NAME}...")
subprocess.run(["npm", "run", "build"], check=True)

os.chdir(os.path.join(BASE, "dist"))
print(f"\nServing {GAME_NAME} at http://localhost:{PORT}")
print("Press Ctrl+C to stop\n")

threading.Thread(target=open_browser, daemon=True).start()
HTTPServer(("localhost", PORT), SimpleHTTPRequestHandler).serve_forever()
