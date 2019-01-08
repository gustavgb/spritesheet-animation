var frame = 0
var frames = 1
var canvas = document.getElementById('animation')
var ctx = canvas.getContext('2d')
var running = false
var spriteWidth = null
var spriteHeight = null
var fileWidth = 1
var fileHeight = 1
var sprite = null
var speed = 1
var scale = 1
var imageScaleFactor = 1
var chosenBG = 0
var bglist = ['#ddd', '#aaa', '#555', '#da5', '#5ad', '#a5d', '#ad5']
var source
var loop = true

ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

function changeFile(files) {
  var reader = new FileReader()
  var preview = document.querySelector('#preview')

  reader.addEventListener('load', function () {
    preview.src = reader.result

    applyImage(reader.result)
  })

  reader.readAsDataURL(files[0])
}

function applyImage(source, callback) {
  var img = new Image()
  img.src = source
  img.onload = function () {
    imageScaleFactor = Math.ceil(1000 / img.height)
    renderUpscaled(img, imageScaleFactor)
    applyOptions({
      fileWidth: img.width,
      fileHeight: img.height,
      source: source,
      sprite: document.getElementById('upscaled'),
      imageScaleFactor: imageScaleFactor
    })

    if (typeof callback === 'function') {
      callback();
    }
  }
}

function renderUpscaled(sourceImage, factor) {
  var sourceCanvas = document.getElementById('source')
  sourceCanvas.width = sourceImage.width
  sourceCanvas.height = sourceImage.height
  var imageDataSource = sourceCanvas.getContext('2d');

	imageDataSource.drawImage(sourceImage, 0, 0);
	var imgData = imageDataSource.getImageData(0,0,sourceImage.width,sourceImage.height).data;

  var upscaledCanvas = document.getElementById('upscaled')
  upscaledCanvas.width = sourceImage.width * factor
  upscaledCanvas.height = sourceImage.height * factor
	var upscaledImageData = document.getElementById('upscaled').getContext('2d');

	for (var x = 0; x < sourceImage.width; ++x) {
		for (var y = 0 ; y < sourceImage.height; ++y) {
			var i = (y * sourceImage.width + x) * 4;
			var r = imgData[i];
			var g = imgData[i + 1];
			var b = imgData[i + 2];
			var a = imgData[i + 3];
			upscaledImageData.fillStyle = "rgba(" + r + ", " + g + ", " + b + ", " + (a / 255) + ")";
			upscaledImageData.fillRect(x * factor, y * factor, factor, factor);
		}
	}
}

function applyOptions(options) {
  if (options.aspect) {
    console.log('Applying aspect' + options.aspect)

    canvas.width = 400
    canvas.height = 400 * options.aspect
  }

  if (options.width) {
    console.log('Applying width ' + options.width)

    spriteWidth = parseInt(options.width, 10)
  }

  if (options.height) {
    console.log('Applying height ' + options.height)

    spriteHeight = parseInt(options.height, 10)
  }

  if (options.fileWidth) {
    console.log('Applying fileWidth ' + options.fileWidth)

    fileWidth = parseInt(options.fileWidth, 10)
  }

  if (options.fileHeight) {
    console.log('Applying fileHeight ' + options.fileHeight)

    fileHeight = parseInt(options.fileHeight, 10)
  }

  if (options.sprite) {
    console.log('Applying sprite')

    sprite = options.sprite
  }

  if (options.speed) {
    console.log('Applying speed ' + options.speed)

    speed = options.speed
  }

  if (options.frames) {
    console.log('Applying frames ' + options.frames)

    frames = options.frames
  }

  if (options.scale) {
    console.log('Applying scale ' + options.scale)

    scale = options.scale
    ctx.scale(scale, scale)
  }

  if (options.imageScaleFactor) {
    console.log('Applying imageScaleFactor ' + options.imageScaleFactor)

    imageScaleFactor = options.imageScaleFactor
  }

  if (options.source) {
    console.log('Applying source ' + options.source)

    source = options.source
  }
}

function validateOptions () {
  if (
    sprite !== null &&
    spriteWidth !== null &&
    spriteHeight !== null &&
    fileWidth % spriteWidth === 0
  ) {
    return true
  }
  return false
}

function playAnimation() {
  if (validateOptions()) {
    applyOptions({
      aspect: spriteHeight / spriteWidth,
      frames: fileWidth / spriteWidth,
      scale: 400 / spriteWidth
    })

    document.querySelector('#animation-container').style.display = 'block'
    document.querySelector('#preview-button').style.display = 'none'
    document.querySelectorAll('.option').forEach(function (el) {
      el.disabled = true
    })
    document.getElementById('sprite').disabled = true;

    running = true

    if (!loop && frame >= frames - 1) {
      frame = 0
    }

    renderNextFrame()
  } else {
    alert("Something is wrong!")
  }
}

function renderNextFrame() {
  if (running) {
    setTimeout(renderNextFrame, (1000 / frames) / speed)
  }

  ctx.fillStyle = bglist[chosenBG]
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.drawImage(
    sprite,
    frame * spriteWidth * imageScaleFactor,
    0,
    spriteWidth * imageScaleFactor,
    spriteHeight * imageScaleFactor,
    0,
    0,
    spriteWidth,
    spriteHeight
  )

  document.getElementById('currentFrame').innerText = frame + 1 + '/' + frames

  if (running) {
    frame++

    if (frame >= frames && loop) {
      frame = 0
    } else if (frame >= frames && !loop) {
      togglePlay()
      frame = frames - 1
    }
  }
}

function prevFrame() {
  frame--;
  if (frame < 0) {
    frame = frames - 1
  }
  if (!running) renderNextFrame()
}

function nextFrame() {
  frame++;
  if (frame >= frames) {
    frame = 0
  }
  if (!running) renderNextFrame()
}

function togglePlay() {
  if (running) {
    running = false

    document.getElementById('sprite').disabled = false;
  } else {
    playAnimation()
  }
}

function reset() {
  if (confirm('Really reload?')) {
    location.hash = ''
    location.reload()
  }
}

function changeBG() {
  chosenBG++
  if (chosenBG >= bglist.length) {
    chosenBG = 0
  }

  if (!running) renderNextFrame();
}

function changeLooping () {
  loop = !loop

  if (loop) {
    document.getElementById('loop-btn').value = 'Loop: On'
  } else {
    document.getElementById('loop-btn').value = 'Loop: Off'
  }
}

function packShared() {
  var bundle = btoa(JSON.stringify({
    chosenBG: chosenBG,
    spriteWidth: spriteWidth,
    spriteHeight: spriteHeight,
    speed: speed,
    source: source
  }))

  document.getElementById('sharelink').value = location.href.split('#')[0] + '#' + bundle
  location.hash = bundle
}

function loadShared(bundle) {
  var extract = JSON.parse(atob(bundle))

  applyOptions({
    width: extract.spriteWidth,
    height: extract.spriteHeight,
    speed: extract.speed
  })

  chosenBG = extract.chosenBG

  document.getElementById('option-width').value = extract.spriteWidth
  document.getElementById('option-height').value = extract.spriteHeight
  document.getElementById('option-speed').value = extract.speed

  document.getElementById('preview').src = extract.source
  applyImage(extract.source, playAnimation)
}

window.addEventListener('load', function load() {
  window.removeEventListener('load', load)

  if (location.hash) {
    try {
      loadShared(location.hash.substr(1))
      console.log('Found bundle')
    } catch (e) {
      console.log('No bundle loaded')
    }
  }
})
