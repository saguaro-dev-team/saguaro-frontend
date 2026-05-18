const fs = require('fs');
const path = require('path');

const publicZapatillasDir = path.join(process.cwd(), 'public', 'zapatillas');
const manifestPath = path.join(process.cwd(), 'public', 'images-manifest.json');

const manifest = {}; // { [nombre_modelo]: { [nombre_color]: [paths...] } }

if (fs.existsSync(publicZapatillasDir)) {
    const genders = fs.readdirSync(publicZapatillasDir).filter(f => !f.startsWith('.'));
    for (const gender of genders) {
        const typeDir = path.join(publicZapatillasDir, gender);
        if (!fs.statSync(typeDir).isDirectory()) continue;

        const types = fs.readdirSync(typeDir).filter(f => !f.startsWith('.'));
        for (const type of types) {
            const modelDir = path.join(typeDir, type);
            if (!fs.statSync(modelDir).isDirectory()) continue;

            const models = fs.readdirSync(modelDir).filter(f => !f.startsWith('.'));
            for (const model of models) {
                const colorDir = path.join(modelDir, model);
                if (!fs.statSync(colorDir).isDirectory()) continue;

                // To ensure clean model names: "Chaser 1", etc.
                const cleanModelName = model.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                if (!manifest[cleanModelName]) {
                    manifest[cleanModelName] = {};
                }

                const colors = fs.readdirSync(colorDir).filter(f => !f.startsWith('.'));
                for (const color of colors) {
                    const imgDir = path.join(colorDir, color);
                    if (!fs.statSync(imgDir).isDirectory()) continue;

                    // Clean color name
                    const cleanColorName = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();

                    const images = fs.readdirSync(imgDir).filter(f => !f.startsWith('.') && (f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')));
                    
                    const imagePaths = images.map(img => `/zapatillas/${gender}/${type}/${model}/${color}/${img}`);
                    
                    manifest[cleanModelName][cleanColorName] = imagePaths;
                }
            }
        }
    }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Manifest created at ${manifestPath}`);
