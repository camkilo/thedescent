import * as THREE from 'three';

// Game state
const game = {
    scene: null,
    camera: null,
    renderer: null,
    player: null,
    platforms: [],
    enemies: [],
    debris: [],
    keys: {},
    health: 100,
    survivalTime: 0,
    isGameOver: false,
    gravity: 0.015,
    clock: new THREE.Clock(),
    lastDashTime: 0,
    dashCooldown: 0.5,
    canWallKick: false,
    lastAttackTime: 0,
    attackCooldown: 0.3
};

// Initialize the game
function init() {
    // Setup scene
    game.scene = new THREE.Scene();
    game.scene.background = new THREE.Color(0x1a1a2e);
    game.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.015);

    // Setup camera (third-person from above)
    game.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    game.camera.position.set(0, 15, 10);
    game.camera.lookAt(0, 0, 0);

    // Setup renderer
    game.renderer = new THREE.WebGLRenderer({ antialias: true });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    game.renderer.shadowMap.enabled = true;
    game.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(game.renderer.domElement);

    // Lighting setup (cinematic)
    const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
    game.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 50, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    game.scene.add(directionalLight);

    // Rim lighting
    const rimLight1 = new THREE.DirectionalLight(0x6666ff, 0.3);
    rimLight1.position.set(-10, 10, -10);
    game.scene.add(rimLight1);

    const rimLight2 = new THREE.DirectionalLight(0xff6666, 0.2);
    rimLight2.position.set(10, -10, 10);
    game.scene.add(rimLight2);

    // Point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0xff8844, 1, 50);
    pointLight1.position.set(0, 20, 0);
    game.scene.add(pointLight1);

    // Create tower walls
    createTowerWalls();

    // Create player
    createPlayer();

    // Generate initial platforms
    generatePlatforms();

    // Generate initial enemies
    generateEnemies();

    // Setup event listeners
    setupEventListeners();

    // Start game loop
    animate();
}

// Create tower walls
function createTowerWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.9,
        metalness: 0.1
    });

    // Create cylindrical tower walls
    const wallGeometry = new THREE.CylinderGeometry(15, 15, 500, 32, 1, true);
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = -250;
    walls.receiveShadow = true;
    game.scene.add(walls);

    // Add some wall details (damaged sections)
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random() * 500 - 250;
        const brickGeometry = new THREE.BoxGeometry(2, 3, 1);
        const brick = new THREE.Mesh(brickGeometry, wallMaterial);
        brick.position.set(
            Math.cos(angle) * 14.5,
            height,
            Math.sin(angle) * 14.5
        );
        brick.rotation.y = angle;
        brick.castShadow = true;
        brick.receiveShadow = true;
        game.scene.add(brick);
    }
}

// Create player character
function createPlayer() {
    const playerGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 8, 16);
    const playerMaterial = new THREE.MeshStandardMaterial({
        color: 0x3366ff,
        roughness: 0.5,
        metalness: 0.5
    });
    
    const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
    playerMesh.castShadow = true;
    playerMesh.receiveShadow = true;

    game.player = {
        mesh: playerMesh,
        velocity: new THREE.Vector3(0, 0, 0),
        position: new THREE.Vector3(0, 10, 0),
        onPlatform: false,
        currentPlatform: null,
        isAttacking: false
    };

    playerMesh.position.copy(game.player.position);
    game.scene.add(playerMesh);
}

// Generate platforms
function generatePlatforms() {
    const platformCount = 30;
    
    for (let i = 0; i < platformCount; i++) {
        const y = i * -8 + 5;
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 6;
        
        const platformGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 8);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(
            Math.cos(angle) * radius,
            y,
            Math.sin(angle) * radius
        );
        platform.castShadow = true;
        platform.receiveShadow = true;
        
        const platformData = {
            mesh: platform,
            broken: false,
            breakTimer: 0,
            maxBreakTime: 1.0,
            touched: false
        };
        
        game.platforms.push(platformData);
        game.scene.add(platform);
    }
}

