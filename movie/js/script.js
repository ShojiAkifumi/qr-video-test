const video = document.getElementById('video');
const message = document.getElementById('message');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const toggleCameraBtn = document.getElementById('toggleCameraBtn');
const recordedVideo = document.getElementById('recordedVideo');

let mediaRecorder;
let recordedChunks = [];
let currentStream;
let isUsingFrontCamera = false;

async function getMediaStream() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: {
            facingMode: isUsingFrontCamera ? 'user' : 'environment'
        },
        audio: true
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        message.hidden = true;
        video.srcObject = stream;
        currentStream = stream;

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
    } catch (error) {
        console.error('Error accessing media devices.', error);
        alert(`Error accessing media devices: ${error.message}`);
    }
}

// 初期ストリームの取得
getMediaStream();

// カメラの切り替え
toggleCameraBtn.addEventListener('click', () => {
    isUsingFrontCamera = !isUsingFrontCamera;
    getMediaStream();
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
