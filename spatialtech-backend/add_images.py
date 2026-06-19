import re

with open("public/services.html", "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    ("GIS Mapping & Analysis", "service-gis-mapping.png"),
    ("Enterprise GIS & Application Development", "service-enterprise-gis.png"),
    ("Drone & LiDAR Surveys", "service-drone-lidar.png"),
    ("Remote Sensing & Satellite Imagery Analysis", "service-remote-sensing.png"),
    ("Environmental Monitoring", "service-environmental-monitoring.png"),
    ("Data Visualisation & Analytics", "service-data-visualisation.png"),
    ("Capacity Building & GIS Training", "about-team.png"),
    ("Professional Services", "hero-new.png"),
    ("Data Collection & Management", "service-cyber-spatial.png")
]

for title, img in replacements:
    pattern = r'(<div class="service-card service-card-detailed fade-up">\s*)(<div class="service-icon">.*?</svg>\s*</div>\s*<h3>' + re.escape(title) + r'</h3>)'
    replacement = r'\1<div class="service-card-image">\n                        <img src="images/' + img + r'" alt="' + title + r'">\n                    </div>\n                    \2'
    content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)
    print(f"Replaced {title}: {count} times")

with open("public/services.html", "w", encoding="utf-8") as f:
    f.write(content)
