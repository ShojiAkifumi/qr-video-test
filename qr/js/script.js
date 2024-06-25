var canvasElement = document.getElementById("canvas");
var video = document.createElement("video");
var canvas = canvasElement.getContext("2d");
var message = document.getElementById("message");
var reload = document.getElementById("reload");

startVideoStream();

function startVideoStream(){
  if(navigator.mediaDevices){
    // カメラストリームを取得してビデオ要素に表示する
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
       video.srcObject = stream;
       video.setAttribute("playsinline", true);
       video.play();
       requestAnimationFrame(tick);
    });
  }else{
      message.innerText = "🎥 デバイスカメラにアクセスできません (カメラへのアクセスを許可してください)"
  }
}


function tick() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    message.hidden = true;
    canvasElement.hidden = false;
    reload.hidden = true;

    canvasElement.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
    // カメラストリームから取得した画像を解析
    var code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    // QRコードの文字列の先頭が「http」であれば文字列を表示する
    if (code && code.data.startsWith('http')) {
      canvasElement.hidden = true;
      message.hidden = false;
      reload.hidden = false;
      message.innerText = code.data;
      return 0;
    }
  }
  requestAnimationFrame(tick);
}