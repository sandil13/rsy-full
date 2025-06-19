import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/postprocessing/OutlinePass.js'; 
const yakutskSite = document.getElementById('yakutsk-site');

const images = yakutskSite.querySelectorAll('.scrollImage');

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xeeeeee)
let currentCameraZ = 10

const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 100)
const canvas = document.getElementById('three-canvas')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)

const cameraHeight = 3
const lookAtHeight = 10

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.screenSpacePanning = false

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))

const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
)
outlinePass.edgeStrength = 2.0
outlinePass.edgeGlow = 0.0
outlinePass.edgeThickness = 0.5
outlinePass.visibleEdgeColor.set('#ffffff')
outlinePass.hiddenEdgeColor.set('#000000')
composer.addPass(outlinePass)

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0,
  0.4,
  0.85
)
composer.addPass(bloomPass)

function setupCameraCentered(models) {
  const box = new THREE.Box3()
  models.forEach(model => {
    if (model) {
      const modelBox = new THREE.Box3().setFromObject(model)
      box.union(modelBox)
    }
  })
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  const maxDim = Math.max(size.x, size.y, size.z)
  currentCameraZ = maxDim * 0.55

  camera.position.set(center.x, cameraHeight, center.z + currentCameraZ)
  camera.lookAt(center.x, lookAtHeight, center.z)

  controls.minDistance = currentCameraZ * 0.5
  controls.maxDistance = currentCameraZ * 5
  controls.update()
}

const modelFiles = [
  'yakutsk', 'namsi', 'maya', 'borogonsi', 'churapcha', 'itikkuel', 'berdigistyah', 'pokrovsk', 'viluisk', 'sangar', 'amga', 'olekminsk', 'verhneviluisk', 'suntar', 'nurba', 'lensk', 'mirnii', 'olenek', 'saskilah', 'zigansk', 'tiksi', 'batagayalita', 'batagai', 'handiga', 'aldan', 'nerungri', 'deputatskii', 'honuu', 'ustnera', 'abiiskii', 'chokurdah', 'ustmaya', 'cherskii', 'srednekolimsk', 'ziryanka'
]
const modelTexts = [
  "город Якутск", "Намский улус", "Мегино-Кангаласский улус", "Усть-Алданский улус", "Чурапчинский улус", "Таттинский улус", "Горный улус", "Хангаласский улус", "Вилюйский улус", "Кобяйский улус",
  "Амгинский улус", "Олёкминский улус", "Верхневилюйский улус", "Сунтарский улус", "Нюрбинский улус",
  "Ленский район", "Мирнинский район", "Оленёкский улус", "Анабарский улус", "Жиганский улус",
  "Булунский улус", "Эвено-Бытантайский улус", "Верхоянский улус", "Томпонский район", "Алданский район",
  "Нерюнгринский район", "Усть-Янский улус", "Момский район", "Оймяконский улус", "Абыйский улус",
  "Аллаиховский улус", "Усть-Майский улус", "Нижнеколымский улус", "Среднеколымский улус", "Верхнеколымский улус"
]

const models = new Array(modelFiles.length).fill(null)

function addMaterialsToModel(obj) {
  obj.traverse((child) => {
    if (child.isMesh) {
      child.userData.originalMaterial = child.material
      child.userData.highlightMaterial = child.material.clone()
      child.userData.highlightMaterial.emissive = new THREE.Color(0xffffff)
      child.userData.highlightMaterial.emissiveIntensity = 0
      child.userData.dimMaterial = child.material.clone()
      child.userData.dimMaterial.color = child.material.color.clone().multiplyScalar(0.5)
      child.userData.dimMaterial.emissive = new THREE.Color(0x000000)
      child.userData.dimMaterial.emissiveIntensity = 0
    }
  })
}

let modelsLoadedCount = 0
let allModelsLoaded = false

