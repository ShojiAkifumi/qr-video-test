const video = document.getElementById('video');
const message = document.getElementById('message');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const recordedVideo = document.getElementById('recordedVideo');

let mediaRecorder;
let recordedChunks = [];

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

    // MediaRecorderを初期化
    mediaRecorder = new MediaRecorder(stream);

    // データが利用可能になったときにデータを収集する
    mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    // 録画が停止したときにビデオを再生可能にする
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        recordedChunks = [];
        const url = URL.createObjectURL(blob);
        recordedVideo.src = url;
    };
})
.catch(error => {
    console.error('Error accessing media devices.', error);
});

// 録画開始
startBtn.addEventListener('click', () => {
    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    recordedVideo.hidden = true;
});

// 録画停止
stopBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    recordedVideo.hidden = false;
});