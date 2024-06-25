const video = document.getElementById('video');
const message = document.getElementById('message');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const recordedVideo = document.getElementById('recordedVideo');

let mediaRecorder;
let recordedChunks = [];

const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

async function convertToMP4(webmBlob) {
    await ffmpeg.load();
    ffmpeg.FS('writeFile', 'input.webm', await fetchFile(webmBlob));
    await ffmpeg.run('-i', 'input.webm', 'output.mp4');
    const data = ffmpeg.FS('readFile', 'output.mp4');
    const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });
    return mp4Blob;
}

// カメラストリームを取得してビデオ要素に表示する
navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: 'environment' // 外側カメラを指定
    },
    audio: true
})
.then(stream => {
    message.hidden = true;
    video.srcObject = stream;
    video.muted = true;

    // MediaRecorderを初期化
    mediaRecorder = new MediaRecorder(stream);

    // データが利用可能になったときにデータを収集する
    mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    // 録画が停止したときにビデオを再生可能にする
    mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(recordedChunks, { type: 'video/webm' });
        recordedChunks = [];
        const mp4Blob = await convertToMP4(webmBlob);
        const url = URL.createObjectURL(mp4Blob);
        recordedVideo.src = url;
    };
})
.catch(error => {
    window.alert('Error accessing media devices.', error);
    console.error('Error accessing media devices.', error);
});

// 録画開始
startBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
        mediaRecorder.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
    }
});

// 録画停止
stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
});