const anabarIdx = modelTexts.findIndex(name => name.toLowerCase().includes('анабарский'))
const olenekIdx = modelTexts.findIndex(name => name.toLowerCase().includes('оленёкский'))
const bulunIdx = modelTexts.findIndex(name => name.toLowerCase().includes('булунский'))
const mirninskiiIdx = modelTexts.findIndex(name => name.toLowerCase().includes('мирнинский'))
const ziganskiiIdx = modelTexts.findIndex(name => name.toLowerCase().includes('жиганский'))
const nurbinskiiIdx = modelTexts.findIndex(name => name.toLowerCase().includes('нюрбинский'))
const ustyanskiiIdx = modelTexts.findIndex(name => name.toLowerCase().includes('усть-янский'))
const evenobitIdx = modelTexts.findIndex(name => name.toLowerCase().includes('эвено-бытантайский'))
const allaihovIdx = modelTexts.findIndex(name => name.toLowerCase().includes('аллаиховский'))
const verhoyanIdx = modelTexts.findIndex(name => name.toLowerCase().includes('верхоянский'))
const lenskiiIdx = modelTexts.findIndex(name => name.toLowerCase().includes('ленский'))
const suntarskiiIdx = modelTexts.findIndex(name => name.toLowerCase().includes('сунтарский'))
const namsiIdx = modelTexts.findIndex(name => name.toLowerCase().includes('намский'))
const nerungrinIdx = modelTexts.findIndex(name => name.toLowerCase().includes('нерюнгринский'))
const aldskiiIdx = modelTexts.findIndex(name => name.toLowerCase().includes('алданский район'))
const olekminIdx = modelTexts.findIndex(name => name.toLowerCase().includes('олёкминский'))
const ustmayIdx = modelTexts.findIndex(name => name.toLowerCase().includes('усть-майский'))
const amginIdx = modelTexts.findIndex(name => name.toLowerCase().includes('амгинский'))

modelFiles.forEach((file, i) => {
  const loader = new GLTFLoader()
    setTimeout(() => {
      document.getElementById('three-canvas').classList.add('visible');
    }, 400);
  const introText = document.getElementById('intro-text');
  const intrText = document.getElementById('intr-text');
  introText.classList.add('visible');
  setTimeout(() => {
    introText.classList.remove('visible');
  }, 1500);
  intrText.classList.add('visible');
  setTimeout(() => {
    intrText.classList.remove('visible');
  }, 1700);
  loader.load(
    `model/${file}.gltf`,
    (gltf) => {
      models[i] = gltf.scene
      models[i].scale.set(1, 1, 1)
      if (i === anabarIdx) {
        models[i].position.set(0, 2, 0)
      } else if (i === olenekIdx) {
        models[i].position.set(0, 1.8, 0)
      } else if (i === bulunIdx) {
        models[i].position.set(0, 1.5, 0)
      } else if (i === mirninskiiIdx) {
        models[i].position.set(0, 1.3, 0)
      } else if (i === ziganskiiIdx) {
        models[i].position.set(0, 1.1, 0)
      } else if (i === nurbinskiiIdx) {
        models[i].position.set(0, 0.9, 0)
      } else if (i === ustyanskiiIdx) {
        models[i].position.set(0, 1.3, 0)
      } else if (i === evenobitIdx) {
        models[i].position.set(0, 1, 0)
      } else if (i === allaihovIdx) {
        models[i].position.set(0, 0.85, 0)
      } else if (i === verhoyanIdx) {
        models[i].position.set(0, 0.75, 0)
      } else if (i === lenskiiIdx) {
        models[i].position.set(0, 0.9, 0)
      } else if (i === nerungrinIdx) {
        models[i].position.set(0, -1.5, 0)
      } else if (i === aldskiiIdx) {
        models[i].position.set(0, -1, 0)
      } else if (i === olekminIdx) {
        models[i].position.set(0, -0.5, 0)
      } else if (i === ustmayIdx) {
        models[i].position.set(0, -0.5, 0)
      } else if (i === amginIdx) {
        models[i].position.set(0, -0.2, 0)
      } else if (i === suntarskiiIdx) {
        models[i].position.set(0, 1, 0)
      } else {
        models[i].position.set(0, 0, 0)
      }

      scene.add(models[i])
      addMaterialsToModel(models[i])

      modelsLoadedCount++
      if (modelsLoadedCount === modelFiles.length) {
        setupCameraCentered(models)
        allModelsLoaded = true
        animate()
      }
    },
    undefined,
    (error) => console.error(`Error loading model model/${file}.gltf:`, error)
  )
})