// Generate enemies
function generateEnemies() {
    game.platforms.forEach((platform, index) => {
        if (index > 2 && Math.random() > 0.6) {
            const enemyGeometry = new THREE.SphereGeometry(0.6, 8, 8);
            const enemyMaterial = new THREE.MeshStandardMaterial({
                color: 0xff3333,
                roughness: 0.6,
                metalness: 0.4,
                emissive: 0x330000,
                emissiveIntensity: 0.5
            });
            
            const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
            enemy.position.copy(platform.mesh.position);
            enemy.position.y += 1;
            enemy.castShadow = true;
            
            const enemyData = {
                mesh: enemy,
                platform: platform,
                health: 3,
                attackCooldown: 0,
                movePattern: Math.random() * Math.PI * 2
            };
            
            game.enemies.push(enemyData);
            game.scene.add(enemy);
        }
    });
}

// Create falling debris
function createDebris() {
    if (Math.random() > 0.98) {
        const debrisGeometry = new THREE.BoxGeometry(
            0.3 + Math.random() * 0.5,
            0.3 + Math.random() * 0.5,
            0.3 + Math.random() * 0.5
        );
        const debrisMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.9
        });
        
        const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 10;
        
        debris.position.set(
            Math.cos(angle) * radius,
            game.player.position.y + 30,
            Math.sin(angle) * radius
        );
        debris.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        debris.castShadow = true;
        
        const debrisData = {
            mesh: debris,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                -0.2 - Math.random() * 0.1,
                (Math.random() - 0.5) * 0.1
            ),
            rotation: new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1
            )
        };
        
        game.debris.push(debrisData);
        game.scene.add(debris);
    }
}

// Setup event listeners
function setupEventListeners() {
    window.addEventListener('keydown', (e) => {
        game.keys[e.key.toLowerCase()] = true;
        
        // Dash
        if (e.key === 'Shift' && !game.isGameOver) {
            const currentTime = game.clock.getElapsedTime();
            if (currentTime - game.lastDashTime > game.dashCooldown) {
                dash();
                game.lastDashTime = currentTime;
            }
        }
        
        // Attack
        if (e.key.toLowerCase() === 'e' && !game.isGameOver) {
            const currentTime = game.clock.getElapsedTime();
            if (currentTime - game.lastAttackTime > game.attackCooldown) {
                attack();
                game.lastAttackTime = currentTime;
            }
        }
        
        // Wall kick
        if (e.key === ' ' && !game.isGameOver && game.canWallKick) {
            wallKick();
        }
    });

    window.addEventListener('keyup', (e) => {
        game.keys[e.key.toLowerCase()] = false;
    });

    window.addEventListener('resize', () => {
        game.camera.aspect = window.innerWidth / window.innerHeight;
        game.camera.updateProjectionMatrix();
        game.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
        restartGame();
    });
}

// Player dash ability
function dash() {
    const dashSpeed = 0.5;
    let dashDirection = new THREE.Vector3(0, 0, 0);
    
    if (game.keys['a']) dashDirection.x -= 1;
    if (game.keys['d']) dashDirection.x += 1;
    if (game.keys['w']) dashDirection.z -= 1;
    if (game.keys['s']) dashDirection.z += 1;
    
    if (dashDirection.length() > 0) {
        dashDirection.normalize().multiplyScalar(dashSpeed);
        game.player.velocity.add(dashDirection);
    }
}

// Player wall kick ability
function wallKick() {
    const distanceFromCenter = Math.sqrt(
        game.player.position.x ** 2 + game.player.position.z ** 2
    );
    
    if (distanceFromCenter > 13) {
        game.player.velocity.y = 0.4;
        
        const directionToCenter = new THREE.Vector3(
            -game.player.position.x,
            0,
            -game.player.position.z
        ).normalize().multiplyScalar(0.3);
        
        game.player.velocity.x += directionToCenter.x;
        game.player.velocity.z += directionToCenter.z;
        
        game.canWallKick = false;
    }
}

