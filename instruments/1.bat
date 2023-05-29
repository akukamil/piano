for /d %%i in ("source\*") do (
    
    for %%j in ("%%i\*") do (
	echo %%~ni
        echo %%~nxj
	ffmpeg -y -i "source/%%~ni/%%~nxj" -ac 1 -q:a 2 -af "volume=10dB, afade=t=out:st=0:d=1.5" "edited/%%~ni/%%~nxj"
    )
)
pause