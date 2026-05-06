#!/usr/bin/env python3
import subprocess
import sys
import os
import shutil
from pathlib import Path

PORT = 8008

def check_command(cmd, name):
    if shutil.which(cmd):
        print(f"✓ {name} found")
        return True
    print(f"✗ {name} not found")
    return False

def install_and_check(cmd, install_cmd, name):
    if check_command(cmd, name):
        return True
    
    response = input(f"Would you like to install {name}? (y/n): ").strip().lower()
    if response != 'y':
        print(f"Please install {name} manually and run this script again.")
        return False
    
    try:
        if shutil.which("choco"):
            subprocess.run(["choco", "install", install_cmd, "-y"], check=True)
        elif shutil.which("scoop"):
            subprocess.run(["scoop", "install", install_cmd], check=True)
        else:
            print(f"Cannot auto-install. Please download from:")
            if name == "Node.js":
                print("  https://nodejs.org")
            else:
                print("  https://python.org")
            return False
        
        return check_command(cmd, name)
    except Exception as e:
        print(f"Auto-install failed: {e}")
        return False

def main():
    print("=" * 50)
    print("Whole Life Guardian - Game Launcher")
    print("=" * 50)
    print()
    
    if not install_and_check("node", "nodejs", "Node.js"):
        sys.exit(1)
    
    if not install_and_check("python", "python", "Python"):
        sys.exit(1)
    
    game_dir = Path(__file__).parent
    os.chdir(game_dir)
    
    print()
    print("[1/3] Installing dependencies...")
    result = subprocess.run(["npm", "install"], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"✗ npm install failed: {result.stderr}")
        sys.exit(1)
    print("✓ Dependencies installed")
    
    print()
    print("[2/3] Building game...")
    result = subprocess.run(["npm", "run", "build"], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"✗ Build failed: {result.stderr}")
        sys.exit(1)
    print("✓ Game built successfully")
    
    print()
    print("[3/3] Starting server...")
    print(f"✓ Open http://127.0.0.1:{PORT}")
    print("  Press Ctrl+C to stop")
    print()
    
    try:
        subprocess.run(["python", "-m", "http.server", str(PORT), "--directory", "dist"])
    except KeyboardInterrupt:
        print("\nServer stopped.")

if __name__ == "__main__":
    main()