// Player attack
function attack() {
    game.player.isAttacking = true;
    
    setTimeout(() => {
        game.player.isAttacking = false;
    }, 200);
    
    // Check for enemies in range
    game.enemies.forEach((enemy) => {
        const distance = game.player.position.distanceTo(enemy.mesh.position);
        if (distance < 3) {
            enemy.health -= 1;
            if (enemy.health <= 0) {
                game.scene.remove(enemy.mesh);
                game.enemies = game.enemies.filter(e => e !== enemy);
            } else {
                // Visual feedback
                enemy.mesh.material.emissiveIntensity = 1;
                setTimeout(() => {
                    if (enemy.mesh.material) {
                        enemy.mesh.material.emissiveIntensity = 0.5;
                    }
                }, 100);
            }
        }
    });
}

// Update player
function updatePlayer(deltaTime) {
    if (game.isGameOver) return;

    // Apply gravity
    game.player.velocity.y -= game.gravity;

    // Handle movement input (mid-air control)
    const moveSpeed = 0.15;
    if (game.keys['a']) game.player.velocity.x -= moveSpeed * deltaTime;
    if (game.keys['d']) game.player.velocity.x += moveSpeed * deltaTime;
    if (game.keys['w']) game.player.velocity.z -= moveSpeed * deltaTime;
    if (game.keys['s']) game.player.velocity.z += moveSpeed * deltaTime;

    // Apply velocity damping
    game.player.velocity.x *= 0.95;
    game.player.velocity.z *= 0.95;

    // Update position
    game.player.position.add(game.player.velocity);

    // Check wall collision for wall kick
    const distanceFromCenter = Math.sqrt(
        game.player.position.x ** 2 + game.player.position.z ** 2
    );
    
    if (distanceFromCenter > 14) {
        const angle = Math.atan2(game.player.position.z, game.player.position.x);
        game.player.position.x = Math.cos(angle) * 14;
        game.player.position.z = Math.sin(angle) * 14;
        game.player.velocity.x *= -0.5;
        game.player.velocity.z *= -0.5;
        game.canWallKick = true;
    } else {
        game.canWallKick = false;
    }

    // Check platform collisions
    game.player.onPlatform = false;
    
    game.platforms.forEach((platform) => {
        if (platform.broken) return;
        
        const platformPos = platform.mesh.position;
        const dx = game.player.position.x - platformPos.x;
        const dy = game.player.position.y - platformPos.y;
        const dz = game.player.position.z - platformPos.z;
        
        const horizontalDist = Math.sqrt(dx * dx + dz * dz);
        
        if (horizontalDist < 2 && dy > 0.5 && dy < 2 && game.player.velocity.y < 0) {
            game.player.position.y = platformPos.y + 1.5;
            game.player.velocity.y = 0;
            game.player.onPlatform = true;
            game.player.currentPlatform = platform;
            
            if (!platform.touched) {
                platform.touched = true;
            }
        }
    });

    // Update player mesh position
    game.player.mesh.position.copy(game.player.position);

    // Check if player fell too far
    if (game.player.position.y < -100) {
        gameOver();
    }
}

// Update platforms
function updatePlatforms(deltaTime) {
    game.platforms.forEach((platform) => {
        if (platform.touched && !platform.broken) {
            platform.breakTimer += deltaTime;
            
            // Visual feedback for breaking
            const breakProgress = platform.breakTimer / platform.maxBreakTime;
            platform.mesh.material.color.setHex(
                breakProgress > 0.7 ? 0xff4444 : 
                breakProgress > 0.4 ? 0xaa6644 : 0x8b7355
            );
            
            if (platform.breakTimer >= platform.maxBreakTime) {
                platform.broken = true;
                
                // Animate platform falling
                let fallSpeed = 0;
                const fallInterval = setInterval(() => {
                    fallSpeed += 0.05;
                    platform.mesh.position.y -= fallSpeed;
                    platform.mesh.rotation.x += 0.1;
                    platform.mesh.rotation.z += 0.05;
                    
                    if (platform.mesh.position.y < -200) {
                        clearInterval(fallInterval);
                        game.scene.remove(platform.mesh);
                    }
                }, 16);
            }
        }
    });
}