scene.add(new THREE.AmbientLight('white', 4.5))
const dirLight = new THREE.DirectionalLight('orange', 0.8)
dirLight.position.set(0, 0.5, 0)
scene.add(dirLight)

window.addEventListener('resize', () => {
  const width = window.innerWidth
  const height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  bloomPass.setSize(width, height)
  outlinePass.setSize(width, height)
  controls.update()
})

// --- Элемент для текста внизу экрана ---
let infoText = document.createElement('div')
infoText.id = 'info-text'
infoText.style.position = 'fixed'
infoText.style.left = '50%'
infoText.style.bottom = '40px'
infoText.style.transform = 'translateX(-50%)'
infoText.style.padding = '10px 24px'
infoText.style.background = 'rgba(255, 255, 255, 0.34)'
infoText.style.color = 'black'
infoText.style.fontSize = '22px'
infoText.style.borderRadius = '12px'
infoText.style.pointerEvents = 'none'
infoText.style.fontFamily = 'sans-serif'
infoText.style.zIndex = '100'
infoText.style.display = 'none'
infoText.style.fontWeight = 'bold'
document.body.appendChild(infoText)

// --- Наведение мыши и эффекты ---
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
mouse.x = -0.8
mouse.y = 0

const hoverHeight = 0.2
const normalY = 0

// --- Флаг сайта ---
let isSiteActive = false;


let anabarFalling = true
let olenekFalling = true
let bulunFalling = true
let mirninskiFalling = true
let ziganskiiFalling = true
let nurbinskiiFalling = true
let ustyanskiiFalling = true
let evenobitFalling = true
let allaihovFalling = true
let verhoyanFalling = true
let lenskiiFalling = true
let suntarskiiFalling = true

// --- Обработчик мыши (блокируем если сайт) ---
window.addEventListener('mousemove', (event) => {
  if (isSiteActive) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
})

// --- Двойной клик по canvas ---
renderer.domElement.addEventListener('dblclick', (event) => {
  const yakutskSite = document.getElementById('yakutsk-site');
  const canvas = document.getElementById('three-canvas');
  if (!yakutskSite || isSiteActive) return;

  const mouseClick = new THREE.Vector2();
  mouseClick.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouseClick.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouseClick, camera);

  let intersectedModelIndex = -1;
  for (let i = 0; i < models.length; i++) {
    if (!models[i]) continue;
    const intersects = raycaster.intersectObject(models[i], true);
    if (intersects.length > 0) {
      intersectedModelIndex = i;
      break;
    }
  }

  if (intersectedModelIndex === 0) {
    yakutskSite.style.display = 'block';
    isSiteActive = true;
    controls.enabled = false;
    canvas.style.opacity = '0';
  } else if (intersectedModelIndex === aldskiiIdx) {
    aldanSite.style.display = 'block';
    isSiteActive = true;
    controls.enabled = false;
    canvas.style.opacity = '0';
  } else if (intersectedModelIndex === nerungrinIdx) {
    nerunSite.style.display = 'block';
    isSiteActive = true;
    controls.enabled = false;
    canvas.style.opacity = '0';
  } else if (intersectedModelIndex === olekminIdx) {
    olekminSite.style.display = 'block';
    isSiteActive = true;
    controls.enabled = false;
    canvas.style.opacity = '0';
  } else if (intersectedModelIndex === lenskiiIdx) {
    lenskSite.style.display = 'block';
    isSiteActive = true;
    controls.enabled = false;
    canvas.style.opacity = '0';
  } else if (intersectedModelIndex === amginIdx) {
    amginSite.style.display = 'block';
    isSiteActive = true;
    controls.enabled = false;
    canvas.style.opacity = '0';
  } else if (intersectedModelIndex === mirninskiiIdx) {
    mirninSite.style.display = 'block';
    isSiteActive = true;
    controls.enabled = false;
    canvas.style.opacity = '0';
  } else if (intersectedModelIndex === olenekIdx) {
    olenekSite.style.display = 'block';
    isSiteActive = true;
    controls.enabled = false;
    canvas.style.opacity = '0';
  } else if (intersectedModelIndex === anabarIdx) {
    anabarSite.style.display = 'block';
    isSiteActive = true;
    controls.enabled = false;
    canvas.style.opacity = '0';
  } else if (intersectedModelIndex === bulunIdx) {
    bulunSite.style.display = 'block';
    isSiteActive = true;
    controls.enabled = false;
    canvas.style.opacity = '0';
  } else if (intersectedModelIndex === ustyanskiiIdx) {
    ustyanSite.style.display = 'block';
    isSiteActive = true;
    controls.enabled = false;
    canvas.style.opacity = '0';
  } else if (intersectedModelIndex === allaihovIdx) {
    allaihovSite.style.display = 'block';
    isSiteActive = true;
    controls.enabled = false;
    canvas.style.opacity = '0';
  } else if (intersectedModelIndex === namsiIdx) {
    namsiSite.style.display = 'block';
    isSiteActive = true;
    controls.enabled = false;
    canvas.style.opacity = '0';
  }
});

