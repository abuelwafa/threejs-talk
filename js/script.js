/* global THREE, Stats */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
scene.add( ambientLight );
const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
scene.add( pointLight );

const stats = new Stats();
document.body.appendChild(stats.dom);

const board = new THREE.Group();
let playItems = new THREE.Group();
board.add(playItems);

const boardCubes = [
    [2, 2, 90, 45, 0, 0],
    [2, 2, 90, 15, 0, 0],
    [2, 2, 90, -15, 0, 0],
    [2, 2, 90, -45, 0, 0],
    [90, 2, 2, 0, 0, -45],
    [90, 2, 2, 0, 0, -15],
    [90, 2, 2, 0, 0, 15],
    [90, 2, 2, 0, 0, 45]
];

boardCubes.forEach(c => {
    const geometry = new THREE.BoxGeometry(c[0], c[1], c[2]);
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = c[3];
    cube.position.y = c[4];
    cube.position.z = c[5];
    board.add(cube);
});

scene.add(board);


camera.position.z = 80;
camera.position.y = 50;
camera.lookAt(new THREE.Vector3(0, 0, 0));


const animate = () => {
    requestAnimationFrame(animate);

    board.rotation.y += 0.01;

    renderer.render(scene, camera);
    stats.update(stats.dom);
};

animate();

let gameState = new Array(9);
let currentTurn = 'x';
let playCount = 0;
let xScore = 0;
let oScore = 0;

const resetGame = () => {
    gameState = new Array(0);
    currentTurn = 'x';
    playCount = 0;

    // clear the x and o items from scene
    for (let i = playItems.children.length - 1; i >= 0; i--) {
        playItems.remove(playItems.children[i]);
    }
};


const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];


const checkForWin = () => {
    let win = false;
    for(let i = 0, l = winningCombinations.length; i < l; i++) {
        let combo = winningCombinations[i];
        if(
            gameState[combo[0]] === currentTurn &&
            gameState[combo[1]] === currentTurn &&
            gameState[combo[2]] === currentTurn
        ) {
            win = true;
            break;
        }
    }
    return win;
};


const cellCenters = [
    [-30, -30],
    [0, -30],
    [30, -30],
    [-30, 0],
    [0, 0],
    [30, 0],
    [-30, 30],
    [0, 30],
    [30, 30],
];

const switchTurn = () => {
    currentTurn = currentTurn === 'x' ? 'o' : 'x';
};

const drawO = (index) => {
    const geometry = new THREE.TorusGeometry(9, 1, 16, 100);
    const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    const torus = new THREE.Mesh(geometry, material);
    torus.rotateX(Math.PI / 2);
    torus.position.set(cellCenters[index][0], 0, cellCenters[index][1]);
    playItems.add(torus);
};

const drawX = (index) => {
    const geometry = new THREE.TorusGeometry(9, 1, 16, 100);
    const material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    const torus = new THREE.Mesh( geometry, material );
    torus.rotateX(Math.PI / 2);
    torus.position.set(cellCenters[index][0], 0, cellCenters[index][1]);
    playItems.add(torus);
};

const planeGroup = new THREE.Group();
board.add(planeGroup);
cellCenters.forEach(p => {
    const geometry = new THREE.PlaneGeometry(30, 30);
    const material = new THREE.MeshBasicMaterial( { color: 0x111111 } );
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(p[0], 0, p[1]);
    plane.rotateX(Math.PI * 3 / 2);
    planeGroup.add(plane);
});


const updateScore = () => {
    document.querySelector('.x-score').innerHTML = xScore;
    document.querySelector('.o-score').innerHTML = oScore;
};

const raycaster = new THREE.Raycaster();
renderer.domElement.addEventListener('click', event => {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(planeGroup.children);

    if(intersects.length > 0) {
        // get the index of the cell
        const cellIndex = planeGroup.children.findIndex(item => item === intersects[0].object);
        handleGamePlay(cellIndex);
    }

});


const handleGamePlay = (idx) => {
    if(!gameState[idx]) {
        gameState[idx] = currentTurn;
        currentTurn === 'x' ? drawX(idx) : drawO(idx);
        playCount++;

        if(checkForWin()) {
            if(currentTurn === 'x') {
                xScore++;
            } else {
                oScore++;
            }

            updateScore();
            resetGame();
        } else {
            if(playCount === 9) {
                resetGame();
            } else {
                switchTurn();
            }
        }
    }
};
