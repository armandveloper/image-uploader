let $file = document.getElementById('input-file'),
	$dropZone = document.getElementById('drop-zone'),
	$box = document.getElementById('box');

// Only supports: .gif, .png, .jpg, .jpeg, .svg and .ico
const validFiles = [
	'image/gif',
	'image/png',
	'image/jpeg',
	'image/svg+xml',
	'image/x-icon',
];

const isValidFile = (type) => validFiles.includes(type);

const setDragOver = (e) => {
	e.preventDefault();
	$dropZone.classList.add('is-dragover');
};

const unsetDragOver = (e) => {
	e.preventDefault();
	$dropZone.classList.remove('is-dragover');
};

const showToast = (text, classes = 'toast') => {
	const $toast = document.createElement('div');
	$toast.className = classes;
	$toast.innerText = text;
	document.body.appendChild($toast);
	setTimeout(() => {
		$toast.remove();
	}, 1500);
};

const copyClipboard = async () => {
	try {
		const { state } = await navigator.permissions.query({
			name: 'clipboard-write',
		});
		if (state === 'denied') {
			return;
		}
		if (state === 'prompt') {
			showToast('Habilite los permisos para el portapapeles');
			return;
		}
		// Tenemos permisos
		let text = document.getElementById('url').innerText;
		await navigator.clipboard.writeText(text);
		showToast('URL Copied');
	} catch (err) {
		console.log(err);
		showToast('Error al acceder al portapapeles:');
	}
};

const clearContainer = ($container = $box) => {
	while ($container.lastChild) {
		$container.removeChild($container.lastChild);
	}
};

const showUploadingScreen = () => {
	const template = `
  <h1 class="heading-1">Uploading...</h1>
  <div class="progress-bar">
    <div class="progress-bar__line"></div>
  </div>
  `;
	clearContainer();
	$box.innerHTML = template;
};

const showUploadedScreen = (imgURL) => {
	const template = `
  <div class="check__circle">
    <span class="check">&check;</span>
  </div>
  <h1 class="heading-1">Uploaded Successfully!</h1>
  <img class="img" src="${imgURL}" alt="image" />
  <div class="url-container">
    <span class="url" id="url">${imgURL}</span>
    <button class="btn" onclick="copyClipboard()">Copy Link</button>
  </div>
  `;
	clearContainer();
	$box.innerHTML = template;
};

const showHomeScreen = () => {
	const template = `
  <h1 class="heading-1">Upload your image</h1>
  <p class="legend">File should be jpeg, png, ...</p>
  <div class="drag-drop" id="drop-zone">
    <img
      src="img/image.svg"
      alt="Image Placeholder"
      class="drag-drop__img"
    />
    <p class="drag-drop__legend">Drag & Drop your image here</p>
  </div>
  <p class="or">Or</p>
  <label for="input-file" class="btn">Choose a file</label>
  <input type="file" id="input-file" class="hidden" />
  `;
	clearContainer();
	$box.innerHTML = template;
	// Update the references
	$file = document.getElementById('input-file');
	$dropZone = document.getElementById('drop-zone');
	$box = document.getElementById('box');
	addEventListeners();
};

const uploadFile = async (file) => {
	showUploadingScreen();
	const formData = new FormData();
	formData.append('image', file);
	try {
		const response = await fetch(
			'https://node-image-uploader.herokuapp.com/api/images',
			{
				method: 'POST',
				body: formData,
			}
		);
		const body = await response.json();
		if (!body.ok) throw body.message;
		showUploadedScreen(body.url);
	} catch (err) {
		console.log('Error', err);
		showToast('Falied to load the image', 'toast toast--error');
		showHomeScreen();
	}
};

const addEventListeners = () => {
	$file.addEventListener('change', ({ target }) => {
		const file = target.files[0];
		if (!isValidFile(file.type)) {
			showToast('Invalid image format');
			return;
		}
		uploadFile(file);
	});

	$dropZone.addEventListener('drag', (e) => {
		e.preventDefault();
	});
	$dropZone.addEventListener('dragover', setDragOver);
	$dropZone.addEventListener('dragenter', setDragOver);
	$dropZone.addEventListener('dragleave', unsetDragOver);
	$dropZone.addEventListener('dragend', unsetDragOver);
	$dropZone.addEventListener('drop', (e) => {
		e.preventDefault();
		$dropZone.classList.remove('is-dragover');
		const file = e.dataTransfer.files[0];
		if (!isValidFile(file.type)) {
			showToast('Invalid image format', 'toast toast--error');
			return;
		}
		// Enviar archivo
		uploadFile(file);
	});
};

addEventListeners();