function checkImagesVisibility() {
  const images = yakutskSite.querySelectorAll('.scrollImage');
  const triggerPoint = window.innerHeight * 0.85;

  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      img.classList.add('visible');
    } else {
      img.classList.remove('visible');
    }
  });
}
yakutskSite.addEventListener('scroll', checkImagesVisibility);
window.addEventListener('load', checkImagesVisibility);


const aldanSite = document.getElementById('aldan-site');
function checkAldanImagesVisibility() {
  const images = aldanSite.querySelectorAll('.scrollImage');
  const triggerPoint = window.innerHeight * 0.85;
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      img.classList.add('visible');
    } else {
      img.classList.remove('visible');
    }
  });
}
aldanSite.addEventListener('scroll', checkAldanImagesVisibility);
window.addEventListener('load', checkAldanImagesVisibility);


const nerunSite = document.getElementById('nerun-site');
function checkNerunImagesVisibility() {
  const images = nerunSite.querySelectorAll('.scrollImage');
  const triggerPoint = window.innerHeight * 0.85;
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      img.classList.add('visible');
    } else {
      img.classList.remove('visible');
    }
  });
}
nerunSite.addEventListener('scroll', checkNerunImagesVisibility);
window.addEventListener('load', checkNerunImagesVisibility);


const olekminSite = document.getElementById('olekmin-site');
function checkOlekminImagesVisibility() {
  const images = olekminSite.querySelectorAll('.scrollImage');
  const triggerPoint = window.innerHeight * 0.85;
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      img.classList.add('visible');
    } else {
      img.classList.remove('visible');
    }
  });
}
olekminSite.addEventListener('scroll', checkOlekminImagesVisibility);
window.addEventListener('load', checkOlekminImagesVisibility);


const lenskSite = document.getElementById('lensk-site');
function checkLenskImagesVisibility() {
  const images = lenskSite.querySelectorAll('.scrollImage');
  const triggerPoint = window.innerHeight * 0.85;
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      img.classList.add('visible');
    } else {
      img.classList.remove('visible');
    }
  });
}
lenskSite.addEventListener('scroll', checkLenskImagesVisibility);
window.addEventListener('load', checkLenskImagesVisibility);


const amginSite = document.getElementById('amgin-site');
function checkAmginImagesVisibility() {
  const images = amginSite.querySelectorAll('.scrollImage');
  const triggerPoint = window.innerHeight * 0.85;
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      img.classList.add('visible');
    } else {
      img.classList.remove('visible');
    }
  });
}
amginSite.addEventListener('scroll', checkAmginImagesVisibility);
window.addEventListener('load', checkAmginImagesVisibility);


