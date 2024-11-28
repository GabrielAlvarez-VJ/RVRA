window.addEventListener('load', initScene);

const trumpPositions = [
    { x: 0, y: -8, z: -30 },
    { x: 10, y: -6.5, z: -20 },
    { x: 20, y: -9, z: -10 },
    { x: 30, y: -9.5, z: 0 },
    { x: 0, y: -8.5, z: 30 },
    { x: -10, y: -6.5, z: 20 },
    { x: -20, y: -7.5, z: 10 },
    { x: -30, y: -8.5, z: 40 },
    { x: -15, y: -9.5, z: 15 },
    { x: -25, y: -7.5, z: 25 },
];

let score = 0;
let remaining = trumpPositions.length;
let round = 1;
let gameOver = false;

function initScene() {
    startRoundOne();
}

function startRoundOne() {
    remaining = trumpPositions.length;
    let orbits = document.querySelectorAll('.orbit');

    trumpPositions.forEach((pos) => {
        let trump = document.createElement('a-entity');
        trump.setAttribute('gltf-model', '#trump');
        trump.setAttribute('class', 'trump');
        trump.setAttribute('scale', '0.05 0.05 0.05');
        trump.object3D.position.set(pos.x, pos.y, pos.z);
        trump.setAttribute('shootable', '');
        document.querySelector('a-scene').appendChild(trump);

        let randomOrbit = orbits[Math.floor(Math.random() * orbits.length)];
        randomOrbit.appendChild(trump);
    });

    updateScoreDisplay();
}

function startRoundTwo() {
    remaining = trumpPositions.length;
    respawnTrumps(3);

    const center = { x: 0, y: -7.5, z: 0 };
    document.querySelectorAll('.trump').forEach((trump) => {
        trump.setAttribute('animation', `
            property: position;
            to: ${center.x} ${center.y} ${center.z};
            dur: 10000;
            easing: linear
        `);
        trump.setAttribute('check-position', '');
        trump.setAttribute('look-at-center', '');
    });

    updateScoreDisplay();
}

function updateScoreDisplay() {
    document.querySelector('#score').setAttribute('value', `Score: ${score}`);
    document.querySelector('#remaining').setAttribute('value', `Remaining: ${remaining}`);
}

function respawnTrumps(...multiplier) {
    trumpPositions.forEach((pos) => {
        let trump = document.createElement('a-entity');
        trump.setAttribute('gltf-model', '#trump');
        trump.setAttribute('class', 'trump');
        trump.setAttribute('scale', '0.05 0.05 0.05');
        trump.object3D.position.set(pos.x * multiplier, pos.y, pos.z * multiplier);
        trump.setAttribute('shootable', '');
        document.querySelector('a-scene').appendChild(trump);
    });
}

AFRAME.registerComponent('shootable', {
    init: function () {
        this.el.addEventListener('click', () => {
            if (gameOver) return;
            this.el.parentNode.removeChild(this.el);
            score++;
            remaining--;
            updateScoreDisplay();

            let shootSound = document.querySelector('#shootSound');
            if (shootSound && shootSound.components.sound) {
                shootSound.components.sound.stopSound();
                shootSound.components.sound.playSound();
            }

            if (remaining === 0) {
                if (round === 1) {
                    startRoundTwo();
                    round = 2;
                } else if (round === 2) {
                    gameOver = true;
                    alert('Congratulations! You won the game.');
                }
            }
        });
    }
});

AFRAME.registerComponent('check-position', {
    tick: function () {
        if (gameOver) return;
        const position = this.el.object3D.position;
        if (Math.abs(position.x) < 0.5 && Math.abs(position.y + 7.5) < 0.5 && Math.abs(position.z) < 0.5) {
            gameOver = true;
            alert('Game Over! You got Trumped!');
        }
    }
});

AFRAME.registerComponent('look-at-center', {
    tick: function () {
        const centerPosition = new THREE.Vector3(0, -7.5, 0);
        this.el.object3D.lookAt(centerPosition);
    }
});
