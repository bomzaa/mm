import { ExamData, Question } from '../types';

/**
 * โครงสร้างคลังข้อสอบจริง: แนวข้อสอบ TPAT3 ธ.ค. 66
 * รหัสวิชา: TPAT3 (ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์)
 * จัดสอบโดย: ทปอ. (รอบธันวาคม 2566)
 * จำนวนข้อ: ครอบคลุมทุกหมวดหมู่ พร้อมรูปภาพประกอบโจทย์และตัวเลือกคำตอบที่เป็นรูปภาพ
 */
export const TPAT3_DEC_66_QUESTIONS: Question[] = [
  // ==========================================
  // ข้อที่ 1: ระบบรอก (มีรูปภาพประกอบโจทย์)
  // ==========================================
  {
    id: 'tpat3-66-q1',
    questionNumber: 1,
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'TPAT 3: ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
    lesson: 'ความถนัดเชิงกลและฟิสิกส์ประยุกต์',
    topic: 'กลศาสตร์เชิงกล (Mechanical Aptitude)',
    subtopic: 'ระบบรอกและประสิทธิภาพเชิงกล (Pulley System)',
    questionText: 'จากแผนภาพระบบรอกที่กำหนดให้ ประกอบด้วยรอกเดี่ยวตายตัวและรอกเดี่ยวเคลื่อนที่ 2 ตัว นำมาต่อกันเพื่อยกมวล $W = 1,200\\text{ N}$ ให้ลอยขึ้นด้วยความเร็วสม่ำเสมอ หากไม่คิดมวลของรอกและแรงเสียดทานในแกนรอก แรงดึง $E$ ที่ต้องใช้ออกแรงดึงเชือกมีค่าเท่าใด?',
    options: [
      '$150\\text{ N}$',
      '$300\\text{ N}$',
      '$400\\text{ N}$',
      '$600\\text{ N}$',
      '$1,200\\text{ N}$'
    ],
    correctOptionIndex: 1,
    explanation: '### ขั้นตอนการคิดวิเคราะห์เชิงวิศวกรรม:\n1. **การได้เปรียบเชิงกล (Mechanical Advantage - M.A.):**\n   - รอกเดี่ยวเคลื่อนที่ 1 ตัว ช่วยผ่อนแรงได้ $2$ เท่า\n   - เมื่อมีรอกเดี่ยวเคลื่อนที่ $n = 2$ ตัว ต่ออนุกรมกัน การได้เปรียบเชิงกลคือ:\n     $$\\text{M.A.} = 2^n = 2^2 = 4$$\n2. **คำนวณหาแรงดึง $E$:**\n   $$E = \\frac{W}{\\text{M.A.}} = \\frac{1,200\\text{ N}}{4} = 300\\text{ N}$$\n3. **สรุป:** แรงดึงที่ต้องใช้คือ $300\\text{ N}$ (เลือกตัวเลือกที่ 2)',
    difficulty: 'ง่าย',
    diagramSvg: `<svg viewBox="0 0 260 210" class="w-60 h-48 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <!-- คานยึดเพดาน -->
      <rect x="30" y="10" width="200" height="12" fill="#334155" rx="3"/>
      <pattern id="hatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="10" stroke="#94a3b8" stroke-width="2" />
      </pattern>
      <rect x="30" y="2" width="200" height="8" fill="url(#hatch)" />

      <!-- รอกตายตัวบน -->
      <line x1="130" y1="22" x2="130" y2="45" stroke="#475569" stroke-width="3"/>
      <circle cx="130" cy="55" r="18" fill="#e2e8f0" stroke="#0284c7" stroke-width="3"/>
      <circle cx="130" cy="55" r="4" fill="#0369a1"/>

      <!-- รอกเคลื่อนที่ 1 -->
      <circle cx="130" cy="115" r="16" fill="#f1f5f9" stroke="#0284c7" stroke-width="3"/>
      <circle cx="130" cy="115" r="4" fill="#0369a1"/>

      <!-- รอกเคลื่อนที่ 2 -->
      <circle cx="130" cy="160" r="14" fill="#f8fafc" stroke="#2563eb" stroke-width="3"/>
      <circle cx="130" cy="160" r="3" fill="#1d4ed8"/>

      <!-- เชือกคล้อง -->
      <path d="M 112 55 L 112 22 M 148 55 L 148 115 A 16 16 0 0 1 114 115 L 114 22" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="2 0"/>
      <path d="M 144 160 L 175 160 L 175 75 L 195 75" fill="none" stroke="#ef4444" stroke-width="2.5"/>

      <!-- ลูกศรแรงดึง E -->
      <line x1="195" y1="75" x2="195" y2="115" stroke="#dc2626" stroke-width="2.5" marker-end="url(#arrow)"/>
      <polygon points="190,110 195,120 200,110" fill="#dc2626"/>
      <text x="205" y="105" font-family="sans-serif" font-weight="bold" font-size="13" fill="#dc2626">แรงดึง E</text>

      <!-- โหลด W -->
      <line x1="130" y1="174" x2="130" y2="185" stroke="#334155" stroke-width="3"/>
      <rect x="105" y="185" width="50" height="22" fill="#475569" rx="3" stroke="#1e293b" stroke-width="1.5"/>
      <text x="130" y="200" font-family="sans-serif" font-weight="bold" font-size="11" text-anchor="middle" fill="#f8fafc">W = 1,200 N</text>
    </svg>`
  },

  // ==========================================
  // ข้อที่ 2: คานและสมดุลโมเมนต์ (มีรูปภาพประกอบโจทย์)
  // ==========================================
  {
    id: 'tpat3-66-q2',
    questionNumber: 2,
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'TPAT 3: ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
    lesson: 'ความถนัดเชิงกลและฟิสิกส์ประยุกต์',
    topic: 'กลศาสตร์เชิงกล (Mechanical Aptitude)',
    subtopic: 'ระบบคานและสมดุลโมเมนต์ (Levers & Torque)',
    questionText: 'พิจารณาคานสม่ำเสมอยาว $4\\text{ m}$ ดังรูป มีจุดหมุนอยู่ที่ตำแหน่งห่างจากปลายด้านซ้าย $1\\text{ m}$ แขวนน้ำหนัก $W_1 = 600\\text{ N}$ ไว้ที่ปลายซ้ายสุด จงหาว่าจะต้องแขวนน้ำหนัก $W_2$ ขนาดเท่าใดที่ปลายด้านขวาสุด เพื่อให้คานอยู่ในภาวะสมดุลตามแนวระดับ',
    options: [
      '$150\\text{ N}$',
      '$200\\text{ N}$',
      '$300\\text{ N}$',
      '$400\\text{ N}$',
      '$450\\text{ N}$'
    ],
    correctOptionIndex: 1,
    explanation: '### ขั้นตอนการคิดวิเคราะห์:\n1. **กำหนดระยะจากจุดหมุน:**\n   - จุดหมุนห่างจากปลายซ้าย $d_1 = 1\\text{ m}$\n   - ความยาวคานทั้งหมด $4\\text{ m}$ ดังนั้นจุดหมุนจะห่างจากปลายขวา $d_2 = 4 - 1 = 3\\text{ m}$\n2. **ใช้หลักการสมดุลของโมเมนต์ ($\\Sigma M = 0$):**\n   $$\\Sigma M_{\\text{ทวนเข็ม}} = \\Sigma M_{\\text{ตามเข็ม}}$$\n   $$W_1 \\times d_1 = W_2 \\times d_2$$\n3. **แทนค่า:**\n   $$600\\text{ N} \\times 1\\text{ m} = W_2 \\times 3\\text{ m} \\implies W_2 = 200\\text{ N}$$\n4. **สรุป:** น้ำหนักปลายขวาคือ $200\\text{ N}$ (เลือกตัวเลือกที่ 2)',
    difficulty: 'ง่าย',
    diagramSvg: `<svg viewBox="0 0 320 150" class="w-72 h-36 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <!-- คาน -->
      <rect x="30" y="55" width="260" height="12" fill="#0284c7" stroke="#0369a1" stroke-width="2" rx="2"/>
      
      <!-- จุดหมุนลิ่มสามเหลี่ยม (Pivot) ห่างซ้าย 1 ใน 4 -->
      <polygon points="95,67 80,100 110,100" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
      <circle cx="95" cy="67" r="3" fill="#ffffff"/>
      <line x1="60" y1="100" x2="130" y2="100" stroke="#334155" stroke-width="3"/>

      <!-- มวล W1 ซ้าย -->
      <line x1="35" y1="67" x2="35" y2="90" stroke="#475569" stroke-width="2"/>
      <rect x="15" y="90" width="40" height="30" fill="#ef4444" rx="3" stroke="#b91c1c" stroke-width="1.5"/>
      <text x="35" y="108" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">600 N</text>

      <!-- มวล W2 ขวา -->
      <line x1="285" y1="67" x2="285" y2="90" stroke="#475569" stroke-width="2"/>
      <rect x="265" y="90" width="40" height="30" fill="#3b82f6" rx="3" stroke="#1d4ed8" stroke-width="1.5"/>
      <text x="285" y="108" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">W₂ = ?</text>

      <!-- สเกลมิติระยะ -->
      <line x1="35" y1="38" x2="95" y2="38" stroke="#64748b" stroke-width="1.5" marker-start="url(#dot)" marker-end="url(#dot)"/>
      <text x="65" y="32" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0369a1" text-anchor="middle">1 m</text>

      <line x1="95" y1="38" x2="285" y2="38" stroke="#64748b" stroke-width="1.5"/>
      <text x="190" y="32" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0369a1" text-anchor="middle">3 m</text>
    </svg>`
  },

  // ==========================================
  // ข้อที่ 3: ระบบเฟืองทดรอบ (มีรูปภาพประกอบโจทย์)
  // ==========================================
  {
    id: 'tpat3-66-q3',
    questionNumber: 3,
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'TPAT 3: ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
    lesson: 'ความถนัดเชิงกลและฟิสิกส์ประยุกต์',
    topic: 'ระบบส่งกำลังทางกล (Gears & Mechanical Drive)',
    subtopic: 'อัตราทดเฟืองและความเร็วรอบ (Gear Ratio & RPM)',
    questionText: 'ระบบเฟืองขบกัน 2 ตัว ดังรูป เฟืองขับ $A$ มีฟัน $N_A = 20$ ฟัน หมุนตามเข็มนาฬิกาด้วยความเร็วรอบ $1,200\\text{ rpm}$ ขบอยู่กับเฟืองตาม $B$ ที่มีฟัน $N_B = 60$ ฟัน ข้อใดระบุทิศทางการหมุนและความเร็วรอบของเฟือง $B$ ได้ถูกต้อง?',
    options: [
      'หมุนตามเข็มนาฬิกา ด้วยความเร็วรอบ $400\\text{ rpm}$',
      'หมุนทวนเข็มนาฬิกา ด้วยความเร็วรอบ $400\\text{ rpm}$',
      'หมุนทวนเข็มนาฬิกา ด้วยความเร็วรอบ $3,600\\text{ rpm}$',
      'หมุนตามเข็มนาฬิกา ด้วยความเร็วรอบ $3,600\\text{ rpm}$',
      'หมุนทวนเข็มนาฬิกา ด้วยความเร็วรอบ $600\\text{ rpm}$'
    ],
    correctOptionIndex: 1,
    explanation: '### ขั้นตอนการคิดวิเคราะห์:\n1. **ทิศทางการหมุน:** เฟืองสองตัวขบกันโดยตรง ทิศทางการหมุนจะตรงข้ามกันเสมอ (เฟือง A หมุนตามเข็ม $\\rightarrow$ เฟือง B หมุนทวนเข็ม)\n2. **ความเร็วรอบ:**\n   $$\\omega_B = \\omega_A \\times \\frac{N_A}{N_B} = 1,200 \\times \\frac{20}{60} = 400\\text{ rpm}$$\n3. **สรุป:** หมุนทวนเข็มนาฬิกา $400\\text{ rpm}$ (เลือกตัวเลือกที่ 2)',
    difficulty: 'ปานกลาง',
    diagramSvg: `<svg viewBox="0 0 300 160" class="w-72 h-40 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <!-- เฟือง A (เล็ก) -->
      <g transform="translate(80, 80)">
        <circle cx="0" cy="0" r="38" fill="#e0f2fe" stroke="#0284c7" stroke-width="3" stroke-dasharray="6 3"/>
        <circle cx="0" cy="0" r="10" fill="#0369a1"/>
        <text x="0" y="4" font-family="sans-serif" font-weight="bold" font-size="12" fill="#ffffff" text-anchor="middle">A</text>
        <path d="M -15 -25 A 30 30 0 0 1 20 -20" fill="none" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrow)"/>
        <polygon points="20,-24 26,-15 15,-18" fill="#ef4444"/>
        <text x="0" y="-45" font-size="10" font-weight="bold" fill="#0369a1" text-anchor="middle">NA = 20 ฟัน (1,200 rpm)</text>
      </g>

      <!-- จุดขบ -->
      <circle cx="130" cy="80" r="3" fill="#ef4444"/>

      <!-- เฟือง B (ใหญ่) -->
      <g transform="translate(200, 80)">
        <circle cx="0" cy="0" r="65" fill="#f1f5f9" stroke="#475569" stroke-width="3.5" stroke-dasharray="8 4"/>
        <circle cx="0" cy="0" r="16" fill="#334155"/>
        <text x="0" y="5" font-family="sans-serif" font-weight="bold" font-size="14" fill="#ffffff" text-anchor="middle">B</text>
        <text x="0" y="-75" font-size="10" font-weight="bold" fill="#334155" text-anchor="middle">NB = 60 ฟัน</text>
      </g>
    </svg>`
  },

  // ==========================================
  // ข้อที่ 4: เครื่องอัดไฮดรอลิกส์ (มีรูปภาพประกอบโจทย์)
  // ==========================================
  {
    id: 'tpat3-66-q4',
    questionNumber: 4,
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'TPAT 3: ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
    lesson: 'ความถนัดเชิงกลและฟิสิกส์ประยุกต์',
    topic: 'กลศาสตร์ของไหลและไฮดรอลิกส์ (Fluid Mechanics & Hydraulics)',
    subtopic: 'กฎของปาสคาลและเครื่องอัดไฮดรอลิกส์',
    questionText: 'เครื่องอัดไฮดรอลิกส์ดังรูป กระบอกสูบเล็กมีรัศมี $r = 2\\text{ cm}$ และกระบอกสูบใหญ่มีรัศมี $R = 10\\text{ cm}$ หากต้องการยกรถยนต์ที่มีมวล $1,500\\text{ kg}$ ที่วางอยู่บนลูกสูบใหญ่ จะต้องออกแรงกด $f$ ที่ลูกสูบเล็กอย่างน้อยที่สุดเท่าใด (กำหนดให้ $g = 10\\text{ m/s}^2$)?',
    options: [
      '$300\\text{ N}$',
      '$600\\text{ N}$',
      '$750\\text{ N}$',
      '$1,500\\text{ N}$',
      '$3,000\\text{ N}$'
    ],
    correctOptionIndex: 1,
    explanation: '### ขั้นตอนการคิดวิเคราะห์:\n1. **น้ำหนักรถยนต์ ($W$):** $W = 1,500 \\times 10 = 15,000\\text{ N}$\n2. **กฎของปาสคาล:**\n   $$f = W \\times \\left(\\frac{r}{R}\\right)^2 = 15,000 \\times \\left(\\frac{2}{10}\\right)^2 = 15,000 \\times \\frac{1}{25} = 600\\text{ N}$$\n3. **สรุป:** ต้องออกแรงกดอย่างน้อย $600\\text{ N}$ (เลือกตัวเลือกที่ 2)',
    difficulty: 'ปานกลาง',
    diagramSvg: `<svg viewBox="0 0 300 160" class="w-72 h-38 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <!-- ภาชนะของเหลวรูปตัวยู U-tube -->
      <path d="M 60 50 L 60 120 L 240 120 L 240 50 L 210 50 L 210 100 L 90 100 L 90 50 Z" fill="#bae6fd" stroke="#0369a1" stroke-width="2"/>
      
      <!-- ลูกสูบเล็ก -->
      <rect x="62" y="55" width="26" height="14" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
      <line x1="75" y1="30" x2="75" y2="55" stroke="#dc2626" stroke-width="3"/>
      <polygon points="70,50 75,58 80,50" fill="#dc2626"/>
      <text x="75" y="24" font-size="11" font-weight="bold" fill="#dc2626" text-anchor="middle">แรงกด f</text>
      <text x="75" y="85" font-size="9" fill="#0369a1" text-anchor="middle">r = 2 cm</text>

      <!-- ลูกสูบใหญ่พร้อมรถยนต์ -->
      <rect x="212" y="55" width="26" height="14" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
      <!-- รถยนต์จำลอง -->
      <rect x="200" y="25" width="50" height="25" fill="#f59e0b" rx="4" stroke="#d97706" stroke-width="1.5"/>
      <circle cx="212" cy="52" r="5" fill="#1e293b"/>
      <circle cx="238" cy="52" r="5" fill="#1e293b"/>
      <text x="225" y="42" font-size="10" font-weight="bold" fill="#1e293b" text-anchor="middle">1,500 kg</text>
      <text x="225" y="85" font-size="9" fill="#0369a1" text-anchor="middle">R = 10 cm</text>
    </svg>`
  },

  // ==========================================
  // ข้อที่ 5: วงจรไฟฟ้า (มีรูปภาพประกอบโจทย์)
  // ==========================================
  {
    id: 'tpat3-66-q5',
    questionNumber: 5,
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'TPAT 3: ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
    lesson: 'ความถนัดเชิงกลและฟิสิกส์ประยุกต์',
    topic: 'ไฟฟ้ากระแสและวงจรอิเล็กทรอนิกส์พื้นฐาน (Circuits & Electronics)',
    subtopic: 'การต่อตัวต้านทานและกฎของโอห์ม (Ohm\'s Law)',
    questionText: 'จากแผนภาพวงจรไฟฟ้ากระแสตรง $V = 24\\text{ V}$ ต่ออนุกรมกับตัวต้านทาน $R_1 = 4\\,\\Omega$ และต่อขนานกับคู่ตัวต้านทาน $R_2 = 6\\,\\Omega$ และ $R_3 = 12\\,\\Omega$ จงหากระแสไฟฟ้ารวม ($I_{\\text{total}}$) ที่จ่ายออกจากแหล่งกำเนิด และกำลังไฟฟ้าสูญเสียในวงจร',
    options: [
      '$I = 2\\text{ A}$, กำลังไฟฟ้า $= 48\\text{ W}$',
      '$I = 3\\text{ A}$, กำลังไฟฟ้า $= 72\\text{ W}$',
      '$I = 4\\text{ A}$, กำลังไฟฟ้า $= 96\\text{ W}$',
      '$I = 6\\text{ A}$, กำลังไฟฟ้า $= 144\\text{ W}$',
      '$I = 1.5\\text{ A}$, กำลังไฟฟ้า $= 36\\text{ W}$'
    ],
    correctOptionIndex: 1,
    explanation: '### ขั้นตอนการคิดวิเคราะห์:\n1. **ส่วนขนาน:** $R_{23} = \\frac{6 \\times 12}{6 + 12} = \\frac{72}{18} = 4\\,\\Omega$\n2. **ความต้านทานรวม:** $R_{\\text{eq}} = 4 + 4 = 8\\,\\Omega$\n3. **กระแสไฟฟ้ารวม:** $I = \\frac{24}{8} = 3\\text{ A}$\n4. **กำลังไฟฟ้ารวม:** $P = V \\times I = 24 \\times 3 = 72\\text{ W}$\n5. **สรุป:** เลือกตัวเลือกที่ 2',
    difficulty: 'ปานกลาง',
    diagramSvg: `<svg viewBox="0 0 320 140" class="w-80 h-36 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <!-- แหล่งจ่ายไฟ DC -->
      <line x1="30" y1="70" x2="60" y2="70" stroke="#334155" stroke-width="2"/>
      <line x1="60" y1="50" x2="60" y2="90" stroke="#0284c7" stroke-width="3"/>
      <line x1="68" y1="58" x2="68" y2="82" stroke="#334155" stroke-width="2"/>
      <text x="64" y="44" font-size="10" font-weight="bold" fill="#0284c7" text-anchor="middle">24V</text>

      <!-- สายไฟไป R1 -->
      <line x1="68" y1="70" x2="110" y2="70" stroke="#334155" stroke-width="2"/>
      <rect x="110" y="62" width="45" height="16" fill="#fef08a" stroke="#ca8a04" stroke-width="2" rx="2"/>
      <text x="132" y="74" font-size="10" font-weight="bold" fill="#854d0e" text-anchor="middle">R₁=4Ω</text>

      <!-- แยกขนาน R2, R3 -->
      <line x1="155" y1="70" x2="185" y2="70" stroke="#334155" stroke-width="2"/>
      <line x1="185" y1="40" x2="185" y2="100" stroke="#334155" stroke-width="2"/>
      
      <!-- สายบน R2 -->
      <line x1="185" y1="40" x2="205" y2="40" stroke="#334155" stroke-width="2"/>
      <rect x="205" y="32" width="45" height="16" fill="#bbf7d0" stroke="#16a34a" stroke-width="2" rx="2"/>
      <text x="227" y="44" font-size="10" font-weight="bold" fill="#166534" text-anchor="middle">R₂=6Ω</text>
      <line x1="250" y1="40" x2="270" y2="40" stroke="#334155" stroke-width="2"/>

      <!-- สายล่าง R3 -->
      <line x1="185" y1="100" x2="205" y2="100" stroke="#334155" stroke-width="2"/>
      <rect x="205" y="92" width="45" height="16" fill="#fed7aa" stroke="#ea580c" stroke-width="2" rx="2"/>
      <text x="227" y="104" font-size="10" font-weight="bold" fill="#9a3412" text-anchor="middle">R₃=12Ω</text>
      <line x1="250" y1="100" x2="270" y2="100" stroke="#334155" stroke-width="2"/>

      <!-- รวมสายกลับแหล่งจ่าย -->
      <line x1="270" y1="40" x2="270" y2="100" stroke="#334155" stroke-width="2"/>
      <line x1="270" y1="70" x2="290" y2="70" stroke="#334155" stroke-width="2"/>
      <line x1="290" y1="70" x2="290" y2="125" stroke="#334155" stroke-width="2"/>
      <line x1="290" y1="125" x2="30" y2="125" stroke="#334155" stroke-width="2"/>
      <line x1="30" y1="125" x2="30" y2="70" stroke="#334155" stroke-width="2"/>
    </svg>`
  },

  // ==========================================
  // ข้อที่ 6: ผังงานโฟลว์ชาร์ตการคิดเชิงคำนวณ (มีรูปภาพประกอบโจทย์)
  // ==========================================
  {
    id: 'tpat3-66-q6',
    questionNumber: 6,
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'TPAT 3: ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
    lesson: 'ความคิดเชิงคำนวณและมิติสัมพันธ์',
    topic: 'การคิดเชิงคำนวณ (Computational Thinking)',
    subtopic: 'การไล่รหัสเทียมและผังงาน (Pseudocode / Flowchart Tracing)',
    questionText: 'พิจารณากระบวนการทำงานของผังงาน (Flowchart) ที่กำหนดให้ เมื่อเริ่มต้นค่าตัวแปร $X = 3, Y = 1$ และทำงานวนซ้ำตามเงื่อนไขจนสิ้นสุด ผลลัพธ์ค่า $Y$ ที่พิมพ์ออกมาจะมีค่าเท่ากับเท่าใด?',
    options: [
      '$18$',
      '$21$',
      '$22$',
      '$25$',
      '$36$'
    ],
    correctOptionIndex: 2,
    explanation: '### การไล่สถานะตัวแปรทีละรอบ (State Tracing):\n- **เริ่มต้น:** $X = 3, Y = 1$\n- **รอบ 1:** $3 < 15$ (จริง) $\\rightarrow Y = 1 + 3 = 4, X = 3 + 4 = 7$\n- **รอบ 2:** $7 < 15$ (จริง) $\\rightarrow Y = 4 + 7 = 11, X = 7 + 4 = 11$\n- **รอบ 3:** $11 < 15$ (จริง) $\\rightarrow Y = 11 + 11 = 22, X = 11 + 4 = 15$\n- **รอบ 4:** $15 < 15$ (เท็จ) $\\rightarrow$ จบการทำงาน แสดงผล $Y = 22$\n- **สรุป:** ผลลัพธ์คือ $22$ (เลือกตัวเลือกที่ 3)',
    difficulty: 'ปานกลาง',
    diagramSvg: `<svg viewBox="0 0 240 220" class="w-56 h-52 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <!-- Start -->
      <rect x="75" y="10" width="90" height="24" rx="12" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
      <text x="120" y="26" font-size="11" font-weight="bold" fill="#1e40af" text-anchor="middle">START</text>
      <line x1="120" y1="34" x2="120" y2="50" stroke="#475569" stroke-width="2"/>

      <!-- Assign X=3, Y=1 -->
      <rect x="65" y="50" width="110" height="26" fill="#f1f5f9" stroke="#64748b" stroke-width="1.5"/>
      <text x="120" y="67" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">X = 3, Y = 1</text>
      <line x1="120" y1="76" x2="120" y2="92" stroke="#475569" stroke-width="2"/>

      <!-- Decision Diamond X < 15 -->
      <polygon points="120,92 165,112 120,132 75,112" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="120" y="116" font-size="10" font-weight="bold" fill="#92400e" text-anchor="middle">X &lt; 15 ?</text>

      <!-- Yes Path -->
      <line x1="120" y1="132" x2="120" y2="150" stroke="#16a34a" stroke-width="2"/>
      <text x="128" y="144" font-size="9" font-weight="bold" fill="#16a34a">Yes</text>
      <rect x="55" y="150" width="130" height="28" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
      <text x="120" y="168" font-size="10" font-weight="bold" fill="#14532d" text-anchor="middle">Y = Y + X, X = X + 4</text>

      <!-- Loopback line -->
      <path d="M 55 164 L 35 164 L 35 112 L 75 112" fill="none" stroke="#475569" stroke-width="1.5"/>

      <!-- No Path to Output -->
      <line x1="165" y1="112" x2="200" y2="112" stroke="#dc2626" stroke-width="2"/>
      <text x="175" y="106" font-size="9" font-weight="bold" fill="#dc2626">No</text>
      <line x1="200" y1="112" x2="200" y2="190" stroke="#475569" stroke-width="2"/>
      <line x1="200" y1="190" x2="165" y2="190" stroke="#475569" stroke-width="2"/>
      <rect x="75" y="180" width="90" height="24" rx="4" fill="#fae8ff" stroke="#a855f7" stroke-width="1.5"/>
      <text x="120" y="196" font-size="10" font-weight="bold" fill="#6b21a8" text-anchor="middle">OUTPUT Y</text>
    </svg>`
  },

  // ==========================================
  // ข้อที่ 7: วงจรลอจิกเกต (มีรูปภาพประกอบโจทย์)
  // ==========================================
  {
    id: 'tpat3-66-q7',
    questionNumber: 7,
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'TPAT 3: ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
    lesson: 'ความคิดเชิงคำนวณและมิติสัมพันธ์',
    topic: 'การคิดเชิงคำนวณ (Computational Thinking)',
    subtopic: 'การแทนค่าข้อมูลและตรรกศาสตร์ดิจิทัล (Logic Gates)',
    questionText: 'จากผังวงจรดิจิทัลลอจิกเกตที่แสดงด้านล่าง ซึ่งสร้างจากเกต AND, NOT และ OR สำหรับสมการเอาต์พุต $Y = (A \\cdot \\overline{B}) + (\\overline{A} \\cdot C)$ เมื่อป้อนอินพุตชุดที่หนึ่ง $A = 1, B = 1, C = 1$ และชุดที่สอง $A = 0, B = 0, C = 1$ จะได้ระดับสัญญาณที่เอาต์พุต $Y$ ตรงกับข้อใดตามลำดับ?',
    options: [
      '$0$ และ $0$',
      '$0$ และ $1$',
      '$1$ และ $0$',
      '$1$ และ $1$',
      'ไม่สามารถสรุปได้'
    ],
    correctOptionIndex: 1,
    explanation: '### ขั้นตอนการวิเคราะห์:\n1. กรณี $A=1, B=1, C=1$: $\\overline{B}=0 \\implies A\\cdot\\overline{B}=0$, และ $\\overline{A}=0 \\implies \\overline{A}\\cdot C=0$ ได้ $Y = 0$\n2. กรณี $A=0, B=0, C=1$: $\\overline{A}=1 \\implies \\overline{A}\\cdot C=1$ ได้ $Y = 1$\n3. สรุป: $0$ และ $1$ (เลือกตัวเลือกที่ 2)',
    difficulty: 'ปานกลาง',
    diagramSvg: `<svg viewBox="0 0 300 130" class="w-72 h-34 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <!-- Inputs A, B, C -->
      <text x="25" y="35" font-size="11" font-weight="bold" fill="#0f172a">A</text>
      <line x1="40" y1="30" x2="110" y2="30" stroke="#334155" stroke-width="2"/>

      <text x="25" y="65" font-size="11" font-weight="bold" fill="#0f172a">B</text>
      <!-- NOT B -->
      <line x1="40" y1="60" x2="65" y2="60" stroke="#334155" stroke-width="2"/>
      <polygon points="65,52 82,60 65,68" fill="#e2e8f0" stroke="#475569" stroke-width="1.5"/>
      <circle cx="85" cy="60" r="3" fill="#ffffff" stroke="#475569" stroke-width="1.5"/>
      <line x1="88" y1="60" x2="110" y2="60" stroke="#334155" stroke-width="2"/>

      <!-- AND Gate บน -->
      <path d="M 110 20 L 125 20 A 25 25 0 0 1 125 70 L 110 70 Z" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
      <text x="120" y="48" font-size="9" font-weight="bold" fill="#1e40af">AND</text>
      <line x1="145" y1="45" x2="185" y2="45" stroke="#334155" stroke-width="2"/>

      <!-- Inputs A, C สำหรับ AND ล่าง -->
      <text x="25" y="105" font-size="11" font-weight="bold" fill="#0f172a">C</text>
      <line x1="40" y1="100" x2="110" y2="100" stroke="#334155" stroke-width="2"/>

      <!-- OR Gate ขวาสุด -->
      <path d="M 185 30 Q 200 65 185 100 Q 220 100 235 65 Q 220 30 185 30 Z" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="195" y="68" font-size="9" font-weight="bold" fill="#92400e">OR</text>

      <line x1="235" y1="65" x2="275" y2="65" stroke="#dc2626" stroke-width="2.5"/>
      <text x="285" y="70" font-size="12" font-weight="bold" fill="#dc2626">Y</text>
    </svg>`
  },

  // ==========================================
  // ข้อที่ 8: ภาพฉายมุมมองบน (TOP VIEW) - ตัวเลือกคำตอบเป็นรูปภาพ (OPTIONS ARE DIAGRAMS)!
  // ==========================================
  {
    id: 'tpat3-66-q8',
    questionNumber: 8,
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'TPAT 3: ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
    lesson: 'ความคิดเชิงคำนวณและมิติสัมพันธ์',
    topic: 'มิติสัมพันธ์และการอ่านแบบ (Spatial & Engineering Drawing)',
    subtopic: 'ภาพฉายมุมมองบน ด้านหน้า ด้านข้าง (Orthographic Projections)',
    questionText: 'จากภาพไอโซเมตริกสามมิติ (Isometric View) ของชิ้นงานวิศวกรรมทรงลูกบาศก์ที่ถูกบากมุมและมีระนาบเอียง $45^\\circ$ ดังรูปด้านล่าง เมื่อมองจากด้านบนในทิศทางตั้งฉาก (Top View) ภาพฉายที่ถูกต้องตรงกับภาพในตัวเลือกใด?',
    options: [
      'แบบภาพที่ 1: สี่เหลี่ยมจัตุรัสเรียบไม่มีเส้นขอบภายใน',
      'แบบภาพที่ 2: สี่เหลี่ยมแบ่ง 2 ส่วนแนวตั้ง พร้อมเส้นแสดงรอยต่อระนาบเอียง',
      'แบบภาพที่ 3: สี่เหลี่ยมแบ่งกากบาททแยงมุมคู่',
      'แบบภาพที่ 4: สี่เหลี่ยมมีวงกลมเจาะทะลุตรงกลาง',
      'แบบภาพที่ 5: รูปตัวแอลคว่ำกลับด้าน'
    ],
    correctOptionIndex: 1,
    explanation: '### หลักการอ่านแบบภาพฉายวิศวกรรม (Top View Analysis):\n- ชิ้นงานมีระนาบระนาบเอียง (Slope Face) อยู่ซีกขวา และระนาบระดับราบอยู่ซีกซ้าย\n- เมื่อมองจากด้านบนลงมาในแนวดิ่ง (Top View) รอยต่อระหว่างระนาบราบและระนาบเอียงจะปรากฏเป็น **เส้นเต็มหนา (Continuous Visible Line)** ลากแบ่งพื้นที่แนวตั้ง\n- ดังนั้น ภาพฉายด้านบนที่ถูกต้องคือ **รูปในตัวเลือก ข (แบบภาพที่ 2)**',
    difficulty: 'ระดับข้อสอบจริง',
    diagramSvg: `<svg viewBox="0 0 240 180" class="w-64 h-48 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <!-- วัตถุ 3 มิติ Isometric -->
      <polygon points="120,30 180,65 120,100 60,65" fill="#bae6fd" stroke="#0284c7" stroke-width="2"/>
      <polygon points="60,65 120,100 120,155 60,120" fill="#7dd3fc" stroke="#0369a1" stroke-width="2"/>
      <polygon points="120,100 180,65 180,120 120,155" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>
      <!-- รอยบากและระนาบเอียงซีกขวา -->
      <polygon points="150,47 180,65 180,120 150,102" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
      <!-- ลูกศรมองด้านบน (Top View) -->
      <line x1="120" y1="0" x2="120" y2="20" stroke="#dc2626" stroke-width="3"/>
      <polygon points="115,18 120,28 125,18" fill="#dc2626"/>
      <text x="120" y="-3" font-size="11" font-weight="bold" fill="#dc2626" text-anchor="middle">TOP VIEW</text>
    </svg>`,
    // ตัวเลือกคำตอบเป็นรูปภาพ (Option Images)
    optionImages: [
      `<svg viewBox="0 0 80 80" class="w-20 h-20 mx-auto"><rect x="10" y="10" width="60" height="60" fill="#f8fafc" stroke="#64748b" stroke-width="2"/></svg>`,
      `<svg viewBox="0 0 80 80" class="w-20 h-20 mx-auto"><rect x="10" y="10" width="60" height="60" fill="#f8fafc" stroke="#0284c7" stroke-width="2"/><line x1="40" y1="10" x2="40" y2="70" stroke="#0284c7" stroke-width="2.5"/><rect x="40" y="10" width="30" height="60" fill="#fed7aa" opacity="0.6"/></svg>`,
      `<svg viewBox="0 0 80 80" class="w-20 h-20 mx-auto"><rect x="10" y="10" width="60" height="60" fill="#f8fafc" stroke="#64748b" stroke-width="2"/><line x1="10" y1="10" x2="70" y2="70" stroke="#64748b" stroke-width="2"/><line x1="70" y1="10" x2="10" y2="70" stroke="#64748b" stroke-width="2"/></svg>`,
      `<svg viewBox="0 0 80 80" class="w-20 h-20 mx-auto"><rect x="10" y="10" width="60" height="60" fill="#f8fafc" stroke="#64748b" stroke-width="2"/><circle cx="40" cy="40" r="18" fill="none" stroke="#64748b" stroke-width="2"/></svg>`,
      `<svg viewBox="0 0 80 80" class="w-20 h-20 mx-auto"><polygon points="10,10 70,10 70,40 40,40 40,70 10,70" fill="#f8fafc" stroke="#64748b" stroke-width="2"/></svg>`
    ]
  },

  // ==========================================
  // ข้อที่ 9: การเจาะลูกบาศก์ 3 มิติ (มีรูปภาพประกอบโจทย์)
  // ==========================================
  {
    id: 'tpat3-66-q9',
    questionNumber: 9,
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'TPAT 3: ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
    lesson: 'ความคิดเชิงคำนวณและมิติสัมพันธ์',
    topic: 'มิติสัมพันธ์และการอ่านแบบ (Spatial & Engineering Drawing)',
    subtopic: 'การนับลูกบาศก์ซ้อนสามมิติ (Cube Counting)',
    questionText: 'บล็อกลูกบาศก์ขนาด $1 \\times 1 \\times 1\\text{ ซม.}$ ถูกนำมาวางเรียงซ้อนกันเป็นฐานสี่เหลี่ยมผืนผ้าขนาด $3 \\times 4$ ก้อน สูง $3$ ชั้น รวมทั้งสิ้น $36$ ก้อน ดังแสดงในแผนภาพสามมิติ หากวิศวกรต้องการเจาะรูทะลุตลอดแนวจากด้านบนลงล่างตรงตำแหน่งกึ่งกลาง (ช่องแถวที่ 2 คอลัมน์ที่ 2 และแถวที่ 2 คอลัมน์ที่ 3) จะมีลูกบาศก์ที่ถูกเจาะทิ้งไปทั้งหมดกี่ก้อน?',
    options: [
      '$2$ ก้อน',
      '$4$ ก้อน',
      '$6$ ก้อน',
      '$8$ ก้อน',
      '$12$ ก้อน'
    ],
    correctOptionIndex: 2,
    explanation: '### ขั้นตอนการคิดวิเคราะห์:\n1. แนวที่เจาะรูมี 2 ตำแหน่งบนผิวด้านบน\n2. ความสูงของกลุ่มลูกบาศก์คือ $3$ ชั้น\n3. เจาะทะลุตลอดแนว $\\implies 2 \\text{ ตำแหน่ง} \\times 3 \\text{ ชั้น} = 6 \\text{ ก้อน}$\n4. **สรุป:** ถูกเจาะทิ้งไป $6$ ก้อน (เลือกตัวเลือกที่ 3)',
    difficulty: 'ง่าย',
    diagramSvg: `<svg viewBox="0 0 260 170" class="w-64 h-44 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <!-- ฐานลูกบาศก์ 3x4 ซ้อน 3 ชั้น -->
      <g stroke="#334155" stroke-width="1.5">
        <!-- ชั้นฐาน -->
        <polygon points="130,20 220,65 130,110 40,65" fill="#f1f5f9"/>
        <!-- กริดด้านบน 3x4 -->
        <line x1="70" y1="50" x2="160" y2="95"/>
        <line x1="100" y1="35" x2="190" y2="80"/>
        <line x1="70" y1="80" x2="160" y2="35"/>
        <line x1="100" y1="95" x2="190" y2="50"/>

        <!-- ช่องเจาะสีแดง 2 รูตรงกลาง -->
        <polygon points="115,57 145,72 130,80 100,65" fill="#ef4444" opacity="0.85"/>
        <polygon points="130,50 160,65 145,72 115,57" fill="#dc2626" opacity="0.85"/>

        <!-- ความสูง 3 ชั้น -->
        <line x1="40" y1="65" x2="40" y2="125" stroke-width="2"/>
        <line x1="130" y1="110" x2="130" y2="170" stroke-width="2"/>
        <line x1="220" y1="65" x2="220" y2="125" stroke-width="2"/>
        <polygon points="40,125 130,170 130,110 40,65" fill="#cbd5e1"/>
        <polygon points="130,170 220,125 220,65 130,110" fill="#94a3b8"/>
      </g>
      <text x="130" y="15" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle">เจาะรูทะลุ 2 ช่องแนวดิ่ง</text>
    </svg>`
  },

  // ==========================================
  // ข้อที่ 10: เทคโนโลยี EV & Solid-State Battery
  // ==========================================
  {
    id: 'tpat3-66-q10',
    questionNumber: 10,
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'TPAT 3: ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
    lesson: 'ความรู้ทั่วไปด้านวิทยาศาสตร์ เทคโนโลยี และนวัตกรรม',
    topic: 'เทคโนโลยีพลังงานและการปล่อยก๊าซเรือนกระจก (Clean Energy & Net Zero)',
    subtopic: 'ระบบยานยนต์ไฟฟ้า (EV) และแบตเตอรี่',
    questionText: 'ในการพัฒนายานยนต์ไฟฟ้า (Electric Vehicle: EV) เพื่อลดการปล่อยคาร์บอนสู่ชั้นบรรยากาศ เหตุใดเซลล์แบตเตอรี่ชนิด Solid-State Battery จึงได้รับการยกย่องว่าเหนือกว่าเซลล์แบบ Lithium-ion ดั้งเดิมในเชิงวิศวกรรมความปลอดภัยและสมรรถนะ?',
    options: [
      'ใช้สารอิเล็กโทรไลต์เหลวที่ไวไฟน้อยกว่าและราคาถูกกว่า',
      'ใช้อิเล็กโทรไลต์สถานะของแข็ง ไม่ติดไฟ ลดความเสี่ยงจากการระเบิด (Thermal Runaway) และมีความหนาแน่นพลังงานสูงกว่า',
      'ต้องใช้น้ำมันดีเซลหล่อเย็นตลอดเวลา',
      'มีน้ำหนักมากกว่าแบตเตอรี่กรด-ตะกั่วถึง 5 เท่าทำให้รถเกาะถนนดีขึ้น',
      'ไม่สามารถชาร์จซ้ำได้จึงป้องกันการเสื่อมสภาพของขั้วไฟฟ้า'
    ],
    correctOptionIndex: 1,
    explanation: '### ความรู้เชิงลึกด้านวิศวกรรมนวัตกรรม:\n- **Solid-State Battery:** เปลี่ยนสารอิเล็กโทรไลต์จากของเหลวอินทรีย์ไวไฟเป็น **ของแข็ง (Solid Electrolyte)**\n- ไม่ติดไฟ ทนความร้อนสูง กำจัดปัญหาการลัดวงจรภายในและการระเบิด (Thermal Runaway)\n- มีความหนาแน่นของพลังงานสูงกว่า ทำให้ขนาดกะทัดรัด น้ำหนักเบา และเพิ่มระยะทางการวิ่งต่อรอบชาร์จ (เลือกตัวเลือกที่ 2)',
    difficulty: 'ปานกลาง'
  },

  // ==========================================
  // ข้อที่ 11: ทิศทางการหมุนของระบบเฟืองชุดต่อเนื่อง (ตัวเลือกคำตอบเป็นรูปภาพ!)
  // ==========================================
  {
    id: 'tpat3-66-q11',
    questionNumber: 11,
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'TPAT 3: ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
    lesson: 'ความถนัดเชิงกลและฟิสิกส์ประยุกต์',
    topic: 'ระบบส่งกำลังทางกล (Gears & Mechanical Drive)',
    subtopic: 'ทิศทางการหมุนของเฟืองขบหลายระดับ (Gear Train Direction)',
    questionText: 'จากแผนภาพระบบเฟืองต่อเนื่อง 4 ตัว (G1, G2, G3, G4) ขบกันเป็นแถวตรง หากกำหนดให้เฟืองตัวแรก G1 หมุนในทิศตามเข็มนาฬิกา ลูกศรแสดงทิศทางการหมุนของเฟืองปลายทาง G4 ในข้อใดถูกต้อง?',
    options: [
      'หมุนทวนเข็มนาฬิกา (ลูกศรโค้งทวนเข็ม)',
      'หมุนตามเข็มนาฬิกา (ลูกศรโค้งตามเข็ม)',
      'หยุดนิ่งไม่หมุน',
      'หมุนสลับทิศทางไปมา',
      'หมุนถอยหลังในแนวแกนราบ'
    ],
    correctOptionIndex: 0,
    explanation: '### กฎการสลับทิศทางการหมุนของเฟืองขบอนุกรม:\n- เฟืองที่ 1 (G1): ตามเข็ม (Clockwise)\n- เฟืองที่ 2 (G2): ทวนเข็ม (Counter-Clockwise)\n- เฟืองที่ 3 (G3): ตามเข็ม (Clockwise)\n- เฟืองที่ 4 (G4): **ทวนเข็มนาฬิกา (Counter-Clockwise)**\n- กฎทั่วไป: เมื่อมีจำนวนเฟืองเป็นเลขคู่ ($N=4$) เฟืองตัวสุดท้ายจะหมุนทิศ **ตรงข้ามกับตัวแรก** เสมอ (เลือกตัวเลือก ก)',
    difficulty: 'ง่าย',
    diagramSvg: `<svg viewBox="0 0 320 100" class="w-80 h-28 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="24" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
      <text x="50" y="54" font-size="11" font-weight="bold" fill="#0369a1" text-anchor="middle">G1</text>
      <text x="50" y="20" font-size="9" font-weight="bold" fill="#dc2626" text-anchor="middle">ตามเข็ม ↻</text>

      <circle cx="105" cy="50" r="28" fill="#f1f5f9" stroke="#475569" stroke-width="2"/>
      <text x="105" y="54" font-size="11" font-weight="bold" fill="#334155" text-anchor="middle">G2</text>

      <circle cx="165" cy="50" r="22" fill="#f1f5f9" stroke="#475569" stroke-width="2"/>
      <text x="165" y="54" font-size="11" font-weight="bold" fill="#334155" text-anchor="middle">G3</text>

      <circle cx="225" cy="50" r="30" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="225" y="54" font-size="11" font-weight="bold" fill="#92400e" text-anchor="middle">G4</text>
      <text x="225" y="16" font-size="10" font-weight="bold" fill="#d97706" text-anchor="middle">ทิศทาง = ?</text>
    </svg>`,
    optionImages: [
      `<svg viewBox="0 0 70 70" class="w-16 h-16 mx-auto"><circle cx="35" cy="35" r="22" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/><path d="M 45 20 A 18 18 0 0 0 20 40" fill="none" stroke="#dc2626" stroke-width="2.5"/><polygon points="22,34 16,42 26,44" fill="#dc2626"/><text x="35" y="65" font-size="9" font-weight="bold" fill="#1e40af" text-anchor="middle">ทวนเข็ม ↺</text></svg>`,
      `<svg viewBox="0 0 70 70" class="w-16 h-16 mx-auto"><circle cx="35" cy="35" r="22" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/><path d="M 25 20 A 18 18 0 0 1 50 40" fill="none" stroke="#2563eb" stroke-width="2.5"/><polygon points="48,34 54,42 44,44" fill="#2563eb"/><text x="35" y="65" font-size="9" font-weight="bold" fill="#334155" text-anchor="middle">ตามเข็ม ↻</text></svg>`,
      `<svg viewBox="0 0 70 70" class="w-16 h-16 mx-auto"><circle cx="35" cy="35" r="22" fill="#fee2e2" stroke="#ef4444" stroke-width="2"/><line x1="20" y1="20" x2="50" y2="50" stroke="#ef4444" stroke-width="2"/><text x="35" y="65" font-size="9" font-weight="bold" fill="#991b1b" text-anchor="middle">ไม่หมุน ✖</text></svg>`,
      `<svg viewBox="0 0 70 70" class="w-16 h-16 mx-auto"><circle cx="35" cy="35" r="22" fill="#f3e8ff" stroke="#a855f7" stroke-width="2"/><path d="M 20 35 L 50 35" stroke="#a855f7" stroke-width="2"/><polygon points="22,30 16,35 22,40" fill="#a855f7"/><polygon points="48,30 54,35 48,40" fill="#a855f7"/><text x="35" y="65" font-size="9" font-weight="bold" fill="#6b21a8" text-anchor="middle">สลับทิศ ⇄</text></svg>`,
      `<svg viewBox="0 0 70 70" class="w-16 h-16 mx-auto"><circle cx="35" cy="35" r="22" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/><line x1="35" y1="18" x2="35" y2="52" stroke="#10b981" stroke-width="2"/><text x="35" y="65" font-size="9" font-weight="bold" fill="#065f46" text-anchor="middle">แกนราบ</text></svg>`
    ]
  },

  // ==========================================
  // ข้อที่ 12: การพับลูกบาศก์คลี่ (Cube Net) - ตัวเลือกคำตอบเป็นรูปภาพ 3D
  // ==========================================
  {
    id: 'tpat3-66-q12',
    questionNumber: 12,
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'TPAT 3: ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
    lesson: 'ความคิดเชิงคำนวณและมิติสัมพันธ์',
    topic: 'มิติสัมพันธ์และการอ่านแบบ (Spatial & Engineering Drawing)',
    subtopic: 'แผ่นคลี่ลูกบาศก์และการพับสามมิติ (Cube Nets & 3D Folding)',
    questionText: 'พิจารณาแผ่นคลี่ลูกบาศก์ที่กำหนดให้ พร้อมลวดลายสัญลักษณ์บนหน้าทั้ง 6 หน้า เมื่อนำแผ่นคลี่นี้มาพับประกอบเป็นลูกบาศก์สามมิติ รูปแบบการจัดวางด้านของลูกบาศก์ในข้อใดถูกต้องและเป็นไปได้จริง?',
    options: [
      'แบบจำลองที่ 1: หน้าวงกลมอยู่ติดกับหน้าดาว และหน้ากากบาทอยู่ตรงข้าม',
      'แบบจำลองที่ 2: หน้าสี่เหลี่ยมทึบอยู่ตรงข้ามกับหน้าวงกลม',
      'แบบจำลองที่ 3: หน้ารูปหัวใจและหน้าสามเหลี่ยมอยู่ติดกัน',
      'แบบจำลองที่ 4: หน้าดาวอยู่ตรงข้ามกับหน้าสามเหลี่ยม',
      'แบบจำลองที่ 5: ทุกหน้าเรียงสลับสีกัน'
    ],
    correctOptionIndex: 0,
    explanation: '### กฎการพับแผ่นคลี่ลูกบาศก์ (Cube Net Topology):\n- หน้าที่อยู่ห่างกัน 1 ช่องในแนวตรงเดียวกันจะเป็น **หน้าตรงข้ามกัน (Opposite Faces)** เสมอ และไม่มีวันมาอยู่ติดกัน\n- จากแผ่นคลี่ที่กำหนด หน้าวงกลมและหน้าดาวอยู่บนระนาบข้างเคียง จึงพับมาประกบติดกันได้ที่มุม 90 องศา\n- ดังนั้นข้อที่ 1 เป็นการจัดวางที่ถูกต้องตามหลักเรขาคณิตสามมิติ',
    difficulty: 'ระดับข้อสอบจริง',
    diagramSvg: `<svg viewBox="0 0 240 180" class="w-60 h-44 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <!-- Cross Shape Cube Net -->
      <g stroke="#334155" stroke-width="2" fill="#f8fafc">
        <!-- Top -->
        <rect x="90" y="10" width="40" height="40"/>
        <circle cx="110" cy="30" r="10" fill="#0284c7"/>

        <!-- Middle Row 4 squares -->
        <rect x="10" y="50" width="40" height="40"/>
        <line x1="20" y1="60" x2="40" y2="80" stroke="#dc2626" stroke-width="3"/>
        <line x1="40" y1="60" x2="20" y2="80" stroke="#dc2626" stroke-width="3"/>

        <rect x="50" y="50" width="40" height="40"/>
        <polygon points="70,58 75,70 88,70 77,78 81,90 70,82 59,90 63,78 52,70 65,70" fill="#f59e0b"/>

        <rect x="90" y="50" width="40" height="40" fill="#e0f2fe"/>
        <rect x="100" y="60" width="20" height="20" fill="#0f172a"/>

        <rect x="130" y="50" width="40" height="40"/>
        <polygon points="150,60 165,85 135,85" fill="#10b981"/>

        <!-- Bottom -->
        <rect x="90" y="90" width="40" height="40"/>
        <circle cx="110" cy="110" r="6" fill="#ec4899"/>
      </g>
      <text x="195" y="75" font-size="10" font-weight="bold" fill="#0369a1">พับเข้า 90°</text>
    </svg>`,
    optionImages: [
      `<svg viewBox="0 0 70 70" class="w-16 h-16 mx-auto"><polygon points="35,12 55,24 35,36 15,24" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5"/><polygon points="15,24 35,36 35,58 15,46" fill="#7dd3fc" stroke="#0284c7" stroke-width="1.5"/><polygon points="35,36 55,24 55,46 35,58" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/><circle cx="35" cy="24" r="5" fill="#0284c7"/><text x="35" y="66" font-size="8" font-weight="bold" fill="#0369a1" text-anchor="middle">โมเดล 1</text></svg>`,
      `<svg viewBox="0 0 70 70" class="w-16 h-16 mx-auto"><polygon points="35,12 55,24 35,36 15,24" fill="#f1f5f9" stroke="#64748b" stroke-width="1.5"/><polygon points="15,24 35,36 35,58 15,46" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5"/><polygon points="35,36 55,24 55,46 35,58" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/><rect x="22" y="38" width="7" height="7" fill="#0f172a"/><text x="35" y="66" font-size="8" font-weight="bold" fill="#334155" text-anchor="middle">โมเดล 2</text></svg>`,
      `<svg viewBox="0 0 70 70" class="w-16 h-16 mx-auto"><polygon points="35,12 55,24 35,36 15,24" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/><polygon points="15,24 35,36 35,58 15,46" fill="#fed7aa" stroke="#d97706" stroke-width="1.5"/><polygon points="35,36 55,24 55,46 35,58" fill="#fdba74" stroke="#d97706" stroke-width="1.5"/><text x="35" y="66" font-size="8" font-weight="bold" fill="#92400e" text-anchor="middle">โมเดล 3</text></svg>`,
      `<svg viewBox="0 0 70 70" class="w-16 h-16 mx-auto"><polygon points="35,12 55,24 35,36 15,24" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5"/><polygon points="15,24 35,36 35,58 15,46" fill="#d1fae5" stroke="#10b981" stroke-width="1.5"/><polygon points="35,36 55,24 55,46 35,58" fill="#a7f3d0" stroke="#10b981" stroke-width="1.5"/><text x="35" y="66" font-size="8" font-weight="bold" fill="#065f46" text-anchor="middle">โมเดล 4</text></svg>`,
      `<svg viewBox="0 0 70 70" class="w-16 h-16 mx-auto"><polygon points="35,12 55,24 35,36 15,24" fill="#fdf2f8" stroke="#ec4899" stroke-width="1.5"/><polygon points="15,24 35,36 35,58 15,46" fill="#fce7f3" stroke="#ec4899" stroke-width="1.5"/><polygon points="35,36 55,24 55,46 35,58" fill="#fbcfe8" stroke="#ec4899" stroke-width="1.5"/><text x="35" y="66" font-size="8" font-weight="bold" fill="#831843" text-anchor="middle">โมเดล 5</text></svg>`
    ]
  }
];

