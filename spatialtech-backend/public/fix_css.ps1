$cssFile = "c:\Users\HP\OneDrive\Desktop\OLUWATOBILOBA_FILES\Spatech New design 222\spatialtech-backend\public\style.css"
$content = Get-Content $cssFile -Raw

$toReplace = @'
.services::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  color: #666;
}
'@

$replacement = @'
.services::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e0eef6, transparent);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.service-card {
  background: #ffffff;
  border-radius: var(--radius-md);
  padding: 40px 32px;
  position: relative;
  overflow: hidden;
  transition: all var(--transition-base);
  border: 1px solid #e8f4fb;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--neon-blue), #7dd8f8);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-base);
}

.service-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(28, 168, 227, 0.12);
  border-color: transparent;
}

.service-card:hover::before {
  transform: scaleX(1);
}

.service-card-image {
  margin: -40px -32px 24px -32px;
  height: 200px;
  overflow: hidden;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.service-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.service-card:hover .service-card-image img {
  transform: scale(1.05);
}

.service-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background: rgba(28, 168, 227, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  transition: all var(--transition-base);
}

.service-card:hover .service-icon {
  background: var(--neon-blue);
  box-shadow: 0 4px 15px rgba(28, 168, 227, 0.3);
}

.service-icon svg {
  width: 26px;
  height: 26px;
  stroke: var(--neon-blue);
  fill: none;
  stroke-width: 1.8;
  transition: stroke var(--transition-base);
}

.service-card:hover .service-icon svg {
  stroke: #fff;
}

.service-card h3 {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1a1a2e;
}

.service-card p {
  font-size: 0.92rem;
  line-height: 1.7;
  color: #666;
}
'@

$content = $content.Replace($toReplace, $replacement)
Set-Content -Path $cssFile -Value $content -Encoding UTF8