const mirninSite = document.getElementById('mirnin-site');
function checkMirninImagesVisibility() {
  const images = mirninSite.querySelectorAll('.scrollImage');
  const triggerPoint = window.innerHeight * 0.85;
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      img.classList.add('visible');
    } else {
      img.classList.remove('visible');
    }
  });
}
mirninSite.addEventListener('scroll', checkMirninImagesVisibility);
window.addEventListener('load', checkMirninImagesVisibility);


const olenekSite = document.getElementById('olenek-site');
function checkOlenekImagesVisibility() {
  const images = olenekSite.querySelectorAll('.scrollImage');
  const triggerPoint = window.innerHeight * 0.85;
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      img.classList.add('visible');
    } else {
      img.classList.remove('visible');
    }
  });
}
olenekSite.addEventListener('scroll', checkOlenekImagesVisibility);
window.addEventListener('load', checkOlenekImagesVisibility);


const bulunSite = document.getElementById('bulun-site');
function checkBulunImagesVisibility() {
  const images = bulunSite.querySelectorAll('.scrollImage');
  const triggerPoint = window.innerHeight * 0.85;
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      img.classList.add('visible');
    } else {
      img.classList.remove('visible');
    }
  });
}
bulunSite.addEventListener('scroll', checkBulunImagesVisibility);
window.addEventListener('load', checkBulunImagesVisibility);


const anabarSite = document.getElementById('anabar-site');
function checkAnabarImagesVisibility() {
  const images = anabarSite.querySelectorAll('.scrollImage');
  const triggerPoint = window.innerHeight * 0.85;
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      img.classList.add('visible');
    } else {
      img.classList.remove('visible');
    }
  });
}
anabarSite.addEventListener('scroll', checkAnabarImagesVisibility);
window.addEventListener('load', checkAnabarImagesVisibility);


const ustyanSite = document.getElementById('ustyan-site');
function checkUstyanImagesVisibility() {
  const images = ustyanSite.querySelectorAll('.scrollImage');
  const triggerPoint = window.innerHeight * 0.85;
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      img.classList.add('visible');
    } else {
      img.classList.remove('visible');
    }
  });
}
ustyanSite.addEventListener('scroll', checkUstyanImagesVisibility);
window.addEventListener('load', checkUstyanImagesVisibility);


const allaihovSite = document.getElementById('allaihov-site');
function checkAllaihovImagesVisibility() {
  const images = allaihovSite.querySelectorAll('.scrollImage');
  const triggerPoint = window.innerHeight * 0.85;
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      img.classList.add('visible');
    } else {
      img.classList.remove('visible');
    }
  });
}
allaihovSite.addEventListener('scroll', checkAllaihovImagesVisibility);
window.addEventListener('load', checkAllaihovImagesVisibility);


const namsiSite = document.getElementById('namsi-site');
function checkNamsiImagesVisibility() {
  const images = namsiSite.querySelectorAll('.scrollImage');
  const triggerPoint = window.innerHeight * 0.85;
  images.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      img.classList.add('visible');
    } else {
      img.classList.remove('visible');
    }
  });
}
namsiSite.addEventListener('scroll', checkNamsiImagesVisibility);
window.addEventListener('load', checkNamsiImagesVisibility);

