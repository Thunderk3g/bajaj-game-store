@echo off
cd /d %~dp0
start http://localhost:3012
npx vite --port 3012 --host