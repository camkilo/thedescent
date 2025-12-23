# The Descent

A third-person 3D vertical descent game built with Three.js. Players fall through a ruined stone tower, landing on platforms that break after use while fighting enemies and avoiding obstacles.

![Game Screenshot](https://github.com/user-attachments/assets/95a45c07-d179-44a9-b369-46ade16e2630)

## Features

- **Constant Falling Gameplay**: Player continuously descends through a vertical tower
- **Breaking Platforms**: Platforms crumble after being touched, adding urgency to movement
- **Mid-Air Controls**: Full movement control while falling (WASD)
- **Dash Ability**: Quick sideways dash with cooldown (SHIFT)
- **Wall Kick**: Kick off tower walls to gain height (SPACE)
- **Combat System**: Light attacks to defeat enemies (E)
- **Enemy AI**: Small enemies guard platforms and attack on sight
- **Cinematic Camera**: Smooth third-person camera that follows from above
- **Visual Effects**: 
  - Atmospheric fog
  - Falling debris
  - Cinematic lighting with rim lights
  - Realistic stone textures
  - Shadow mapping
- **Minimal UI**: 
  - Health bar (top-left)
  - Survival timer (top-right)
  - Control instructions (bottom)

## Game Mechanics

### Controls
- **W/A/S/D** - Move the player mid-air
- **SHIFT** - Dash in the direction you're moving (0.5s cooldown)
- **E** - Light attack (damages nearby enemies)
- **SPACE** - Wall kick when near tower walls (propels you toward center and upward)

### Gameplay
- Survive as long as possible while falling through the tower
- Land on platforms to slow your descent, but they break after 1 second
- Defeat red enemies that guard the platforms (3 hits each)
- Avoid falling too far or losing all health
- Use wall kicks to recover from dangerous falls
- Watch out for falling debris

### Enemies
- Small red spheres that patrol platforms
- Deal 10 damage on contact
- Have 3 health points
- Attack cooldown of 1.5 seconds
- Can be defeated with light attacks (E key)

## Installation & Running

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/camkilo/thedescent.git
cd thedescent

# Install dependencies
npm install

# Run development server
npm run dev
```

The game will be available at `http://localhost:5173/`

### Build for Production
```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## Deployment

This game is ready to deploy on various platforms:

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/camkilo/thedescent)

**Manual Deployment:**
1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Follow the prompts

The game will automatically build and deploy. Vercel configuration is included in `vercel.json`.

### Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` configuration
5. Click "Create Static Site"

**Configuration:**
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### Deploy to Netlify

1. Go to [Netlify](https://app.netlify.com/)
2. Drag and drop the `dist` folder (after running `npm run build`)
3. Or connect your Git repository for continuous deployment

**Build Settings:**
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

### Other Static Hosting

After running `npm run build`, the `dist/` folder contains all the files needed. You can deploy this folder to:
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront
- Any static file hosting service

## Technical Details

### Built With
- **Three.js** - 3D graphics library
- **Vite** - Build tool and development server
- **Vanilla JavaScript** - ES6 modules

### Architecture
- Real-time physics simulation with custom gravity
- Collision detection between player, platforms, and enemies
- Dynamic platform generation and destruction
- Smooth camera interpolation using lerp
- Performance-optimized rendering with shadow maps

### Performance
- 60 FPS target on modern hardware
- Efficient object pooling for debris
- Frustum culling via Three.js
- Optimized shadow maps (2048x2048)

## Project Structure
```
thedescent/
├── index.html          # Main HTML file
├── style.css           # Game UI styling
├── game.js             # Main game logic and Three.js scene
├── package.json        # Project dependencies
├── vercel.json         # Vercel deployment configuration
├── render.yaml         # Render deployment configuration
├── .gitignore          # Git ignore rules
└── README.md          # This file
```

## Game Design

The game features a realistic art style with smooth geometry - no voxel or low-poly aesthetics. The ruined stone tower environment creates an atmospheric descent experience with:

- Cylindrical tower walls with damage details
- Octagonal platform geometry
- Capsule player character
- Spherical enemies with emissive materials
- Procedurally generated debris
- Fog and atmospheric lighting

## Future Enhancements
- Power-ups and collectibles
- Multiple enemy types
- Boss encounters
- Leaderboard system
- Sound effects and background music
- More platform variety
- Special abilities and upgrades

## License
ISC

## Credits
Created as a demonstration of Three.js capabilities for 3D web games.
