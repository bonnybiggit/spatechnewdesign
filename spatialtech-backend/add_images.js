const fs = require('fs');

let content = fs.readFileSync('public/services.html', 'utf-8');

const replacements = [
    ["GIS Mapping & Analysis", "service-gis-mapping.png"],
    ["Enterprise GIS & Application Development", "service-enterprise-gis.png"],
    ["Drone & LiDAR Surveys", "service-drone-lidar.png"],
    ["Remote Sensing & Satellite Imagery Analysis", "service-remote-sensing.png"],
    ["Environmental Monitoring", "service-environmental-monitoring.png"],
    ["Data Visualisation & Analytics", "service-data-visualisation.png"],
    ["Capacity Building & GIS Training", "about-team.png"],
    ["Professional Services", "hero-new.png"],
    ["Data Collection & Management", "service-cyber-spatial.png"]
];

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
}

for (const [title, img] of replacements) {
    const pattern = new RegExp(`(<div class="service-card service-card-detailed fade-up">\\s*)(<div class="service-icon">[\\s\\S]*?<\\/svg>\\s*<\\/div>\\s*<h3>${escapeRegExp(title)}<\\/h3>)`, 'g');
    
    let count = 0;
    content = content.replace(pattern, (match, p1, p2) => {
        count++;
        return p1 + `<div class="service-card-image">\n                        <img src="images/${img}" alt="${title}">\n                    </div>\n                    ` + p2;
    });
    console.log(`Replaced ${title}: ${count} times`);
}

fs.writeFileSync('public/services.html', content, 'utf-8');
