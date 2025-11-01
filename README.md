# Diet Pop NHL Lineup Enhanced

An enhanced Diet Pop NHL Lineup application that allows users to organize their favorite diet sodas into hockey-style lineups with immersive 3D visualization and shareable lineup exports.

## Features

🏒 **NHL-Style Lineups** - Organize pops into 4 forward lines and 3 defensive pairs (18 positions total)

🥤 **3D Pop Visualization** - Click on any pop to view a beautiful 3D model with accurate branding and detailed pop cards

📄 **PDF Export** - Generate and share professional lineup cards showing your favorite pop combinations

📱 **Responsive Design** - Seamless experience across desktop, tablet, and mobile devices

## Tech Stack

- **React 18** with TypeScript
- **Three.js/React Three Fiber** for 3D visualization
- **Zustand** for state management
- **Tailwind CSS** for styling
- **React PDF** for export functionality
- **Framer Motion** for animations

## Development

This project follows a comprehensive spec-driven development approach with detailed requirements, design, and implementation planning.

See the `.kiro/specs/diet-pop-lineup-enhanced/` directory for complete project specifications.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── lineup/          # Lineup grid and position management
│   ├── 3d/              # 3D visualization components
│   ├── cards/           # Pop information cards
│   └── export/          # PDF generation components
├── stores/              # Zustand state management
├── data/                # Pop database and position data
└── assets/              # 3D models, textures, and images
```

## License

MIT License - see LICENSE file for details