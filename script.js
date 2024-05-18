document.addEventListener('DOMContentLoaded', function() {
  const uploadInput = document.getElementById('upload');
  const uploadedImage = document.getElementById('uploadedImage');
  const numRectanglesInput = document.getElementById('numRectangles');

  if (uploadInput) {
    uploadInput.addEventListener('change', function() {
      if (uploadInput.files && uploadInput.files[0]) {
        const file = uploadInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
          uploadedImage.src = e.target.result;
          uploadedImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  window.createImageGrid = function() {
    if (uploadInput.files && uploadInput.files[0]) {
      const numRectangles = parseInt(numRectanglesInput.value);
      const file = uploadInput.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        const imgData = e.target.result;
        sessionStorage.setItem('imgData', imgData);
        sessionStorage.setItem('numRectangles', numRectangles);
        window.location.href = 'output.html';
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image first.');
    }
  };

  window.goBack = function() {
    window.location.href = 'index.html';
  };

  function generateOrder(numRectangles) {
    const order = [];
    for (let i = 1; i <= numRectangles; i++) {
      if (i % 2 === 1) {
        order.push((i + 1) / 2);
      } else {
        order.push(numRectangles - i / 2 + 1);
      }
    }
    return order;
  }

  function drawGrid(img, numRectangles) {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }

    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCanvas.width = img.width;
    offscreenCanvas.height = img.height;

    const halfWidth = img.width / 2;
    const halfHeight = img.height / 2;

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

    const rectWidth = img.width / numRectangles;
    const order = generateOrder(numRectangles);

    const verticalCanvas = document.createElement('canvas');
    const verticalCtx = verticalCanvas.getContext('2d');
    verticalCanvas.width = img.width;
    verticalCanvas.height = img.height;

    for (let i = 0; i < numRectangles; i++) {
      const srcX = (order[i] - 1) * rectWidth;
      const destX = i * rectWidth;
      verticalCtx.drawImage(offscreenCanvas, srcX, 0, rectWidth, img.height, destX, 0, rectWidth, img.height);
    }

    const rectHeight = img.height / numRectangles;
    const horizontalOrder = generateOrder(numRectangles);

    for (let i = 0; i < numRectangles; i++) {
      const srcY = (horizontalOrder[i] - 1) * rectHeight;
      const destY = i * rectHeight;
      ctx.drawImage(verticalCanvas, 0, srcY, img.width, rectHeight, 0, destY, img.width, rectHeight);
    }

    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = 'transformed-image.png';
    downloadLink.textContent = 'Download Transformed Image';
    downloadLink.style.display = 'inline';
  }

  if (window.location.pathname.includes('output.html')) {
    window.onload = function() {
      const imgData = sessionStorage.getItem('imgData');
      const numRectangles = parseInt(sessionStorage.getItem('numRectangles'));
      if (imgData && numRectangles) {
        const img = new Image();
        img.onload = function() {
          drawGrid(img, numRectangles);
        };
        img.src = imgData;
      } else {
        alert('No image data found. Please go back and upload an image.');
      }
    };
  }
});
