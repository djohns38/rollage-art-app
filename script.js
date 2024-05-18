document.getElementById('upload').addEventListener('change', function() {
  var fileInput = document.getElementById('upload');
  if (fileInput.files && fileInput.files[0]) {
    var file = fileInput.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      var uploadedImage = document.getElementById('uploadedImage');
      uploadedImage.src = e.target.result;
      uploadedImage.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

function createImageGrid() {
  var fileInput = document.getElementById('upload');
  var numRectangles = parseInt(document.getElementById('numRectangles').value);
  if (fileInput.files && fileInput.files[0]) {
    var file = fileInput.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      var imgData = e.target.result;
      sessionStorage.setItem('imgData', imgData);
      sessionStorage.setItem('numRectangles', numRectangles);
      window.location.href = 'output.html';
    };
    reader.readAsDataURL(file);
  } else {
    alert('Please upload an image first.');
  }
}

function goBack() {
  window.location.href = 'index.html';
}

function generateOrder(numRectangles) {
  var order = [];
  for (var i = 1; i <= numRectangles; i++) {
    if (i % 2 === 1) {
      order.push((i + 1) / 2);
    } else {
      order.push(numRectangles - i / 2 + 1);
    }
  }
  return order;
}

function drawGrid(img, numRectangles) {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  var offscreenCanvas = document.createElement('canvas');
  var offscreenCtx = offscreenCanvas.getContext('2d');
  offscreenCanvas.width = img.width;
  offscreenCanvas.height = img.height;

  var halfWidth = img.width / 2;
  var halfHeight = img.height / 2;

  offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
  offscreenCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, halfWidth, halfHeight);

  offscreenCtx.save();
  offscreenCtx.scale(-1, 1);
  offscreenCtx.drawImage(img, 0, 0, img.width, img.height, -img.width, 0, halfWidth, halfHeight);
  offscreenCtx.restore();

  offscreenCtx.save();
  offscreenCtx.scale(1, -1);
  offscreenCtx.drawImage(img, 0, 0, img.width, img.height, 0, -img.height, halfWidth, halfHeight);
  offscreenCtx.restore();

  offscreenCtx.save();
  offscreenCtx.scale(-1, -1);
  offscreenCtx.drawImage(img, 0, 0, img.width, img.height, -img.width, -img.height, halfWidth, halfHeight);
  offscreenCtx.restore();

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var rectWidth = img.width / numRectangles;
  var order = generateOrder(numRectangles);

  var verticalCanvas = document.createElement('canvas');
  var verticalCtx = verticalCanvas.getContext('2d');
  verticalCanvas.width = img.width;
  verticalCanvas.height = img.height;

  for (var i = 0; i < numRectangles; i++) {
    var srcX = (order[i] - 1) * rectWidth;
    var destX = i * rectWidth;
    verticalCtx.drawImage(offscreenCanvas, srcX, 0, rectWidth, img.height, destX, 0, rectWidth, img.height);
  }

  var rectHeight = img.height / numRectangles;
  var horizontalOrder = generateOrder(numRectangles);

  for (var i = 0; i < numRectangles; i++) {
    var srcY = (horizontalOrder[i] - 1) * rectHeight;
    var destY = i * rectHeight;
    ctx.drawImage(verticalCanvas, 0, srcY, img.width, rectHeight, 0, destY, img.width, rectHeight);
  }

  var downloadLink = document.getElementById('downloadLink');
  downloadLink.href = canvas.toDataURL('image/png');
  downloadLink.download = 'transformed-image.png';
  downloadLink.textContent = 'Download Transformed Image';
  downloadLink.style.display = 'inline';
}

window.onload = function() {
  var imgData = sessionStorage.getItem('imgData');
  var numRectangles = parseInt(sessionStorage.getItem('numRectangles'));
  if (imgData && numRectangles) {
    var img = new Image();
    img.onload = function() {
      drawGrid(img, numRectangles);
    };
    img.src = imgData;
  } else {
    alert('No image data found. Please go back and upload an image.');
  }
};
