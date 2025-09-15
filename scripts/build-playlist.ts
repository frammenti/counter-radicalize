import { spawnSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';

const input = 'models/inputs/rec_pre.mp3';
const dir = 'public/hls/';
const output = dir + 'message.m3u8';

mkdirSync(dir, { recursive: true });

if (existsSync(output)) {
  process.exit(0);
}

const msg = `Converting \x1b[4m${input}\x1b[0m to \x1b[4m${output}\x1b[0m via ffmpeg...`;
process.stdout.write(msg);

import ffmpegPath from '@ffmpeg-installer/ffmpeg';
const ffmpeg = ffmpegPath.path;

const args = [
  '-v', 'quiet',
  '-i', input,
  '-c:a', 'aac', '-b:a', '128k',
  '-f', 'hls',
  '-hls_segment_type', 'mpegts',
  '-hls_playlist_type', 'vod',
  '-hls_flags', 'single_file',
  '-hls_time', '10',
  '-hls_allow_cache', '1',
  output,
];

const result = spawnSync(ffmpeg, args, { stdio: 'inherit' });

if (result.error) {
  throw result.error;
}
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
process.stdout.write(`\r${msg} \x1b[32mDone\x1b[0m\n\n`);