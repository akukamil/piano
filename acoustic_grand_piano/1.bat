for %%a in ("*.mp3") do ffmpeg -i "%%a" -ac 1 -q:a 2 -af "volume=10dB" "mono\%%~na.mp3"
