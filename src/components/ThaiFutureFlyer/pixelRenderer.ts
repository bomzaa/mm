// High-Fidelity Pixel Art Canvas Renderer for "Thai Future Flyer"
// Faithfully matching the high-tech Cyberpunk Bangkok Panorama, Hazard Obstacles, and Cyber Bananas!

import { Player, Obstacle, Banana, Particle, FloatingText } from './types';

export class FlyerPixelRenderer {
  // =========================================================================
  // 1. SKY LAYER: Twilight Dusk Gradient, Sunset Clouds, Cyber Stars & UFOs
  // =========================================================================
  public static drawSkyLayer(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offset: number
  ) {
    // Dusk Sunset Sky Gradient matching Image 1:
    // Deep starry navy -> twilight violet -> warm dusk magenta -> glowing sunset peach/orange
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#060a1d');    // Deep starry night
    grad.addColorStop(0.22, '#12153b'); // Navy twilight
    grad.addColorStop(0.45, '#28174e'); // Dusky violet
    grad.addColorStop(0.68, '#4c1d68'); // Sunset magenta
    grad.addColorStop(0.85, '#831843'); // Warm rose dusk
    grad.addColorStop(0.96, '#c2410c'); // Vibrant sunset orange
    grad.addColorStop(1.0, '#ea580c');  // Horizon glow
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Pixel Sunset Cloud Bands (Horizontal pixelated tiers)
    ctx.save();
    const cloudSpeed = offset * 0.04;
    const cloudColors = [
      'rgba(249, 115, 22, 0.22)',
      'rgba(244, 63, 94, 0.18)',
      'rgba(192, 38, 211, 0.15)',
    ];

    for (let c = 0; c < 3; c++) {
      ctx.fillStyle = cloudColors[c];
      const cy = height * (0.62 + c * 0.08);
      for (let i = 0; i < 6; i++) {
        const cx = ((i * 220 - cloudSpeed * (1 + c * 0.3)) % (width + 300) + width + 300) % (width + 300) - 100;
        const cw = 140 + (i % 3) * 60;
        const ch = 14 + (i % 2) * 8;
        ctx.fillRect(Math.floor(cx), Math.floor(cy), Math.floor(cw), Math.floor(ch));
      }
    }

    // Distant Twinkling Cyber Stars & High Satellites
    ctx.fillStyle = '#bae6fd';
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 67 - offset * 0.02) % width + width) % width;
      const sy = ((i * 31) % (height * 0.38)) + 12;
      const size = i % 4 === 0 ? 3 : 2;
      const alpha = (Math.sin(offset * 0.02 + i) * 0.3 + 0.7);
      ctx.globalAlpha = alpha;
      ctx.fillRect(Math.floor(sx), Math.floor(sy), size, size);
    }
    ctx.globalAlpha = 1.0;

    // Flying Saucers / Hover Vehicles (UFO Skycars from Image 1)
    this.drawSkyVehicles(ctx, width, height, offset);

    ctx.restore();
  }

  // Draw Flying Saucers (UFO Skycars) from Image 1
  private static drawSkyVehicles(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offset: number
  ) {
    const vehicles = [
      { baseSpeed: 0.14, startX: width * 0.2, y: height * 0.24, scale: 1.0 },
      { baseSpeed: 0.08, startX: width * 0.65, y: height * 0.16, scale: 0.75 },
      { baseSpeed: 0.18, startX: width * 0.85, y: height * 0.32, scale: 0.85 },
    ];

    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      const vx = ((v.startX - offset * v.baseSpeed) % (width + 260) + width + 260) % (width + 260) - 100;
      const vy = v.y + Math.sin(offset * 0.03 + i * 2) * 4;

      ctx.save();
      ctx.translate(Math.floor(vx), Math.floor(vy));
      ctx.scale(v.scale, v.scale);

      // Saucer Lower Hull (Dark Metallic Grey)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(18, 8, 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Saucer Upper Cockpit Dome
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(18, 6, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cockpit Glow Light
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(16, 4, 4, 2);

      // Cyan Glowing Thruster Ring / Antigravity Beacons (from Image 1)
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(6, 9, 4, 2);
      ctx.fillRect(16, 10, 4, 2);
      ctx.fillRect(26, 9, 4, 2);

      // Faint ion exhaust trail
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fillRect(36, 7, 24, 2);

      ctx.restore();
    }
  }

  // =========================================================================
  // 2. MID CITY LAYER: Wat Arun, Giant Swing, Thai Temples, Cyber Skyscraper
  //    Holographic Yaksha Demon, Neon Billboards & Chao Phraya River
  // =========================================================================
  public static drawMidCityLayer(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offset: number
  ) {
    const layerSpeed = offset * 0.35;
    const patternWidth = 980; // Complete skyline segment
    const startX = -((layerSpeed) % patternWidth);

    ctx.save();
    for (let x = startX - patternWidth; x < width + patternWidth; x += patternWidth) {
      this.renderFuturisticBangkokSkyline(ctx, x, height, offset);
    }
    ctx.restore();
  }

  // Render One Complete Panoramic Segment of Bangkok City from Image 1
  private static renderFuturisticBangkokSkyline(
    ctx: CanvasRenderingContext2D,
    baseX: number,
    totalHeight: number,
    offset: number
  ) {
    const groundY = totalHeight * 0.88;

    // -------------------------------------------------------------
    // A. BACKGROUND CYBER SKYSCRAPERS & HIGH-RISES
    // -------------------------------------------------------------
    // Left cluster towers
    ctx.fillStyle = '#0a1024';
    ctx.fillRect(baseX + 30, groundY - 210, 60, 210);
    ctx.fillRect(baseX + 105, groundY - 250, 48, 250);
    ctx.fillRect(baseX + 165, groundY - 190, 52, 190);

    // Center skyscraper cluster (Behind holographic yaksha)
    ctx.fillStyle = '#0d132b';
    ctx.fillRect(baseX + 370, groundY - 270, 72, 270);
    ctx.fillRect(baseX + 455, groundY - 310, 80, 310);
    ctx.fillRect(baseX + 545, groundY - 240, 64, 240);

    // Right skyscraper cluster
    ctx.fillStyle = '#0a1024';
    ctx.fillRect(baseX + 620, groundY - 280, 75, 280);
    ctx.fillRect(baseX + 710, groundY - 220, 60, 220);
    ctx.fillRect(baseX + 850, groundY - 230, 80, 230);

    // Illuminated Skyscraper Pixel Windows (Cyan, Amber, Lavender)
    for (let i = 0; i < 18; i++) {
      const col = (i % 3);
      const row = Math.floor(i / 3);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(251, 191, 36, 0.4)';
      ctx.fillRect(baseX + 40 + col * 16, groundY - 190 + row * 18, 8, 8);
      ctx.fillRect(baseX + 470 + col * 18, groundY - 280 + row * 18, 9, 9);
      ctx.fillRect(baseX + 635 + col * 18, groundY - 250 + row * 18, 9, 8);
    }

    // Communication Spires & Red Warning Beacons
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(baseX + 128, groundY - 258, 3, 3);
    ctx.fillRect(baseX + 494, groundY - 318, 4, 4);
    ctx.fillRect(baseX + 656, groundY - 288, 3, 3);

    // -------------------------------------------------------------
    // B. WAT ARUN (พระปรางค์วัดอรุณ) - Iconic Temple of Dawn from Image 1
    // -------------------------------------------------------------
    const arunX = baseX + 70;
    const arunBaseW = 76;

    // Prang Lower Tier Terraces
    ctx.fillStyle = '#1e1c2a';
    ctx.fillRect(arunX, groundY - 60, arunBaseW, 60);
    ctx.fillStyle = '#d97706'; // Warm sunset gold
    ctx.fillRect(arunX + 4, groundY - 58, arunBaseW - 8, 5);
    ctx.fillRect(arunX + 8, groundY - 95, arunBaseW - 16, 37);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(arunX + 12, groundY - 93, arunBaseW - 24, 4);

    // Prang Middle Tiered Spire Body
    ctx.fillStyle = '#b45309';
    ctx.fillRect(arunX + 16, groundY - 145, arunBaseW - 32, 50);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(arunX + 20, groundY - 142, arunBaseW - 40, 4);

    // Prang Upper Spire Pyramid
    ctx.beginPath();
    ctx.moveTo(arunX + 22, groundY - 145);
    ctx.lineTo(arunX + arunBaseW / 2, groundY - 235);
    ctx.lineTo(arunX + arunBaseW - 22, groundY - 145);
    ctx.closePath();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // Spire Golden Crown & Trident (นภศูล)
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(arunX + arunBaseW / 2 - 2, groundY - 246, 4, 11);
    ctx.fillRect(arunX + arunBaseW / 2 - 5, groundY - 242, 10, 2);

    // Surrounding Satellite Prangs (Prang Thit)
    ctx.fillStyle = '#92400e';
    ctx.fillRect(arunX - 12, groundY - 75, 14, 75);
    ctx.fillRect(arunX + arunBaseW - 2, groundY - 75, 14, 75);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(arunX - 8, groundY - 73, 6, 3);
    ctx.fillRect(arunX + arunBaseW + 2, groundY - 73, 6, 3);

    // -------------------------------------------------------------
    // C. HOLOGRAPHIC YAKSHA DEMON (ยักษ์ทศกัณฐ์) from Image 1
    // -------------------------------------------------------------
    const yakshaX = baseX + 400;
    const yakshaY = groundY - 245;

    ctx.save();
    // Neon Cyan Hologram Border Glow Box
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(yakshaX - 18, yakshaY - 10, 52, 65);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
    ctx.fillRect(yakshaX - 18, yakshaY - 10, 52, 65);

    // Holographic Yaksha Face (Pixel art lines)
    ctx.fillStyle = '#38bdf8';
    // Crown Spire
    ctx.fillRect(yakshaX + 6, yakshaY - 6, 4, 8);
    ctx.fillRect(yakshaX + 4, yakshaY + 2, 8, 3);
    // Forehead & Eyebrows
    ctx.fillRect(yakshaX + 1, yakshaY + 7, 14, 3);
    // Piercing Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(yakshaX + 3, yakshaY + 12, 3, 2);
    ctx.fillRect(yakshaX + 10, yakshaY + 12, 3, 2);
    // Fierce Fangs & Mouth
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(yakshaX + 2, yakshaY + 16, 12, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(yakshaX + 2, yakshaY + 19, 2, 4);  // Left fang
    ctx.fillRect(yakshaX + 12, yakshaY + 19, 2, 4); // Right fang
    // Royal Thai Ear Ornaments (กรรเจียกจร)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(yakshaX - 4, yakshaY + 10, 4, 8);
    ctx.fillRect(yakshaX + 16, yakshaY + 10, 4, 8);

    // Thai Traditional Motif ❖ beneath hologram
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('❖', yakshaX + 8, yakshaY + 45);
    ctx.restore();

    // -------------------------------------------------------------
    // D. VERTICAL NEON SIGNS from Image 1:
    //    "อนาคต เริ่มได้ ที่ไทย" & "CULTURE X TECHNOLOGY X PEOPLE"
    // -------------------------------------------------------------
    // Sign 1: "อนาคต เริ่มได้ ที่ไทย"
    const sign1X = baseX + 485;
    const sign1Y = groundY - 265;
    ctx.save();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sign1X, sign1Y, 44, 75);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.fillRect(sign1X, sign1Y, 44, 75);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('อนาคต', sign1X + 22, sign1Y + 18);
    ctx.fillText('เริ่มได้', sign1X + 22, sign1Y + 34);
    ctx.fillText('ที่ไทย', sign1X + 22, sign1Y + 50);
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('❖', sign1X + 22, sign1Y + 66);
    ctx.restore();

    // Sign 2: "CULTURE X TECHNOLOGY X PEOPLE"
    const sign2X = baseX + 760;
    const sign2Y = groundY - 215;
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sign2X, sign2Y, 44, 65);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
    ctx.fillRect(sign2X, sign2Y, 44, 65);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CULTURE', sign2X + 22, sign2Y + 16);
    ctx.fillStyle = '#facc15';
    ctx.fillText('X', sign2X + 22, sign2Y + 26);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('TECHNOLOGY', sign2X + 22, sign2Y + 36);
    ctx.fillStyle = '#facc15';
    ctx.fillText('X', sign2X + 22, sign2Y + 46);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PEOPLE', sign2X + 22, sign2Y + 56);
    ctx.restore();

    // -------------------------------------------------------------
    // E. THE GIANT SWING (เสาชิงช้า) from Image 1
    // -------------------------------------------------------------
    const swingX = baseX + 830;
    const swingH = 120;
    const swingY = groundY - swingH;

    // Two tall red wooden pillars angled slightly
    ctx.fillStyle = '#b91c1c'; // Vermilion red timber
    // Left pillar
    ctx.fillRect(swingX, swingY, 6, swingH);
    // Right pillar
    ctx.fillRect(swingX + 38, swingY, 6, swingH);
    // Top Arch Crossbeams
    ctx.fillRect(swingX - 4, swingY, 52, 6);
    ctx.fillRect(swingX - 2, swingY + 12, 48, 5);
    // Golden carved ornamental peak at top center
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(swingX + 18, swingY - 10, 8, 10);
    ctx.fillRect(swingX + 20, swingY - 14, 4, 4);

    // -------------------------------------------------------------
    // F. TRADITIONAL THAI TEMPLE ROOFS & PAVILIONS (วัดสุทัศน์ / วัดพระแก้ว)
    // -------------------------------------------------------------
    const templeX = baseX + 680;
    // Multi-tiered orange and gold tiled roofs
    // Tier 1
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.moveTo(templeX - 8, groundY - 60);
    ctx.lineTo(templeX + 45, groundY - 95);
    ctx.lineTo(templeX + 98, groundY - 60);
    ctx.closePath();
    ctx.fill();
    // Tier 2
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(templeX + 6, groundY - 88);
    ctx.lineTo(templeX + 45, groundY - 120);
    ctx.lineTo(templeX + 84, groundY - 88);
    ctx.closePath();
    ctx.fill();
    // Chofa Finials (Curved golden horn peaks)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(templeX + 43, groundY - 132, 4, 12);
    ctx.fillRect(templeX - 6, groundY - 68, 4, 8);
    ctx.fillRect(templeX + 94, groundY - 68, 4, 8);

    // -------------------------------------------------------------
    // G. CONTINUOUS ELEVATED SKYWAY VIADUCT BRIDGE (from Image 1)
    // -------------------------------------------------------------
    const viaductY = groundY - 32;
    // Viaduct Deck Beam
    ctx.fillStyle = '#334155';
    ctx.fillRect(baseX, viaductY, 980, 10);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(baseX, viaductY, 980, 2);
    ctx.fillRect(baseX, viaductY + 8, 980, 2);

    // Viaduct Support Columns descending into river
    for (let c = 0; c < 12; c++) {
      const px = baseX + 30 + c * 80;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px, viaductY + 10, 14, 22);
      ctx.fillStyle = '#475569';
      ctx.fillRect(px + 2, viaductY + 10, 3, 22);
    }

    // -------------------------------------------------------------
    // H. CHAO PHRAYA RIVER & SHIMMERING WATER REFLECTIONS
    // -------------------------------------------------------------
    const riverY = groundY;
    const riverHeight = totalHeight - riverY;

    // Deep water gradient
    const waterGrad = ctx.createLinearGradient(0, riverY, 0, totalHeight);
    waterGrad.addColorStop(0, '#0a192f');
    waterGrad.addColorStop(0.4, '#0c223c');
    waterGrad.addColorStop(1.0, '#040d1a');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(baseX, riverY, 980, riverHeight);

    // Vibrant Pixel Water Reflections (Gold, Orange, Cyan)
    const waveOffset = (offset * 0.8) % 180;
    // Golden temple reflections
    ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
    for (let w = 0; w < 14; w++) {
      const rx = baseX + 60 + w * 22;
      const ry = riverY + 4 + (w % 4) * 6;
      ctx.fillRect(rx, ry, 18, 2);
    }
    // Cyan neon reflections
    ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
    for (let w = 0; w < 16; w++) {
      const rx = baseX + 420 + w * 24;
      const ry = riverY + 3 + (w % 5) * 5;
      ctx.fillRect(rx, ry, 20, 2);
    }
    // Orange sunset river ripples
    ctx.fillStyle = 'rgba(234, 88, 12, 0.35)';
    for (let w = 0; w < 24; w++) {
      const rx = baseX + w * 40;
      const ry = riverY + 8 + (w % 3) * 8;
      ctx.fillRect(rx, ry, 24, 2);
    }
  }

  // =========================================================================
  // 3. FOREGROUND LAYER: High-Tech Observation Bridge / Corridor Framing
  //    - Bolted steel beam with embedded cyan neon lamps
  //    - Suspended sign: "BANGKOK >>> กรุงเทพฯ"
  //    - Vertical columns with amber lights & traditional Thai gold plaques:
  //      "THAI TO THE FUTURE ❖" & "TRADITION DRIVES X BRIGHTER TOMORROW ❖"
  //    - Bottom walkway balustrade with amber hazard lamps
  // =========================================================================
  public static drawForegroundLayer(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offset: number
  ) {
    const groundY = height * 0.88;

    // -------------------------------------------------------------
    // TOP STRUCTURAL CEILING BEAM (Industrial Steel with Cyan Neon Lamps)
    // -------------------------------------------------------------
    const ceilingH = 26;
    // Steel main girder
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, ceilingH);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, ceilingH - 4);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, ceilingH - 2, width, 2);

    // Bolted panels & joints
    ctx.fillStyle = '#475569';
    for (let x = 0; x < width; x += 90) {
      ctx.fillRect(x, 2, 2, ceilingH - 6);
      ctx.fillRect(x + 4, 4, 3, 3); // Bolt
      ctx.fillRect(x + 4, ceilingH - 9, 3, 3);
    }

    // Embedded Horizontal Glowing Cyan Neon Lamps (from Image 1)
    for (let x = 40; x < width; x += 180) {
      // Outer neon glow
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.fillRect(x - 2, 8, 48, 8);
      // Main cyan lamp
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(x, 10, 44, 4);
      // Bright white core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 4, 11, 36, 2);
    }

    // -------------------------------------------------------------
    // OVERHEAD SUSPENDED SIGN: "BANGKOK >>> กรุงเทพฯ"
    // -------------------------------------------------------------
    const signX = ((width * 0.72 - offset * 0.4) % (width + 300) + width + 300) % (width + 300) - 100;
    const signY = 16;
    const signW = 126;
    const signH = 34;

    ctx.save();
    // Metallic Hanger Brackets
    ctx.fillStyle = '#334155';
    ctx.fillRect(signX + 16, 0, 4, signY);
    ctx.fillRect(signX + signW - 20, 0, 4, signY);

    // Sign Box Frame
    ctx.fillStyle = '#090d16';
    ctx.fillRect(signX, signY, signW, signH);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(signX, signY, signW, signH);

    // Cyan Text: "BANGKOK >>>" & "กรุงเทพฯ"
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('BANGKOK >>>', signX + 10, signY + 16);
    ctx.fillStyle = '#67e8f9';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('กรุงเทพฯ', signX + 10, signY + 28);
    ctx.restore();

    // -------------------------------------------------------------
    // VERTICAL STEEL PILLARS (Columns with Amber Lights & Gold Thai Plaques)
    // -------------------------------------------------------------
    const pillarSpacing = 420;
    const pillarSpeed = offset * 0.95;
    const startPillarX = -((pillarSpeed) % pillarSpacing);

    for (let px = startPillarX - pillarSpacing; px < width + pillarSpacing; px += pillarSpacing) {
      this.drawObservationPillar(ctx, px, height, groundY);
    }

    // -------------------------------------------------------------
    // BOTTOM BALUSTRADE / WALKWAY BASE (Floor Track)
    // -------------------------------------------------------------
    const baseH = height - groundY;
    // Heavy steel balustrade
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, groundY, width, baseH);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, groundY + 4, width, baseH - 4);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, groundY, width, 4);

    // Recessed Ventilation Panels & Embedded Amber Hazard Lamps
    for (let x = 20; x < width; x += 110) {
      // Recessed panel
      ctx.fillStyle = '#090d16';
      ctx.fillRect(x, groundY + 12, 80, 18);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, groundY + 12, 80, 18);

      // Amber Glowing Hazard Lamp
      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.fillRect(x + 24, groundY + 17, 32, 8);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 26, groundY + 19, 28, 4);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 30, groundY + 20, 20, 2);
    }
  }

  // Draw One Structural Observation Column from Image 1
  private static drawObservationPillar(
    ctx: CanvasRenderingContext2D,
    x: number,
    height: number,
    groundY: number
  ) {
    const colW = 46;
    ctx.save();

    // Column Main Body (Steel Column)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, 0, colW, height);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 4, 0, colW - 8, height);
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 8, 0, 4, height);
    ctx.fillRect(x + colW - 12, 0, 4, height);

    // Hydraulic Joiners / Brackets Top & Bottom
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 4, 18, colW + 8, 14);
    ctx.fillRect(x - 4, groundY - 24, colW + 8, 16);

    // Lower Amber Hazard Status Light
    ctx.fillStyle = '#090d16';
    ctx.fillRect(x + 8, groundY - 18, colW - 16, 10);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 11, groundY - 16, colW - 22, 6);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 13, groundY - 15, colW - 26, 3);

    // Traditional Thai Gold Inscription Plaque (Mounted at Center)
    const plaqueY = height * 0.28;
    const plaqueH = 110;
    const plaqueW = colW - 10;
    const plaqueX = x + 5;

    // Plaque Dark Slate Body
    ctx.fillStyle = '#090d16';
    ctx.fillRect(plaqueX, plaqueY, plaqueW, plaqueH);
    ctx.strokeStyle = '#f59e0b'; // Gold border
    ctx.lineWidth = 1.5;
    ctx.strokeRect(plaqueX, plaqueY, plaqueW, plaqueH);

    // Traditional Thai Gold Filigree Kbach at top and bottom
    ctx.fillStyle = '#facc15';
    // Top kbach
    ctx.beginPath();
    ctx.moveTo(plaqueX + plaqueW / 2, plaqueY + 2);
    ctx.lineTo(plaqueX + plaqueW - 4, plaqueY + 12);
    ctx.lineTo(plaqueX + 4, plaqueY + 12);
    ctx.closePath();
    ctx.fill();
    // Bottom kbach
    ctx.beginPath();
    ctx.moveTo(plaqueX + plaqueW / 2, plaqueY + plaqueH - 2);
    ctx.lineTo(plaqueX + plaqueW - 4, plaqueY + plaqueH - 12);
    ctx.lineTo(plaqueX + 4, plaqueY + plaqueH - 12);
    ctx.closePath();
    ctx.fill();

    // Gold Vertical Inscription
    // Alternate between "THAI TO THE FUTURE" and "TRADITION DRIVES X BRIGHTER TOMORROW"
    const isPlaqueA = Math.floor((x + 10000) / 400) % 2 === 0;
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 6.5px monospace';
    ctx.textAlign = 'center';

    if (isPlaqueA) {
      ctx.fillText('THAI', plaqueX + plaqueW / 2, plaqueY + 30);
      ctx.fillText('TO', plaqueX + plaqueW / 2, plaqueY + 44);
      ctx.fillText('THE', plaqueX + plaqueW / 2, plaqueY + 58);
      ctx.fillText('FUTURE', plaqueX + plaqueW / 2, plaqueY + 72);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('❖', plaqueX + plaqueW / 2, plaqueY + 88);
    } else {
      ctx.fillText('TRADITION', plaqueX + plaqueW / 2, plaqueY + 28);
      ctx.fillText('DRIVES', plaqueX + plaqueW / 2, plaqueY + 40);
      ctx.fillText('X', plaqueX + plaqueW / 2, plaqueY + 52);
      ctx.fillText('BRIGHTER', plaqueX + plaqueW / 2, plaqueY + 64);
      ctx.fillText('TOMORROW', plaqueX + plaqueW / 2, plaqueY + 76);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('❖', plaqueX + plaqueW / 2, plaqueY + 90);
    }

    ctx.restore();
  }

  // =========================================================================
  // 4. OBSTACLES: Pixel Art Replicas of Image 2
  //    - Hazard Laser Posts (3 Red Beams on striped posts)
  //    - Vertical Laser Barrier (Top & Bottom Pods)
  //    - Rotating Saw (Serrated Buzzsaw with Hazard Striped Hub & Red Eye)
  //    - Horizontal & Ceiling Spikes
  //    - Electric Zapper Gate (Crackling Cyan Lightning Arcs)
  //    - Cyber Rocket (Missile with Red Nose & Blazing Exhaust)
  //    - Surveillance Drone (Saucer with Red Spotlight Cone)
  //    - Twin Steam Vents (Ceiling block blasting smoke plumes)
  //    - Swinging Spiked Mace
  // =========================================================================
  public static drawObstacle(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle,
    time: number
  ) {
    ctx.save();

    switch (obs.type) {
      case 'laser_horizontal':
        this.drawHazardLaserHorizontal(ctx, obs, time);
        break;
      case 'laser_vertical':
        this.drawHazardLaserVertical(ctx, obs, time);
        break;
      case 'rotating_saw':
        this.drawHazardRotatingSaw(ctx, obs, time);
        break;
      case 'spikes_bottom':
      case 'spikes_top':
        this.drawHazardSpikes(ctx, obs);
        break;
      case 'electric_zapper':
        this.drawHazardElectricZapper(ctx, obs, time);
        break;
      case 'cyber_rocket':
        this.drawHazardCyberRocket(ctx, obs, time);
        break;
      case 'surveillance_drone':
        this.drawSurveillanceDrone(ctx, obs, time);
        break;
      case 'steam_vent':
        this.drawSteamVent(ctx, obs, time);
        break;
      case 'swinging_mace':
        this.drawSwingingMace(ctx, obs, time);
        break;
      default:
        this.drawHazardLaserHorizontal(ctx, obs, time);
        break;
    }

    ctx.restore();
  }

  // Helper: Draw Diagonal Black/Yellow Hazard Stripes (from Image 2)
  private static drawHazardStripes(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    stripeW: number = 8
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    // Yellow background
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x, y, width, height);

    // Diagonal black stripes
    ctx.fillStyle = '#0f172a';
    for (let sx = x - height; sx < x + width + height; sx += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(sx, y);
      ctx.lineTo(sx + stripeW, y);
      ctx.lineTo(sx + stripeW + height, y + height);
      ctx.lineTo(sx + height, y + height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // 1. Hazard Laser Emitter (3 Red Beams on striped posts from Image 2)
  private static drawHazardLaserHorizontal(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle,
    time: number
  ) {
    const postW = 20;
    const postX = obs.x;
    const postY = obs.y;
    const postH = obs.height;
    const laserLength = obs.width - postW;

    // Vertical Steel Base Post with Yellow/Black Hazard Stripes
    this.drawHazardStripes(ctx, postX, postY, postW, postH, 6);

    // Post Outer Metal Border Frames
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(postX, postY, postW, postH);

    // 3 Circular Emitter Nozzles with Red Sensor Rings
    const nozzles = 3;
    const spacing = postH / (nozzles + 1);

    for (let n = 1; n <= nozzles; n++) {
      const ny = postY + spacing * n;

      // Dark Emitter Bracket
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(postX + postW - 5, ny - 5, 8, 10);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(postX + postW + 1, ny - 3, 3, 6);

      // Red Glowing Laser Beam
      const beamY = ny - 2;
      const pulse = Math.sin(time * 18 + n) * 0.2 + 0.8;

      // Outer Red Plasma Glow
      ctx.fillStyle = `rgba(239, 68, 68, ${0.35 * pulse})`;
      ctx.fillRect(postX + postW + 3, beamY - 4, laserLength, 8);

      // Core Fiery Red Laser
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(postX + postW + 3, beamY - 1, laserLength, 3);

      // Intense White Center Line
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(postX + postW + 3, beamY, laserLength, 1.5);

      // Sparks at Emitter Nozzle
      ctx.fillStyle = '#fef08a';
      const sparkX = postX + postW + 3 + ((time * 180 + n * 40) % 24);
      ctx.fillRect(sparkX, beamY - 1, 2, 3);
    }
  }

  // 2. Vertical Laser Barrier (Top & Bottom Hazard Pods with Red Beam from Image 2)
  private static drawHazardLaserVertical(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle,
    time: number
  ) {
    const podW = obs.width;
    const podH = 14;
    const pulse = Math.sin(time * 16) * 0.25 + 0.75;

    // Top Industrial Pod with Hazard Stripes
    this.drawHazardStripes(ctx, obs.x, obs.y, podW, podH, 5);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(obs.x, obs.y, podW, podH);
    // Red indicator light on top pod
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(obs.x + podW / 2 - 4, obs.y + podH - 3, 8, 3);

    // Bottom Industrial Pod with Hazard Stripes
    const bottomPodY = obs.y + obs.height - podH;
    this.drawHazardStripes(ctx, obs.x, bottomPodY, podW, podH, 5);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(obs.x, bottomPodY, podW, podH);
    // Red indicator light on bottom pod
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(obs.x + podW / 2 - 4, bottomPodY, 8, 3);

    // Vertical Red Laser Beam between Pods
    const beamX = obs.x + podW / 2;
    const beamStartY = obs.y + podH;
    const beamH = obs.height - podH * 2;

    // Outer Glow
    ctx.fillStyle = `rgba(239, 68, 68, ${0.4 * pulse})`;
    ctx.fillRect(beamX - 6, beamStartY, 12, beamH);

    // Core Red Beam
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(beamX - 2.5, beamStartY, 5, beamH);

    // White Core Center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(beamX - 1, beamStartY, 2, beamH);
  }

  // 3. Rotating Buzzsaw (Serrated Blade with Hazard Striped Center Hub & Red Eye from Image 2)
  private static drawHazardRotatingSaw(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle,
    time: number
  ) {
    const cx = obs.x + obs.width / 2;
    const cy = obs.y + obs.height / 2;
    const r = obs.width / 2;
    const angle = obs.rotationAngle || time * 7.5;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Serrated Steel Blade Teeth (from Image 2)
    const teeth = 8;
    ctx.fillStyle = '#cbd5e1'; // Outer sharp steel teeth
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a = (i * Math.PI * 2) / teeth;
      const nextA = ((i + 1) * Math.PI * 2) / teeth;
      const midA = a + (nextA - a) * 0.45;
      const tx = Math.cos(midA) * r;
      const ty = Math.sin(midA) * r;
      const bx = Math.cos(a) * (r * 0.72);
      const by = Math.sin(a) * (r * 0.72);
      if (i === 0) ctx.moveTo(bx, by);
      else ctx.lineTo(bx, by);
      ctx.lineTo(tx, ty);
    }
    ctx.closePath();
    ctx.fill();

    // Crimson Inner Rim Accent (from Image 2)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
    ctx.fill();

    // Inner Circular Hub with Hazard Stripes
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.58, 0, Math.PI * 2);
    ctx.clip();
    this.drawHazardStripes(ctx, -r * 0.6, -r * 0.6, r * 1.2, r * 1.2, 5);
    ctx.restore();

    // Metallic Inner Ring
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.58, 0, Math.PI * 2);
    ctx.stroke();

    // Glowing Red Circular Core Eye (from Image 2)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // White pupil catchlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -2, 4, 4);

    ctx.restore();
  }

  // 4. Conical Spikes on Hazard Plate (Horizontal or Vertical from Image 2)
  private static drawHazardSpikes(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle
  ) {
    const isTop = obs.type === 'spikes_top';
    const plateH = 10;
    const plateY = isTop ? obs.y : obs.y + obs.height - plateH;

    // Industrial Plate with Hazard Stripes
    this.drawHazardStripes(ctx, obs.x, plateY, obs.width, plateH, 5);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(obs.x, plateY, obs.width, plateH);

    // 3 Sharp Conical Steel Spikes (from Image 2)
    const spikeCount = 3;
    const spikeW = obs.width / spikeCount;
    const spikeH = obs.height - plateH;

    for (let i = 0; i < spikeCount; i++) {
      const sx = obs.x + i * spikeW;
      ctx.beginPath();

      if (isTop) {
        // Pointing Down
        ctx.moveTo(sx + 2, plateY + plateH);
        ctx.lineTo(sx + spikeW / 2, obs.y + obs.height);
        ctx.lineTo(sx + spikeW - 2, plateY + plateH);
      } else {
        // Pointing Up
        ctx.moveTo(sx + 2, plateY);
        ctx.lineTo(sx + spikeW / 2, obs.y);
        ctx.lineTo(sx + spikeW - 2, plateY);
      }

      ctx.closePath();
      ctx.fillStyle = '#94a3b8'; // Steel conical spike
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Sharp Silver Tip Highlight
      ctx.fillStyle = '#f8fafc';
      if (isTop) {
        ctx.fillRect(sx + spikeW / 2 - 1, obs.y + obs.height - 5, 2, 4);
      } else {
        ctx.fillRect(sx + spikeW / 2 - 1, obs.y + 1, 2, 4);
      }
    }
  }

  // 5. Electric Zapper Gate (Hazard Posts with 3 Jagged Electric Cyan Arcs from Image 2)
  private static drawHazardElectricZapper(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle,
    time: number
  ) {
    const postW = 10;

    // Left Hazard Post
    this.drawHazardStripes(ctx, obs.x, obs.y, postW, obs.height, 4);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(obs.x, obs.y, postW, obs.height);

    // Right Hazard Post
    this.drawHazardStripes(ctx, obs.x + obs.width - postW, obs.y, postW, obs.height, 4);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(obs.x + obs.width - postW, obs.y, postW, obs.height);

    // 3 Horizontal Crackling Electric Cyan Zigzag Lightning Bolts
    const arcCount = 3;
    const arcSpacing = obs.height / (arcCount + 1);

    for (let a = 1; a <= arcCount; a++) {
      const startY = obs.y + arcSpacing * a;

      // Glow halo
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 5;
      this.drawLightningPath(ctx, obs.x + postW, startY, obs.x + obs.width - postW, startY, time + a);

      // Cyan main arc
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      this.drawLightningPath(ctx, obs.x + postW, startY, obs.x + obs.width - postW, startY, time + a);

      // White intense core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      this.drawLightningPath(ctx, obs.x + postW, startY, obs.x + obs.width - postW, startY, time + a);
    }
  }

  // Helper: Draw single zigzag lightning arc
  private static drawLightningPath(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    seed: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    const segments = 5;
    const dx = (x2 - x1) / segments;

    for (let s = 1; s < segments; s++) {
      const px = x1 + dx * s;
      const jitter = Math.sin(seed * 25 + s * 4) * 6;
      ctx.lineTo(px, y1 + jitter);
    }
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // 6. Cyber Rocket (High-Tech Missile with Red Nose & Flame Plume from Image 2)
  private static drawHazardCyberRocket(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle,
    time: number
  ) {
    // If waiting to launch: Draw warning alert on screen right edge
    if (!obs.hasLaunched && (obs.warningTimer || 0) > 0) {
      const isBlink = Math.floor(time * 8) % 2 === 0;
      ctx.save();
      ctx.fillStyle = isBlink ? '#ef4444' : '#7f1d1d';
      ctx.fillRect(obs.x - 36, obs.y, 32, 28);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', obs.x - 20, obs.y + 14);

      // Cyan hazard chevron pointing left
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(obs.x - 44, obs.y + 14);
      ctx.lineTo(obs.x - 38, obs.y + 7);
      ctx.lineTo(obs.x - 38, obs.y + 21);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    const rx = obs.x;
    const ry = obs.y;
    const rw = obs.width;
    const rh = obs.height;

    // Rounded Metallic Bullet Fuselage (from Image 2)
    ctx.fillStyle = '#475569';
    ctx.fillRect(rx + 12, ry + 3, rw - 22, rh - 6);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(rx + 14, ry + 5, rw - 26, 4);

    // Red Aerodynamic Nose Cone (Facing Left towards player)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(rx, ry + rh / 2);
    ctx.lineTo(rx + 12, ry + 2);
    ctx.lineTo(rx + 12, ry + rh - 2);
    ctx.closePath();
    ctx.fill();

    // Red Side Sensor Light & Wings
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(rx + 16, ry + rh / 2 - 2, 4, 4);

    // Fins
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(rx + rw - 14, ry - 1, 6, 4);
    ctx.fillRect(rx + rw - 14, ry + rh - 3, 6, 4);

    // Blazing Rocket Flame Exhaust Plume (Facing Right from Image 2)
    const flameLength = Math.sin(time * 28) * 6 + 18;
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(rx + rw - 10, ry + 4);
    ctx.lineTo(rx + rw + flameLength, ry + rh / 2);
    ctx.lineTo(rx + rw - 10, ry + rh - 4);
    ctx.closePath();
    ctx.fill();

    // Inner bright yellow flame
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(rx + rw - 10, ry + 6);
    ctx.lineTo(rx + rw + flameLength * 0.6, ry + rh / 2);
    ctx.lineTo(rx + rw - 10, ry + rh - 6);
    ctx.closePath();
    ctx.fill();
  }

  // 7. Surveillance Drone with Red Spotlight Cone (from Image 2)
  private static drawSurveillanceDrone(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle,
    time: number
  ) {
    const cx = obs.x + obs.width / 2;
    const cy = obs.y + 12;

    // Downward Red Spotlight Cone
    const coneH = obs.height - 12;
    ctx.save();
    const grad = ctx.createLinearGradient(0, cy, 0, cy + coneH);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    grad.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 32, cy + coneH);
    ctx.lineTo(cx + 32, cy + coneH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Saucer Drone Hull (Dark metallic with red lights from Image 2)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top Dome
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 3, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red Surveillance Eye Core
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx, cy + 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 1, cy + 2, 2, 2);

    // Red Navigation Lights on edges
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - 16, cy - 1, 3, 3);
    ctx.fillRect(cx + 13, cy - 1, 3, 3);
  }

  // 8. Twin Steam Vents (Ceiling hazard block blasting smoke plumes from Image 2)
  private static drawSteamVent(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle,
    time: number
  ) {
    // Ceiling Block with Hazard Stripes
    this.drawHazardStripes(ctx, obs.x, obs.y, obs.width, 16, 5);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(obs.x, obs.y, obs.width, 16);

    // Twin Exhaust Nozzles
    const leftNozzleX = obs.x + obs.width * 0.28;
    const rightNozzleX = obs.x + obs.width * 0.72;
    const ventStartY = obs.y + 16;
    const steamH = obs.height - 16;

    // Twin White Smoke/Steam Plumes
    const smokePuff = (Math.sin(time * 14) * 4);
    ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
    // Left plume
    ctx.beginPath();
    ctx.moveTo(leftNozzleX - 4, ventStartY);
    ctx.lineTo(leftNozzleX - 12 - smokePuff, ventStartY + steamH);
    ctx.lineTo(leftNozzleX + 12 + smokePuff, ventStartY + steamH);
    ctx.lineTo(leftNozzleX + 4, ventStartY);
    ctx.closePath();
    ctx.fill();
    // Right plume
    ctx.beginPath();
    ctx.moveTo(rightNozzleX - 4, ventStartY);
    ctx.lineTo(rightNozzleX - 12 + smokePuff, ventStartY + steamH);
    ctx.lineTo(rightNozzleX + 12 - smokePuff, ventStartY + steamH);
    ctx.lineTo(rightNozzleX + 4, ventStartY);
    ctx.closePath();
    ctx.fill();
  }

  // 9. Swinging Spiked Mace (from Image 2)
  private static drawSwingingMace(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle,
    time: number
  ) {
    const pivotX = obs.x + obs.width / 2;
    const pivotY = obs.y;
    const armLen = obs.height - 24;
    const angle = Math.sin(time * 3.5) * 0.55;

    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(angle);

    // Pivot Bracket
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-2, -2, 4, 4);

    // Hazard-striped Swinging Arm
    this.drawHazardStripes(ctx, -4, 0, 8, armLen, 4);

    // Spiked Ball at End
    const ballY = armLen + 12;
    const ballR = 14;

    // Heavy Spiked Iron Ball
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, ballY, ballR, 0, Math.PI * 2);
    ctx.fill();

    // Spikes protruding from ball
    ctx.fillStyle = '#94a3b8';
    const spikeCount = 8;
    for (let s = 0; s < spikeCount; s++) {
      const sa = (s * Math.PI * 2) / spikeCount;
      const tipX = Math.cos(sa) * (ballR + 6);
      const tipY = ballY + Math.sin(sa) * (ballR + 6);
      const base1X = Math.cos(sa - 0.25) * ballR;
      const base1Y = ballY + Math.sin(sa - 0.25) * ballR;
      const base2X = Math.cos(sa + 0.25) * ballR;
      const base2Y = ballY + Math.sin(sa + 0.25) * ballR;
      ctx.beginPath();
      ctx.moveTo(base1X, base1Y);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(base2X, base2Y);
      ctx.closePath();
      ctx.fill();
    }

    // Glowing Red Center Eye
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, ballY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, ballY - 1, 2, 2);

    ctx.restore();
  }

  // =========================================================================
  // 5. BANANAS & POWER-UP ITEMS: Pixel Art Replicas of Image 3
  //    - Base Cyber Banana: Yellow ripe curve, dark metallic stem/tip casing,
  //      glowing cyan tip sensors & cyan outline aura
  //    - Shield Banana: Encased inside glowing cyan hexagonal force-field barrier
  //    - Magnet Banana: Inside glowing cyan target reticle / crosshair circle
  //    - Speed Banana: With cyan speed blur trails & motion streaks
  //    - Ring / Energy Banana: With glowing cyan orbital ring & circuit traces
  //    - Sparkle Banana: With twinkling 4-point cyan star glints
  // =========================================================================
  public static drawBanana(
    ctx: CanvasRenderingContext2D,
    banana: Banana,
    time: number
  ) {
    if (banana.collected) return;

    ctx.save();
    const bx = banana.x;
    const by = banana.y + Math.sin(time * 5 + banana.id) * 3; // gentle hover bob

    // -------------------------------------------------------------
    // A. POWER-UP AURA FRAMING (Matching Image 3)
    // -------------------------------------------------------------
    if (banana.type === 'shield') {
      // Hexagonal Force-field Barrier from Image 3
      this.drawHexagonalShieldAura(ctx, bx, by, time);
    } else if (banana.type === 'magnet') {
      // Target Crosshair Reticle from Image 3
      this.drawTargetReticleAura(ctx, bx, by, time);
    } else if (banana.type === 'speed') {
      // Horizontal Cyan Speed Streaks & Trails from Image 3
      this.drawSpeedStreakAura(ctx, bx, by, time);
    } else if (banana.type === 'ring' || banana.type === 'energy') {
      // Orbital Ring & Energy Halo from Image 3
      this.drawOrbitalRingAura(ctx, bx, by, time);
    } else if (banana.type === 'sparkle') {
      // 4-Point Star Sparkles from Image 3
      this.drawSparkleAura(ctx, bx, by, time);
    }

    // -------------------------------------------------------------
    // B. BASE CYBER BANANA SPRITE (Exact Pixel Replica from Image 3)
    // -------------------------------------------------------------
    ctx.translate(bx, by);
    this.renderCyberBananaSprite(ctx, banana.type, time);
    ctx.restore();
  }

  // 1. Hexagonal Forcefield Barrier (Shield Banana from Image 3)
  private static drawHexagonalShieldAura(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number
  ) {
    const r = 24;
    ctx.save();

    // Outer Neon Glow
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(6, 182, 212, 0.22)';

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const hx = x + Math.cos(a) * r;
      const hy = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    // Corner Circuit Nodes on Hexagon
    ctx.fillStyle = '#bae6fd';
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const hx = x + Math.cos(a) * r;
      const hy = y + Math.sin(a) * r;
      ctx.fillRect(hx - 2, hy - 2, 4, 4);
    }

    // Inner scanning scanline
    const scanY = y - r + ((time * 35) % (r * 2));
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.fillRect(x - r * 0.7, scanY, r * 1.4, 2);

    ctx.restore();
  }

  // 2. Target Crosshair Reticle (Magnet Banana from Image 3)
  private static drawTargetReticleAura(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number
  ) {
    const r = 22;
    ctx.save();

    // Cyan Reticle Ring
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    // 4 Directional Crosshair Tick Marks
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(x - r - 6, y - 1.5, 6, 3); // Left
    ctx.fillRect(x + r, y - 1.5, 6, 3);     // Right
    ctx.fillRect(x - 1.5, y - r - 6, 3, 6); // Top
    ctx.fillRect(x - 1.5, y + r, 3, 6);     // Bottom

    // Expanding radar pulse
    const pulseR = ((time * 25) % r) + 8;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, pulseR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // 3. Speed Blur Trails (Speed Banana from Image 3)
  private static drawSpeedStreakAura(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number
  ) {
    ctx.save();
    // 4-5 horizontal cyan ghost speed streaks trailing behind banana
    ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
    for (let s = 0; s < 5; s++) {
      const sy = y - 10 + s * 5;
      const len = 14 + ((s * 7 + time * 60) % 22);
      ctx.fillRect(x - 12 - len, sy, len, 2.5);
    }
    ctx.restore();
  }

  // 4. Orbital Ring & Energy Halo (Ring / Energy Banana from Image 3)
  private static drawOrbitalRingAura(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number
  ) {
    ctx.save();
    // Horizontal Glowing Cyan Orbit Ring
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(x, y, 22, 9, -0.2, 0, Math.PI * 2);
    ctx.stroke();

    // Orbiting energy spark
    const angle = time * 6;
    const ox = x + Math.cos(angle) * 22;
    const oy = y + Math.sin(angle) * 9;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox - 2, oy - 2, 4, 4);

    ctx.restore();
  }

  // 5. Four-point Star Sparkles (Sparkle Banana from Image 3)
  private static drawSparkleAura(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number
  ) {
    ctx.save();
    const stars = [
      { ox: -16, oy: -14, s: 1.2 },
      { ox: 18, oy: -12, s: 1.0 },
      { ox: -14, oy: 14, s: 0.9 },
      { ox: 16, oy: 12, s: 1.1 },
    ];

    for (let i = 0; i < stars.length; i++) {
      const st = stars[i];
      const sx = x + st.ox;
      const sy = y + st.oy;
      const pulse = Math.sin(time * 10 + i * 2) * 0.3 + 0.7;

      ctx.fillStyle = '#00f0ff';
      // 4-point cross star
      ctx.fillRect(sx - 3 * pulse, sy - 1, 6 * pulse, 2);
      ctx.fillRect(sx - 1, sy - 3 * pulse, 2, 6 * pulse);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx - 1, sy - 1, 2, 2);
    }
    ctx.restore();
  }

  // Render the Base Cyber Banana Sprite (Faithful Pixel Art from Image 3)
  private static renderCyberBananaSprite(
    ctx: CanvasRenderingContext2D,
    type: string,
    time: number
  ) {
    // -------------------------------------------------------------
    // CYBER OUTLINE AURA (Glowing Neon Cyan Contour from Image 3)
    // -------------------------------------------------------------
    ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0.3, 2.8);
    ctx.lineTo(-12, 6);
    ctx.arc(0, -4, 14, 2.8, 0.3, true);
    ctx.closePath();
    ctx.fill();

    // -------------------------------------------------------------
    // YELLOW RIPE BANANA PEEL BODY
    // -------------------------------------------------------------
    ctx.fillStyle = '#facc15'; // Main yellow
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0.35, 2.75);
    ctx.lineTo(-10, 5);
    ctx.arc(0, -3.5, 11, 2.75, 0.35, true);
    ctx.closePath();
    ctx.fill();

    // Peel Inner Shading
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-5, 4, 10, 2.5);

    // Catchlight highlight
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-3, -1, 5, 2);

    // -------------------------------------------------------------
    // CYBERNETIC METAL CASING (Stem & Base from Image 3)
    // -------------------------------------------------------------
    // Dark metallic grey casing at stem (top-right)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(7, -6, 5, 5);
    ctx.fillStyle = '#334155';
    ctx.fillRect(8, -5, 3, 3);

    // Glowing Neon Cyan Sensor Tip at Stem
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(9, -8, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, -7, 2, 1);

    // Dark metallic grey casing at bottom tip (bottom-left)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-12, 3, 5, 5);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-11, 4, 3, 3);

    // Glowing Neon Cyan Sensor Tip at Base
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(-14, 4, 3, 3);

    // -------------------------------------------------------------
    // CYBERNETIC CIRCUIT ENGRAVINGS / SIDE POWER CORE
    // -------------------------------------------------------------
    // Cyan Circuit Traces on the peel
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(-2, 1, 4, 1);
    ctx.fillRect(1, 1, 1, 3);

    // Circular glowing cyber power core on flank (from Image 3)
    if (type !== 'standard') {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(1, 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(1, 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 1, 2, 2);
    }
  }

  // =========================================================================
  // 6. CHARACTER: Thai Cyber Monkey (Hanuman) - FLOATING POWER ONLY
  // =========================================================================
  public static drawPlayer(
    ctx: CanvasRenderingContext2D,
    player: Player,
    time: number
  ) {
    ctx.save();
    const px = player.x;
    const py = player.y;

    // If invulnerable: blink effect
    if (player.invulnerableTimer > 0) {
      const isVisible = Math.floor(time * 18) % 2 === 0;
      if (!isVisible) {
        ctx.restore();
        return;
      }
    }

    // "FLOATING POWER" LEVITATION RINGS (No Jetpack, No Fire!)
    if (player.isFloating) {
      ctx.save();
      const auraPulse = Math.sin(time * 16) * 0.2 + 0.8;
      const feetY = py + player.height - 4;
      const centerX = px + player.width / 2;

      for (let r = 0; r < 3; r++) {
        const ringProgress = ((time * 3 + r * 0.33) % 1);
        const ringRadius = 8 + ringProgress * 22;
        const ringAlpha = (1 - ringProgress) * 0.7 * auraPulse;
        const ringY = feetY + ringProgress * 18;

        ctx.strokeStyle = `rgba(0, 240, 255, ${ringAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, ringY, ringRadius, ringRadius * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(250, 204, 21, ${ringAlpha * 0.8})`;
        ctx.fillRect(centerX - 1.5, ringY - 1, 3, 2);
      }

      ctx.fillStyle = `rgba(6, 182, 212, ${0.18 * auraPulse})`;
      ctx.beginPath();
      ctx.ellipse(centerX, py + player.height / 2, player.width * 0.65, player.height * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    const tilt = player.isFloating ? -0.12 : Math.min(0.25, Math.max(-0.15, player.vy * 0.03));
    ctx.translate(px + player.width / 2, py + player.height / 2);
    ctx.rotate(tilt);
    ctx.translate(-player.width / 2, -player.height / 2);

    this.renderHanumanMonkeySprite(ctx, player.isFloating, time);

    // Active Shield Hexagonal Barrier (if shield active)
    if (player.shieldActive) {
      const shieldPulse = Math.sin(time * 8) * 0.15 + 0.85;
      ctx.strokeStyle = `rgba(0, 240, 255, ${shieldPulse})`;
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.beginPath();
      const sr = player.width * 0.72;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const hx = player.width / 2 + Math.cos(a) * sr;
        const hy = player.height / 2 + Math.sin(a) * sr;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fill();

      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const hx = player.width / 2 + Math.cos(a) * sr;
        const hy = player.height / 2 + Math.sin(a) * sr;
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(hx - 2.5, hy - 2.5, 5, 5);
      }
    }

    ctx.restore();
  }

  // Draw Hanuman Cyber Monkey Sprite
  private static renderHanumanMonkeySprite(
    ctx: CanvasRenderingContext2D,
    isFloating: boolean,
    time: number
  ) {
    const sx = 2;
    const sy = 2;

    // Tail
    ctx.fillStyle = '#1c0e05';
    ctx.fillRect(sx + 6, sy + 32, 5, 4);
    ctx.fillRect(sx + 3, sy + 28, 4, 5);
    ctx.fillRect(sx + 2, sy + 22, 4, 7);
    ctx.fillRect(sx + 4, sy + 18, 4, 5);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(sx + 7, sy + 33, 3, 2);
    ctx.fillRect(sx + 4, sy + 29, 2, 3);
    ctx.fillRect(sx + 3, sy + 23, 2, 5);
    ctx.fillRect(sx + 5, sy + 19, 2, 3);

    // Legs & Trousers
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(sx + 16, sy + 32, 6, 10);
    ctx.fillRect(sx + 24, sy + 32, 6, 10);
    ctx.fillStyle = '#334155';
    ctx.fillRect(sx + 17, sy + 33, 2, 8);
    ctx.fillRect(sx + 25, sy + 33, 2, 8);

    // Feet
    ctx.fillStyle = '#f8c29b';
    ctx.fillRect(sx + 15, sy + 41, 6, 4);
    ctx.fillRect(sx + 23, sy + 41, 6, 4);

    // Torso & Cyber Blue Jacket
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(sx + 16, sy + 22, 14, 11);
    ctx.fillStyle = '#0b314b';
    ctx.fillRect(sx + 13, sy + 21, 6, 11);
    ctx.fillRect(sx + 27, sy + 21, 6, 11);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(sx + 14, sy + 22, 4, 9);
    ctx.fillRect(sx + 28, sy + 22, 4, 9);
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(sx + 17, sy + 23, 2, 7);
    ctx.fillRect(sx + 27, sy + 23, 2, 7);

    // Silver Belt
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(sx + 15, sy + 31, 16, 3);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(sx + 21, sy + 31, 4, 3);

    // Arm & Gauntlet
    ctx.fillStyle = '#0b314b';
    ctx.fillRect(sx + 30, sy + 23, 7, 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(sx + 31, sy + 24, 5, 3);
    ctx.fillStyle = '#f8c29b';
    ctx.fillRect(sx + 36, sy + 22, 4, 5);

    // Floating Green Tech Cube in Hand
    const cubeY = sy + 18 + Math.sin(time * 8) * 2;
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(sx + 40, cubeY, 8, 8);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(sx + 41, cubeY + 1, 6, 6);
    ctx.fillStyle = '#6ee7b7';
    ctx.fillRect(sx + 42, cubeY + 2, 3, 3);

    // Head, Fur & Ears
    ctx.fillStyle = '#1c0e05';
    ctx.fillRect(sx + 14, sy + 6, 18, 16);
    ctx.fillStyle = '#8c451b';
    ctx.fillRect(sx + 15, sy + 7, 16, 14);

    ctx.fillStyle = '#1c0e05';
    ctx.fillRect(sx + 11, sy + 10, 4, 6);
    ctx.fillRect(sx + 31, sy + 10, 4, 6);
    ctx.fillStyle = '#f8c29b';
    ctx.fillRect(sx + 12, sy + 11, 2, 4);
    ctx.fillRect(sx + 32, sy + 11, 2, 4);

    // Hanuman White Mask Framing
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx + 17, sy + 9, 12, 10);
    ctx.fillRect(sx + 18, sy + 18, 10, 2);

    // Peach Face & Hero Eyes
    ctx.fillStyle = '#f8c29b';
    ctx.fillRect(sx + 18, sy + 12, 10, 7);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(sx + 20, sy + 12, 3, 3);
    ctx.fillRect(sx + 25, sy + 12, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx + 20, sy + 12, 1, 1);
    ctx.fillRect(sx + 25, sy + 12, 1, 1);

    // Nose & Smile
    ctx.fillStyle = '#78350f';
    ctx.fillRect(sx + 23, sy + 15, 2, 1);
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(sx + 22, sy + 17, 4, 1);

    // Golden Tiara Crown with Cyan Gemstone
    ctx.fillStyle = '#1c0e05';
    ctx.fillRect(sx + 19, sy + 3, 8, 4);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(sx + 20, sy + 3, 6, 3);
    ctx.fillRect(sx + 22, sy + 1, 2, 3);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(sx + 22, sy + 3, 2, 2);
  }

  // Draw Particles
  public static drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    ctx.save();
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;

      if (p.shape === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }
    ctx.restore();
  }

  // Draw Floating Score Text
  public static drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
    ctx.save();
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const t of texts) {
      ctx.globalAlpha = Math.max(0, Math.min(1, t.alpha));
      ctx.fillStyle = '#020617';
      ctx.fillText(t.text, t.x + 1, t.y + 1);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.restore();
  }
}
