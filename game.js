// Инициализация сцены
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Цвет неба

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.6; // Высота "глаз" персонажа

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Освещение
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);
scene.add(new THREE.AmbientLight(0x404040));

// Земля
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundTexture = new THREE.TextureLoader().load('assets/textures/grass.jpg');
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(10, 10);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    map: groundTexture,
    roughness: 0.9
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Деревья (упрощенная версия)
function createTree(x, z) {
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.5, 2, 8),
        new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    trunk.position.set(x, 1, z);

    const crown = new THREE.Mesh(
        new THREE.SphereGeometry(2, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x228B22 })
    );
    crown.position.set(x, 3, z);

    scene.add(trunk);
    scene.add(crown);
}

// Создаем лес
for (let i = 0; i < 20; i++) {
    createTree(
        Math.random() * 80 - 40,
        Math.random() * 80 - 40
    );
}

// Предметы для сбора
const items = [];
const itemGeometry = new THREE.SphereGeometry(0.3);
const itemMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFF6347, 
    emissive: 0xFF4500,
    emissiveIntensity: 0.5
});

function createItem(x, z) {
    const item = new THREE.Mesh(itemGeometry, itemMaterial);
    item.position.set(x, 0.3, z);
    item.userData = { type: 'forest_gift' };
    scene.add(item);
    items.push(item);
}

// Размещаем предметы
for (let i = 0; i < 10; i++) {
    createItem(
        Math.random() * 60 - 30,
        Math.random() * 60 - 30
    );
}

// Управление персонажем
const controls = new THREE.PointerLockControls(camera, document.body);
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');

document.addEventListener('click', () => {
    controls.lock();
}, false);

controls.addEventListener('lock', () => {
    blocker.style.display = 'none';
});

controls.addEventListener('unlock', () => {
    blocker.style.display = 'flex';
});

// Механика сбора
const inventory = [];
const uiElement = document.getElementById('inventory');

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyE') {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(), camera);
        
        const intersects = raycaster.intersectObjects(items);
        if (intersects.length > 0) {
            const item = intersects[0].object;
            scene.remove(item);
            items.splice(items.indexOf(item), 1);
            
            inventory.push('Дар леса');
            uiElement.textContent = `Инвентарь: ${inventory.length}/10`;
            
            // Создаем новый предмет
            createItem(
                Math.random() * 60 - 30,
                Math.random() * 60 - 30
            );
        }
    }
});

// Анимация
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Реакция на изменение размера окна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