export function showYakutskSite() {
  yakutskSite.style.display = 'block';
  yakutskSite.scrollTop = 0;
  checkImagesVisibility();  
}
export function showAldanrSite() {
  aldanSite.style.display = 'block';
  aldanSite.scrollTop = 0;
  checkImagesVisibility();  
}
export function showNerunSite() {
  nerunSite.style.display = 'block';
  nerunSite.scrollTop = 0;
  checkImagesVisibility();  
}
export function showOlekminSite() {
  olekminSite.style.display = 'block';
  olekminSite.scrollTop = 0;
  checkImagesVisibility();  
}
export function showLenskSite() {
  lenskSite.style.display = 'block';
  lenskSite.scrollTop = 0;
  checkImagesVisibility();  
}
export function showAmginSite() {
  amginSite.style.display = 'block';
  amginSite.scrollTop = 0;
  checkImagesVisibility();  
}
export function showMirninSite() {
  mirninSite.style.display = 'block';
  mirninSite.scrollTop = 0;
  checkImagesVisibility();  
}export function showOlenekSite() {
  olenekSite.style.display = 'block';
  olenekSite.scrollTop = 0;
  checkImagesVisibility();  
}export function showAnabarSite() {
  anabarSite.style.display = 'block';
  anabarSite.scrollTop = 0;
  checkImagesVisibility();  
}export function showBulunSite() {
  bulunSite.style.display = 'block';
  bulunSite.scrollTop = 0;
  checkImagesVisibility();  
}export function showUstyanSite() {
  ustyanSite.style.display = 'block';
  ustyanSite.scrollTop = 0;
  checkImagesVisibility();  
}export function showAllaihovSite() {
  allaihovSite.style.display = 'block';
  allaihovSite.scrollTop = 0;
  checkImagesVisibility();  
}export function showNamsiSite() {
  namsiSite.style.display = 'block';
  namsiSite.scrollTop = 0;
  checkImagesVisibility();  
}
document.getElementById('yakutsk-site').addEventListener('click', function(e) {
  if (e.target.id === 'back-to-3d') {
    this.style.display = 'none';
    isSiteActive = false;
    controls.enabled = true;
    canvas.style.opacity = '1';
    animate();
  }
});
aldanSite.addEventListener('click', function(e) {
  if (e.target.id === 'back-to-3d') {
    this.style.display = 'none';
    isSiteActive = false;
    controls.enabled = true;
    canvas.style.opacity = '1';
    animate();
  }
});
nerunSite.addEventListener('click', function(e) {
  if (e.target.id === 'back-to-3d') {
    this.style.display = 'none';
    isSiteActive = false;
    controls.enabled = true;
    canvas.style.opacity = '1';
    animate();
  }
});
olekminSite.addEventListener('click', function(e) {
  if (e.target.id === 'back-to-3d') {
    this.style.display = 'none';
    isSiteActive = false;
    controls.enabled = true;
    canvas.style.opacity = '1';
    animate();
  }
});
lenskSite.addEventListener('click', function(e) {
  if (e.target.id === 'back-to-3d') {
    this.style.display = 'none';
    isSiteActive = false;
    controls.enabled = true;
    canvas.style.opacity = '1';
    animate();
  }
});
amginSite.addEventListener('click', function(e) {
  if (e.target.id === 'back-to-3d') {
    this.style.display = 'none';
    isSiteActive = false;
    controls.enabled = true;
    canvas.style.opacity = '1';
    animate();
  }
});
mirninSite.addEventListener('click', function(e) {
  if (e.target.id === 'back-to-3d') {
    this.style.display = 'none';
    isSiteActive = false;
    controls.enabled = true;
    canvas.style.opacity = '1';
    animate();
  }
});
olenekSite.addEventListener('click', function(e) {
  if (e.target.id === 'back-to-3d') {
    this.style.display = 'none';
    isSiteActive = false;
    controls.enabled = true;
    canvas.style.opacity = '1';
    animate();
  }
});
anabarSite.addEventListener('click', function(e) {
  if (e.target.id === 'back-to-3d') {
    this.style.display = 'none';
    isSiteActive = false;
    controls.enabled = true;
    canvas.style.opacity = '1';
    animate();
  }
});
bulunSite.addEventListener('click', function(e) {
  if (e.target.id === 'back-to-3d') {
    this.style.display = 'none';
    isSiteActive = false;
    controls.enabled = true;
    canvas.style.opacity = '1';
    animate();
  }
});
ustyanSite.addEventListener('click', function(e) {
  if (e.target.id === 'back-to-3d') {
    this.style.display = 'none';
    isSiteActive = false;
    controls.enabled = true;
    canvas.style.opacity = '1';
    animate();
  }
});
allaihovSite.addEventListener('click', function(e) {
  if (e.target.id === 'back-to-3d') {
    this.style.display = 'none';
    isSiteActive = false;
    controls.enabled = true;
    canvas.style.opacity = '1';
    animate();
  }
});
namsiSite.addEventListener('click', function(e) {
  if (e.target.id === 'back-to-3d') {
    this.style.display = 'none';
    isSiteActive = false;
    controls.enabled = true;
    canvas.style.opacity = '1';
    animate();
  }
});

