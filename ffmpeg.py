import os
import subprocess

json_file = os.path.join('models', 'outputs', 'segments_emotion.json')
input_file = os.path.join('models', 'inputs', 'rec_pre.mp3')
output_playlist = os.path.join('public', 'hls', 'message.m3u8')

os.makedirs(os.path.dirname(output_playlist), exist_ok=True)

ffmpeg = [
    'ffmpeg',
    '-i', input_file,
    '-c:a', 'aac', '-b:a', '128k', # re-encode to AAC for HLS
    '-f', 'hls',
    '-hls_segment_type', 'mpegts',
    '-hls_playlist_type', 'vod',
    '-hls_flags', 'single_file',
    '-hls_time', '10',
    '-hls_allow_cache', '1',
    str(output_playlist)
]

# Run ffmpeg
subprocess.run(ffmpeg, check=True)