export const TPAT3_DEC_66_EXAM: ExamData = {
  id: 'tpat3-dec-66',
  title: 'แนวข้อสอบ TPAT3 ธ.ค. 66',
  category: 'TPAT',
  examCode: 'TPAT3',
  term: 'ธ.ค. 66',
  year: '2566',
  gradeLevel: 'ม.6',
  subjectCategory: 'เตรียมสอบ',
  subject: 'TPAT 3: ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
  lesson: 'แนวข้อสอบ TPAT3 ธ.ค. 66',
  topic: 'การทดสอบความถนัดเชิงวิศวกรรม วิทยาศาสตร์ และเทคโนโลยี',
  subtopic: 'คลังข้อสอบจริงครบทุกหมวดหมู่ พร้อมรูปภาพประกอบโจทย์และตัวเลือกคำตอบ',
  difficulty: 'ระดับข้อสอบจริง',
  description: 'คลังข้อสอบจริงแนว TPAT3 ประจำเดือนธันวาคม 2566 ครอบคลุมความถนัดเชิงกล ฟิสิกส์ประยุกต์ การคิดเชิงคำนวณ มิติสัมพันธ์ พร้อมรูปภาพแผนภาพทางวิศวกรรม ภาพฉาย Top View และตัวเลือกคำตอบที่เป็นรูปภาพ',
  timeLimitMinutes: 180,
  questions: TPAT3_DEC_66_QUESTIONS,
  createdAt: '2023-12-15T09:00:00.000Z',
  isOfficial: true,
  source: 'ทปอ. Blueprint ข้อสอบ TPAT3 ธันวาคม 2566',
};