function animate() {
  if (!allModelsLoaded) return
  if (isSiteActive) return

  requestAnimationFrame(animate)
  controls.update()

  // Наведение
  let hoveredIdx = -1
  models.forEach((obj, idx) => {
    if (!obj) return
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObject(obj, true)
    if (intersects.length > 0) hoveredIdx = idx
  })

  // OUTLINE: выделяем объект для OutlinePass
  if (hoveredIdx !== -1 && models[hoveredIdx]) {
    outlinePass.selectedObjects = [models[hoveredIdx]]
  } else {
    outlinePass.selectedObjects = []
  }

  // Текст
  if (hoveredIdx !== -1) {
    infoText.style.display = 'block'
    infoText.textContent = modelTexts[hoveredIdx] || ''
  } else {
    infoText.style.display = 'none'
  }

  // Подсветка, затемнение, плавный подъём
  models.forEach((obj, idx) => {
    if (!obj) return
    const hovered = idx === hoveredIdx

    obj.traverse((child) => {
      if (child.isMesh) {
        if (hovered) {
          child.material = child.userData.highlightMaterial
        } else if (hoveredIdx !== -1) {
          child.material = child.userData.dimMaterial
        } else {
          child.material = child.userData.originalMaterial
        }
      }
    })

    obj.traverse((child) => {
      if (child.isMesh && child.material.emissiveIntensity !== undefined) {
        let targetIntensity = hovered ? 0 : 0
        child.material.emissiveIntensity += (targetIntensity - child.material.emissiveIntensity) * 0.1
        child.material.needsUpdate = true
      }
    })

    const isFalling = (
      (idx === anabarIdx && anabarFalling) ||
      (idx === olenekIdx && olenekFalling) ||
      (idx === bulunIdx && bulunFalling) ||
      (idx === mirninskiiIdx && mirninskiFalling) ||
      (idx === ziganskiiIdx && ziganskiiFalling) ||
      (idx === nurbinskiiIdx && nurbinskiiFalling) ||
      (idx === ustyanskiiIdx && ustyanskiiFalling) ||
      (idx === evenobitIdx && evenobitFalling) ||
      (idx === allaihovIdx && allaihovFalling) ||
      (idx === verhoyanIdx && verhoyanFalling) ||
      (idx === lenskiiIdx && lenskiiFalling) ||
      (idx === suntarskiiIdx && suntarskiiFalling)
    )
    if (!isFalling) {
      const targetY = hovered ? hoverHeight : normalY
      obj.position.y += (targetY - obj.position.y) * 0.1
    }
  })

  // Анимация падения для всех нужных моделей
  if (models[anabarIdx] && anabarFalling) {
    let targetY = 0
    let speed = 0.06
    if (models[anabarIdx].position.y > targetY) {
      models[anabarIdx].position.y -= speed
      if (models[anabarIdx].position.y <= targetY) {
        models[anabarIdx].position.y = targetY
        anabarFalling = false
      }
    }
  }
  if (models[olenekIdx] && olenekFalling) {
    let targetY = 0
    let speed = 0.06
    if (models[olenekIdx].position.y > targetY) {
      models[olenekIdx].position.y -= speed
      if (models[olenekIdx].position.y <= targetY) {
        models[olenekIdx].position.y = targetY
        olenekFalling = false
      }
    }
  }
  if (models[bulunIdx] && bulunFalling) {
    let targetY = 0
    let speed = 0.055
    if (models[bulunIdx].position.y > targetY) {
      models[bulunIdx].position.y -= speed
      if (models[bulunIdx].position.y <= targetY) {
        models[bulunIdx].position.y = targetY
        bulunFalling = false
      }
    }
  }
  if (models[mirninskiiIdx] && mirninskiFalling) {
    let targetY = 0
    let speed = 0.055
    if (models[mirninskiiIdx].position.y > targetY) {
      models[mirninskiiIdx].position.y -= speed
      if (models[mirninskiiIdx].position.y <= targetY) {
        models[mirninskiiIdx].position.y = targetY
        mirninskiFalling = false
      }
    }
  }
  if (models[ziganskiiIdx] && ziganskiiFalling) {
    let targetY = 0
    let speed = 0.04
    if (models[ziganskiiIdx].position.y > targetY) {
      models[ziganskiiIdx].position.y -= speed
      if (models[ziganskiiIdx].position.y <= targetY) {
        models[ziganskiiIdx].position.y = targetY
        ziganskiiFalling = false
      }
    }
  }
  if (models[nurbinskiiIdx] && nurbinskiiFalling) {
    let targetY = 0
    let speed = 0.032 
    if (models[nurbinskiiIdx].position.y > targetY) {
      models[nurbinskiiIdx].position.y -= speed
      if (models[nurbinskiiIdx].position.y <= targetY) {
        models[nurbinskiiIdx].position.y = targetY
        nurbinskiiFalling = false
      }
    }
  }
  if (models[ustyanskiiIdx] && ustyanskiiFalling) {
    let targetY = 0
    let speed = 0.06 
    if (models[ustyanskiiIdx].position.y > targetY) {
      models[ustyanskiiIdx].position.y -= speed
      if (models[ustyanskiiIdx].position.y <= targetY) {
        models[ustyanskiiIdx].position.y = targetY
        ustyanskiiFalling = false
      }
    }
  }
  if (models[evenobitIdx] && evenobitFalling) {
    let targetY = 0
    let speed = 0.05 
    if (models[evenobitIdx].position.y > targetY) {
      models[evenobitIdx].position.y -= speed
      if (models[evenobitIdx].position.y <= targetY) {
        models[evenobitIdx].position.y = targetY
        evenobitFalling = false
      }
    }
  }
  if (models[allaihovIdx] && allaihovFalling) {
    let targetY = 0
    let speed = 0.05 
    if (models[allaihovIdx].position.y > targetY) {
      models[allaihovIdx].position.y -= speed
      if (models[allaihovIdx].position.y <= targetY) {
        models[allaihovIdx].position.y = targetY
        allaihovFalling = false
      }
    }
  }
  if (models[verhoyanIdx] && verhoyanFalling) {
    let targetY = 0
    let speed = 0.05 
    if (models[verhoyanIdx].position.y > targetY) {
      models[verhoyanIdx].position.y -= speed
      if (models[verhoyanIdx].position.y <= targetY) {
        models[verhoyanIdx].position.y = targetY
        verhoyanFalling = false
      }
    }
  }
  if (models[lenskiiIdx] && lenskiiFalling) {
    let targetY = 0
    let speed = 0.055 
    if (models[lenskiiIdx].position.y > targetY) {
      models[lenskiiIdx].position.y -= speed
      if (models[lenskiiIdx].position.y <= targetY) {
        models[lenskiiIdx].position.y = targetY
        lenskiiFalling = false
      }
    }
  }
  if (models[suntarskiiIdx] && suntarskiiFalling) {
    let targetY = 0
    let speed = 0.05 
    if (models[suntarskiiIdx].position.y > targetY) {
      models[suntarskiiIdx].position.y -= speed
      if (models[suntarskiiIdx].position.y <= targetY) {
        models[suntarskiiIdx].position.y = targetY
        suntarskiiFalling = false
      }
    }
  }

  composer.render()
}