// Update enemies
function updateEnemies(deltaTime) {
    game.enemies.forEach((enemy) => {
        // Move in a pattern around the platform
        enemy.movePattern += deltaTime;
        const offset = Math.sin(enemy.movePattern) * 1.5;
        enemy.mesh.position.x = enemy.platform.mesh.position.x + offset;
        enemy.mesh.position.z = enemy.platform.mesh.position.z + Math.cos(enemy.movePattern) * 1.5;
        
        // Attack player if in range
        enemy.attackCooldown -= deltaTime;
        const distance = game.player.position.distanceTo(enemy.mesh.position);
        
        if (distance < 2.5 && enemy.attackCooldown <= 0) {
            game.health -= 10;
            enemy.attackCooldown = 1.5;
            updateHealthBar();
            
            if (game.health <= 0) {
                gameOver();
            }
        }
        
        // Visual indicator when attacking
        if (enemy.attackCooldown > 1.2) {
            enemy.mesh.scale.set(1.2, 1.2, 1.2);
        } else {
            enemy.mesh.scale.set(1, 1, 1);
        }
    });
}

// Update debris
function updateDebris(deltaTime) {
    game.debris.forEach((debris, index) => {
        debris.mesh.position.add(debris.velocity);
        debris.mesh.rotation.x += debris.rotation.x;
        debris.mesh.rotation.y += debris.rotation.y;
        debris.mesh.rotation.z += debris.rotation.z;
        
        // Remove debris that's too far away
        if (debris.mesh.position.y < game.player.position.y - 50) {
            game.scene.remove(debris.mesh);
            game.debris.splice(index, 1);
        }
    });
}

// Update camera (smooth follow from above)
function updateCamera() {
    const targetPosition = new THREE.Vector3(
        game.player.position.x,
        game.player.position.y + 15,
        game.player.position.z + 10
    );
    
    game.camera.position.lerp(targetPosition, 0.1);
    
    const lookAtTarget = new THREE.Vector3(
        game.player.position.x,
        game.player.position.y,
        game.player.position.z
    );
    
    const currentLookAt = new THREE.Vector3();
    game.camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(10).add(game.camera.position);
    
    currentLookAt.lerp(lookAtTarget, 0.1);
    game.camera.lookAt(currentLookAt);
}

// Update UI
function updateHealthBar() {
    const healthBar = document.getElementById('health-bar');
    healthBar.style.width = Math.max(0, game.health) + '%';
}

function updateSurvivalTime() {
    if (!game.isGameOver) {
        game.survivalTime = game.clock.getElapsedTime();
        const timeDisplay = document.getElementById('survival-time');
        timeDisplay.textContent = `Time: ${game.survivalTime.toFixed(1)}s`;
    }
}

// Game over
function gameOver() {
    game.isGameOver = true;
    const gameOverDiv = document.getElementById('game-over');
    const finalTimeDiv = document.getElementById('final-time');
    
    gameOverDiv.classList.remove('hidden');
    finalTimeDiv.textContent = `Survival Time: ${game.survivalTime.toFixed(1)}s`;
}

// Restart game
function restartGame() {
    // Remove all game objects
    game.platforms.forEach(p => game.scene.remove(p.mesh));
    game.enemies.forEach(e => game.scene.remove(e.mesh));
    game.debris.forEach(d => game.scene.remove(d.mesh));
    
    // Reset arrays
    game.platforms = [];
    game.enemies = [];
    game.debris = [];
    
    // Reset game state
    game.health = 100;
    game.survivalTime = 0;
    game.isGameOver = false;
    game.player.position.set(0, 10, 0);
    game.player.velocity.set(0, 0, 0);
    game.clock = new THREE.Clock();
    
    // Hide game over screen
    document.getElementById('game-over').classList.add('hidden');
    
    // Regenerate game elements
    generatePlatforms();
    generateEnemies();
    updateHealthBar();
}

// Main animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = Math.min(game.clock.getDelta(), 0.1);
    
    updatePlayer(deltaTime);
    updatePlatforms(deltaTime);
    updateEnemies(deltaTime);
    updateDebris(deltaTime);
    updateCamera();
    updateSurvivalTime();
    
    // Create falling debris
    createDebris();
    
    game.renderer.render(game.scene, game.camera);
}

// Start the game
init();
