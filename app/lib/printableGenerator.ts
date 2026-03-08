import { Platform } from 'react-native';
import { Printable } from '../data/printables';

/* ------------------------------------------------------------------ */
/*  STYLES                                                             */
/* ------------------------------------------------------------------ */
function getStyles(primaryColor: string, bgColor: string, borderColor: string, headerBg: string): string {
  return `
    <style>
      @page { size: A4; margin: 15mm; }
      @media print {
        html, body { margin: 0 !important; padding: 0 !important; background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .no-print { display: none !important; }
        .page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; min-height: auto !important; page-break-after: always; }
        .page:last-child { page-break-after: auto; }
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #e8e8e8; padding: 20px; color: #333; }
      .toolbar {
        position: fixed; top: 0; left: 0; right: 0; z-index: 100;
        background: ${headerBg}; color: white; padding: 12px 24px;
        display: flex; justify-content: space-between; align-items: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      .toolbar h3 { font-size: 16px; font-weight: 600; }
      .toolbar-buttons { display: flex; gap: 10px; }
      .toolbar button {
        background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4);
        color: white; padding: 8px 20px; border-radius: 6px; cursor: pointer;
        font-size: 14px; font-weight: 600; transition: all 0.2s;
      }
      .toolbar button:hover { background: rgba(255,255,255,0.35); }
      .toolbar button.primary { background: white; color: ${headerBg}; border-color: white; }
      .page {
        max-width: 210mm; margin: 70px auto 20px; background: white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.12); position: relative;
        min-height: 297mm; padding: 18mm 20mm 25mm;
        border-radius: 4px;
      }
      .header { text-align: center; margin-bottom: 8mm; padding-bottom: 6mm; border-bottom: 3px solid ${borderColor}; }
      .header h1 { font-size: 28pt; color: ${primaryColor}; margin-bottom: 4px; font-weight: 800; }
      .header .subtitle { font-size: 11pt; color: #888; font-weight: 500; }
      .header .brand { font-size: 9pt; color: #aaa; margin-top: 6px; font-style: italic; }
      .content { margin-top: 6mm; }
      .footer {
        position: absolute; bottom: 12mm; left: 20mm; right: 20mm;
        text-align: center; font-size: 8pt; color: #bbb;
        border-top: 1px solid #eee; padding-top: 3mm;
      }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
      .grid-4 { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
      .card-item {
        border: 2px solid ${borderColor}; border-radius: 12px; padding: 15px;
        text-align: center; background: ${bgColor}; min-height: 80px;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
      }
      .card-item .emoji { font-size: 44px; margin-bottom: 8px; }
      .card-item .label { font-size: 16px; font-weight: 700; color: ${primaryColor}; }
      .card-item .desc { font-size: 11px; color: #777; margin-top: 4px; }
      .checklist-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px dashed #ddd; }
      .checkbox { width: 22px; height: 22px; border: 2px solid ${borderColor}; border-radius: 4px; flex-shrink: 0; margin-top: 2px; }
      .checklist-text { font-size: 14px; line-height: 1.5; }
      .writing-lines { margin-top: 5mm; }
      .writing-line { border-bottom: 1px solid #ccc; height: 12mm; margin-bottom: 2mm; }
      .section-title { font-size: 16px; font-weight: 700; color: ${primaryColor}; margin: 6mm 0 3mm; padding-bottom: 2mm; border-bottom: 2px solid ${borderColor}30; }
      .instruction { background: ${bgColor}; padding: 12px 16px; border-radius: 8px; font-size: 12px; color: #555; line-height: 1.6; margin-bottom: 5mm; border-left: 4px solid ${borderColor}; }
      .thermo-level { width: 100%; padding: 14px 20px; text-align: center; font-weight: 700; font-size: 15px; color: white; border: 2px solid rgba(255,255,255,0.3); }
      .poster-content { text-align: center; padding: 5mm; }
      .poster-content h2 { font-size: 28pt; color: ${primaryColor}; margin-bottom: 8mm; font-weight: 800; }
      .script-block { background: ${bgColor}; padding: 16px; border-radius: 8px; margin-bottom: 5mm; border-left: 4px solid ${borderColor}; }
      .script-label { font-size: 11px; font-weight: 700; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
      .script-text { font-size: 13px; line-height: 1.7; color: #444; }
      .circle-area { display: flex; flex-wrap: wrap; gap: 6mm; justify-content: center; margin: 5mm 0; }
      .circle-item { width: 28mm; height: 28mm; border-radius: 50%; border: 2px dashed ${borderColor}; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #666; text-align: center; padding: 4px; }
      .name-field { display: flex; align-items: center; gap: 8px; margin-bottom: 5mm; }
      .name-field label { font-size: 13px; font-weight: 600; color: #555; }
      .name-field .line { flex: 1; border-bottom: 2px solid ${borderColor}; height: 1px; }
      .step-row { display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px dotted #ddd; text-align: left; }
      .step-num { width: 44px; height: 44px; border-radius: 50%; background: ${primaryColor}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; flex-shrink: 0; }
      .step-title { font-weight: 700; color: ${primaryColor}; font-size: 15px; }
      .step-desc { font-size: 13px; color: #666; margin-top: 2px; }
    </style>
  `;
}

/* ------------------------------------------------------------------ */
/*  CONTENT GENERATORS PER PRINTABLE                                   */
/* ------------------------------------------------------------------ */
function getContentHTML(printable: Printable, format: string, primaryColor: string, bgColor: string, borderColor: string, isColor: boolean, isBW: boolean): string {
  const nameDate = `
    <div class="name-field">
      <label>Name:</label><div class="line"></div>
      <label style="margin-left:10px;">Date:</label><div class="line" style="max-width:60mm;"></div>
    </div>
  `;

  switch (printable.id) {
    case 'p-1': { // Emotion Face Cards
      const faces = [
        { label: 'Happy', desc: 'I feel good inside', fill: isColor ? '#FFD54F' : '#ccc', mouth: '<path d="M24 48 Q40 62 56 48" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>' },
        { label: 'Sad', desc: 'I feel like crying', fill: isColor ? '#90CAF9' : '#ccc', mouth: '<path d="M24 54 Q40 42 56 54" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="44" r="3" fill="#42A5F5" opacity="0.6"/>' },
        { label: 'Angry', desc: 'I feel cross inside', fill: isColor ? '#EF9A9A' : '#ccc', mouth: '<line x1="22" y1="26" x2="32" y2="30" stroke="#333" stroke-width="3" stroke-linecap="round"/><line x1="58" y1="26" x2="48" y2="30" stroke="#333" stroke-width="3" stroke-linecap="round"/><circle cx="28" cy="34" r="3.5" fill="#333"/><circle cx="52" cy="34" r="3.5" fill="#333"/><path d="M28 52 L40 48 L52 52" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>' },
        { label: 'Scared', desc: 'I feel frightened', fill: isColor ? '#CE93D8' : '#ccc', mouth: '<ellipse cx="28" cy="32" rx="5" ry="6" fill="white" stroke="#333" stroke-width="2"/><circle cx="28" cy="33" r="3" fill="#333"/><ellipse cx="52" cy="32" rx="5" ry="6" fill="white" stroke="#333" stroke-width="2"/><circle cx="52" cy="33" r="3" fill="#333"/><ellipse cx="40" cy="52" rx="8" ry="6" fill="none" stroke="#333" stroke-width="3"/>' },
        { label: 'Surprised', desc: "I didn't expect that!", fill: isColor ? '#FFF9C4' : '#ccc', mouth: '<ellipse cx="28" cy="30" rx="5" ry="7" fill="white" stroke="#333" stroke-width="2"/><circle cx="28" cy="30" r="3" fill="#333"/><ellipse cx="52" cy="30" rx="5" ry="7" fill="white" stroke="#333" stroke-width="2"/><circle cx="52" cy="30" r="3" fill="#333"/><ellipse cx="40" cy="52" rx="7" ry="8" fill="none" stroke="#333" stroke-width="3"/>' },
        { label: 'Calm', desc: 'I feel peaceful', fill: isColor ? '#C8E6C9' : '#ccc', mouth: '<path d="M22 32 Q28 28 34 32" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/><path d="M46 32 Q52 28 58 32" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/><path d="M30 48 Q40 54 50 48" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>' },
        { label: 'Excited', desc: "I can't wait!", fill: isColor ? '#FFCC80' : '#ccc', mouth: '<circle cx="28" cy="30" r="4" fill="#333"/><circle cx="52" cy="30" r="4" fill="#333"/><path d="M22 46 Q40 64 58 46" fill="' + (isColor ? '#EF5350' : '#999') + '" stroke="#333" stroke-width="2"/>' },
        { label: 'Worried', desc: 'Something bothers me', fill: isColor ? '#FFE082' : '#ccc', mouth: '<circle cx="28" cy="32" r="4" fill="#333"/><circle cx="52" cy="32" r="4" fill="#333"/><path d="M28 52 Q40 46 52 52" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/><path d="M22 22 Q28 18 34 22" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/><path d="M46 22 Q52 18 58 22" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>' },
      ];
      const defaultEyes = '<circle cx="28" cy="32" r="4" fill="#333"/><circle cx="52" cy="32" r="4" fill="#333"/>';
      const faceCards = faces.map(f => {
        const needsDefaultEyes = !f.mouth.includes('cx="28" cy="3') || f.label === 'Happy' || f.label === 'Sad' || f.label === 'Calm';
        const svg = `<svg viewBox="0 0 80 80" width="60" height="60"><circle cx="40" cy="40" r="36" fill="${f.fill}" stroke="${primaryColor}" stroke-width="3"/>${needsDefaultEyes ? defaultEyes : ''}${f.mouth}</svg>`;
        return `
          <div class="card-item" style="min-height:110px; padding:12px 8px;">
            <div style="margin-bottom:6px;">${svg}</div>
            <div class="label">${f.label}</div>
            <div class="desc">${f.desc}</div>
          </div>
        `;
      }).join('');
      return `
        <div class="content">
          <div class="instruction">Cut out each card along the border. Use for matching games, emotion check-ins, circle time discussions, or display on your feelings board.</div>
          <div class="grid-4">${faceCards}</div>
          <div style="margin-top:8mm; text-align:center; font-size:10px; color:#aaa;">
            <p>Tip: Print on card stock and laminate for durability. Cut along the card borders.</p>
          </div>
        </div>
      `;
    }


    case 'p-2': // Calm Corner Poster
      return `
        <div class="poster-content">
          <div style="border:3px solid ${borderColor}; border-radius:20px; padding:20mm 15mm; background:${bgColor};">
            <h2 style="font-size:36pt; margin-bottom:5mm;">Our Calm Corner</h2>
            <p style="font-size:13px; color:#888; margin-bottom:10mm;">When you need a moment, come here and try one of these:</p>
            ${[
              { num: 1, text: 'Take 3 deep breaths', icon: '&#x1F32C;' },
              { num: 2, text: 'Squeeze a soft toy', icon: '&#x1F9F8;' },
              { num: 3, text: 'Look at a calm picture', icon: '&#x1F5BC;' },
              { num: 4, text: 'Count to 10 slowly', icon: '&#x1F522;' },
              { num: 5, text: 'Use a fidget tool', icon: '&#x1F9E9;' },
              { num: 6, text: 'Tell a grown-up how you feel', icon: '&#x1F5E3;' },
            ].map(item => `
              <div style="display:flex; align-items:center; gap:12px; padding:14px 16px; margin:4mm 0; background:white; border-radius:12px; border:2px solid ${borderColor}40;">
                <div style="width:40px; height:40px; border-radius:50%; background:${primaryColor}; color:white; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:18px; flex-shrink:0;">${item.num}</div>
                <div style="font-size:18px; font-weight:700; color:#444;">${item.text}</div>
              </div>
            `).join('')}
            <div style="margin-top:10mm; padding:12px; background:white; border-radius:12px; border:2px dashed ${borderColor};">
              <p style="font-size:16px; font-style:italic; color:${primaryColor}; font-weight:600; text-align:center;">
                "It's okay to need a moment. This is your safe space."
              </p>
            </div>
          </div>
        </div>
      `;

    case 'p-3': // Cobie Breathing Visual
      return `
        <div class="poster-content">
          <div style="border:3px solid ${borderColor}; border-radius:20px; padding:15mm; background:${bgColor};">
            <h2 style="font-size:32pt; margin-bottom:3mm;">Breathe with Cobie</h2>
            <p style="font-size:12px; color:#888; margin-bottom:8mm;">Follow these steps when you need to feel calm</p>
            <div style="max-width:160mm; margin:0 auto;">
              ${[
                { step: '1', title: 'Sit Comfortably', desc: 'Find a quiet spot and sit down gently. Put your hands on your tummy.', color: '#81C784' },
                { step: '2', title: 'Breathe In', desc: 'Breathe in slowly through your nose for 4 counts. Feel your tummy rise like a balloon.', color: '#66BB6A' },
                { step: '3', title: 'Hold', desc: 'Hold your breath gently for 2 counts. Stay very still.', color: '#4CAF50' },
                { step: '4', title: 'Breathe Out', desc: 'Breathe out slowly through your mouth for 4 counts. Like blowing out a candle.', color: '#43A047' },
                { step: '5', title: 'Repeat', desc: 'Do this 3 more times. Notice how your body feels calmer each time.', color: '#388E3C' },
              ].map(s => `
                <div class="step-row" style="padding:14px 0;">
                  <div class="step-num" style="background:${isColor ? s.color : '#888'}; width:50px; height:50px; font-size:22px;">${s.step}</div>
                  <div style="flex:1;">
                    <div class="step-title" style="color:${isColor ? s.color : '#444'}; font-size:17px;">${s.title}</div>
                    <div class="step-desc" style="font-size:13px; margin-top:3px;">${s.desc}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            <div style="margin-top:10mm; display:flex; justify-content:center; gap:8mm;">
              ${[
                { label: 'IN', sub: '1...2...3...4', bg: '#E8F5E9' },
                { label: 'HOLD', sub: '1...2', bg: '#FFF8E1' },
                { label: 'OUT', sub: '1...2...3...4', bg: '#E3F2FD' },
              ].map(b => `
                <div style="width:50mm; padding:12px; border-radius:16px; border:3px solid ${borderColor}; background:${isColor ? b.bg : '#f5f5f5'}; text-align:center;">
                  <div style="font-size:24px; font-weight:800; color:${primaryColor};">${b.label}</div>
                  <div style="font-size:14px; color:#888; margin-top:4px;">${b.sub}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

    case 'p-4': // Feelings Thermometer
      return `
        <div class="content" style="text-align:center;">
          ${nameDate}
          <div class="instruction" style="text-align:left;">Point to or colour the level that shows how you feel right now. Use throughout the day to track changes in how you feel.</div>
          <div style="display:flex; flex-direction:column; align-items:center; gap:0; margin:8mm auto; max-width:130mm;">
            ${[
              { label: 'OVERWHELMED', desc: 'I can\'t cope right now', color: '#D32F2F' },
              { label: 'VERY UPSET', desc: 'I feel really bad', color: '#E53935' },
              { label: 'UPSET', desc: 'Something is wrong', color: '#FF7043' },
              { label: 'A BIT WOBBLY', desc: 'I\'m not quite right', color: '#FFA726' },
              { label: 'OKAY', desc: 'I\'m doing alright', color: '#FFD54F' },
              { label: 'GOOD', desc: 'I feel nice', color: '#AED581' },
              { label: 'CALM & HAPPY', desc: 'I feel great!', color: '#66BB6A' },
            ].map((level, i) => `
              <div class="thermo-level" style="background:${isColor ? level.color : 'hsl(0,0%,' + (30 + i * 10) + '%)'};
                ${i === 0 ? 'border-radius:12px 12px 0 0;' : ''} ${i === 6 ? 'border-radius:0 0 12px 12px;' : ''}
                display:flex; justify-content:space-between; align-items:center;">
                <span>${level.label}</span>
                <span style="font-size:11px; font-weight:400; opacity:0.9;">${level.desc}</span>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:5mm; text-align:left;">
            <div class="section-title">How I feel right now:</div>
            <div class="writing-lines">
              <div class="writing-line"></div><div class="writing-line"></div><div class="writing-line"></div>
            </div>
            <div class="section-title" style="margin-top:5mm;">What happened to make me feel this way:</div>
            <div class="writing-lines">
              <div class="writing-line"></div><div class="writing-line"></div><div class="writing-line"></div>
            </div>
          </div>
        </div>
      `;

    case 'p-5': // Sensory Preferences Worksheet
      return `
        <div class="content">
          ${nameDate}
          <div class="instruction">Circle the things you like. Cross out the things you don't like. Draw a line under things you're not sure about.</div>
          ${[
            { sense: 'Things I Can See', items: ['Bright lights', 'Dim lights', 'Colours', 'Patterns', 'Screens', 'Sparkly things'] },
            { sense: 'Things I Can Hear', items: ['Loud music', 'Quiet sounds', 'Singing', 'Clapping', 'Silence', 'Nature sounds'] },
            { sense: 'Things I Can Touch', items: ['Soft things', 'Rough things', 'Squishy things', 'Cold things', 'Warm things', 'Sticky things'] },
            { sense: 'Things I Can Smell', items: ['Flowers', 'Food cooking', 'Fresh air', 'Paint', 'Perfume', 'Grass'] },
          ].map(section => `
            <div class="section-title">${section.sense}</div>
            <div class="circle-area">
              ${section.items.map(item => `<div class="circle-item">${item}</div>`).join('')}
            </div>
          `).join('')}
          <div class="section-title" style="margin-top:8mm;">My favourite sensory thing is:</div>
          <div class="writing-lines"><div class="writing-line"></div></div>
          <div class="section-title">A sensory thing I find difficult is:</div>
          <div class="writing-lines"><div class="writing-line"></div></div>
        </div>
      `;

    case 'p-6': // Kindness Cards
      return `
        <div class="content">
          <div class="instruction">Cut out each card. Children write or draw a kind action, then give the card to someone to brighten their day!</div>
          <div class="grid-2">
            ${Array(6).fill(null).map((_, i) => `
              <div class="card-item" style="min-height:130px; justify-content:flex-start; padding:16px 12px;">
                <div style="font-size:11px; font-weight:700; color:${primaryColor}; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Kindness Card</div>
                <div style="font-size:24px; margin:4px 0;">&#x2764;</div>
                <div style="width:85%; border-bottom:1px solid #ddd; height:18px; margin:3px 0;"></div>
                <div style="width:85%; border-bottom:1px solid #ddd; height:18px; margin:3px 0;"></div>
                <div style="width:85%; border-bottom:1px solid #ddd; height:18px; margin:3px 0;"></div>
                <div style="display:flex; justify-content:space-between; width:85%; margin-top:8px;">
                  <span style="font-size:10px; color:#aaa;">From: __________</span>
                  <span style="font-size:10px; color:#aaa;">To: __________</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    case 'p-7': // Character Cards Set
      return `
        <div class="content">
          <div class="instruction">Meet the characters from "Cobie the Cactus: Happy As He Is". Use these cards for discussion, role-play, and storytelling activities.</div>
          <div class="grid-2" style="gap:8mm;">
            ${[
              { name: 'Cobie', trait: 'The Cactus', desc: 'Cobie is learning that being different is wonderful. He is kind, thoughtful, and brave.', color: '#81C784', icon: '&#x1F335;' },
              { name: 'Tilly', trait: 'The Tulip', desc: 'Tilly is colourful and cheerful. She helps Cobie see the bright side of things.', color: '#F48FB1', icon: '&#x1F337;' },
              { name: 'Darcy', trait: 'The Daisy', desc: 'Darcy is gentle and caring. She notices when others need help.', color: '#FFD54F', icon: '&#x1F33C;' },
              { name: 'Harper', trait: 'The Sunflower', desc: 'Harper is tall and confident. She shows that everyone grows at their own pace.', color: '#FFA726', icon: '&#x1F33B;' },
            ].map(char => `
              <div class="card-item" style="min-height:160px; justify-content:flex-start; padding:20px; border-color:${isColor ? char.color : borderColor}; background:${isColor ? char.color + '10' : bgColor};">
                <div style="font-size:42px; margin-bottom:6px;">${char.icon}</div>
                <div style="font-size:22px; font-weight:800; color:${isColor ? char.color : primaryColor};">${char.name}</div>
                <div style="font-size:13px; font-weight:600; color:#888; margin:2px 0 8px;">${char.trait}</div>
                <div style="font-size:12px; color:#666; line-height:1.5; text-align:center;">${char.desc}</div>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:8mm;">
            <div class="section-title">Discussion Questions</div>
            <div style="font-size:13px; color:#555; line-height:1.8;">
              <p style="margin:4px 0;">1. Which character are you most like? Why?</p>
              <p style="margin:4px 0;">2. How does Cobie feel about being different?</p>
              <p style="margin:4px 0;">3. How do the friends help each other?</p>
              <p style="margin:4px 0;">4. What makes each character special?</p>
            </div>
          </div>
        </div>
      `;

    case 'p-8': // Assessment Checklist
      return `
        <div class="content">
          ${nameDate}
          <div class="instruction">Use this checklist to observe and record children's development across key areas. Tick when consistently observed. Date each observation.</div>
          ${[
            { title: 'Emotional Literacy', items: ['Can name at least 4 emotions', 'Recognises emotions in others', 'Uses words to express feelings', 'Shows empathy towards peers'] },
            { title: 'Sensory Awareness', items: ['Can describe sensory preferences', 'Uses calming strategies independently', 'Tolerates a range of sensory input', 'Seeks appropriate sensory input'] },
            { title: 'Communication', items: ['Takes turns in conversation', 'Uses appropriate voice volume', 'Asks for help when needed', "Listens to others' perspectives"] },
            { title: 'Self-Regulation', items: ['Can identify when feeling overwhelmed', 'Uses breathing techniques', 'Transitions between activities calmly', 'Returns to calm after upset'] },
          ].map(section => `
            <div class="section-title">${section.title}</div>
            ${section.items.map(item => `
              <div class="checklist-item">
                <div class="checkbox"></div>
                <div class="checklist-text" style="flex:1;">${item}</div>
                <div style="width:30mm; border-bottom:1px dotted #ccc; font-size:10px; color:#aaa; text-align:center;">date</div>
              </div>
            `).join('')}
          `).join('')}
          <div style="margin-top:8mm;">
            <div class="section-title">Additional Notes</div>
            <div class="writing-lines">
              <div class="writing-line"></div><div class="writing-line"></div><div class="writing-line"></div><div class="writing-line"></div>
            </div>
          </div>
        </div>
      `;

    case 'p-9': // Teacher Scripts
      return `
        <div class="content">
          <div class="instruction">Ready-to-use scripts for sensitive moments. Adapt the language to suit your children's age and understanding. Practice these so they feel natural.</div>
          ${[
            { label: 'When a child is overwhelmed', text: '"I can see you\'re feeling a lot right now. That\'s okay. Let\'s take some breaths together. In... and out... You\'re safe here. When you\'re ready, we can talk about it, or you can just sit quietly for a moment."' },
            { label: 'When peers ask about differences', text: '"Everyone is different, and that\'s what makes us special. Some people need different things to feel comfortable. Just like some of us like quiet and some like noise. We can all be kind by understanding that."' },
            { label: 'Encouraging empathy', text: '"I noticed [child\'s name] looks a bit sad today. How do you think they might be feeling? What could we do to help them feel better? Sometimes just sitting with someone or saying something kind can make a big difference."' },
            { label: 'After a difficult moment', text: '"That was a tricky moment, wasn\'t it? It\'s okay that it happened. Everyone has hard moments sometimes. What matters is what we do next. Shall we think about what might help next time?"' },
            { label: 'Starting a calm-down', text: '"I can see your body is telling you something. Let\'s go to our calm corner together. You don\'t have to talk - we can just breathe. I\'ll stay with you until you feel ready."' },
          ].map(script => `
            <div class="script-block">
              <div class="script-label">${script.label}</div>
              <div class="script-text">${script.text}</div>
            </div>
          `).join('')}
          <div style="margin-top:6mm; padding:12px; background:#FFF8E1; border-radius:8px; border:1px solid #FFE082;">
            <p style="font-size:11px; color:#F57F17; font-weight:600;">Remember: These are starting points. Adapt your tone and words to each child and situation. The most important thing is being calm, present, and genuine.</p>
          </div>
        </div>
      `;

    case 'p-10': // How Do You Feel Today? Board
      return `
        <div class="poster-content">
          <div style="border:3px solid ${borderColor}; border-radius:20px; padding:15mm; background:${bgColor};">
            <h2 style="font-size:30pt; margin-bottom:3mm;">How Do You Feel Today?</h2>
            <p style="font-size:12px; color:#888; margin-bottom:8mm;">Put your name next to how you feel</p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6mm; text-align:left;">
              ${[
                { emotion: 'Happy', color: '#66BB6A', icon: '&#x263A;' },
                { emotion: 'Sad', color: '#42A5F5', icon: '&#x2639;' },
                { emotion: 'Angry', color: '#EF5350', icon: '&#x1F620;' },
                { emotion: 'Scared', color: '#AB47BC', icon: '&#x1F628;' },
                { emotion: 'Excited', color: '#FFA726', icon: '&#x1F929;' },
                { emotion: 'Calm', color: '#26A69A', icon: '&#x1F60C;' },
                { emotion: 'Tired', color: '#78909C', icon: '&#x1F634;' },
                { emotion: 'Worried', color: '#FFCA28', icon: '&#x1F61F;' },
              ].map(e => `
                <div style="display:flex; align-items:center; gap:10px; padding:12px; border:3px solid ${isColor ? e.color : '#999'}; border-radius:14px; background:white;">
                  <div style="width:44px; height:44px; border-radius:50%; background:${isColor ? e.color : '#ddd'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <span style="font-size:24px; ${isBW ? 'filter:grayscale(1);' : ''}">${e.icon}</span>
                  </div>
                  <div style="flex:1;">
                    <div style="font-size:18px; font-weight:700; color:${isColor ? e.color : '#333'};">${e.emotion}</div>
                    <div style="height:22px; border-bottom:2px dashed #ccc; width:100%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

    case 'p-11': // Voice Volume Cards
      return `
        <div class="content">
          <div class="instruction">Cut out and display these cards. Point to the appropriate card to help children understand and use the right voice level.</div>
          <div style="display:flex; flex-direction:column; gap:8mm; margin-top:5mm;">
            ${[
              { level: 'Whisper Voice', desc: 'Very quiet - only the person right next to you can hear', volume: '1', color: '#81C784', bars: 1 },
              { level: 'Quiet Voice', desc: 'Soft speaking - people nearby can hear you', volume: '2', color: '#4FC3F7', bars: 2 },
              { level: 'Talking Voice', desc: 'Normal speaking - the whole group can hear', volume: '3', color: '#FFA726', bars: 3 },
              { level: 'Outside Voice', desc: 'Loud voice - for outdoor play only!', volume: '4', color: '#EF5350', bars: 4 },
            ].map(v => `
              <div style="border:3px solid ${isColor ? v.color : '#999'}; border-radius:16px; padding:20px; display:flex; align-items:center; gap:15px; background:${isColor ? v.color + '10' : '#fafafa'};">
                <div style="display:flex; flex-direction:column; align-items:center; gap:4px; flex-shrink:0; width:60px;">
                  <div style="width:50px; height:50px; border-radius:50%; background:${isColor ? v.color : '#888'}; color:white; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800;">${v.volume}</div>
                  <div style="display:flex; gap:3px; align-items:flex-end; height:20px;">
                    ${Array(4).fill(null).map((_, i) => `<div style="width:6px; height:${(i + 1) * 5}px; border-radius:2px; background:${i < v.bars ? (isColor ? v.color : '#666') : '#ddd'};"></div>`).join('')}
                  </div>
                </div>
                <div>
                  <div style="font-size:20px; font-weight:800; color:${isColor ? v.color : '#333'};">${v.level}</div>
                  <div style="font-size:13px; color:#666; margin-top:4px;">${v.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    case 'p-12': // Sorting Activity Mats
      return `
        <div class="content">
          <div class="instruction">Print and laminate these sorting mats. Children sort pebbles, buttons, or small objects by colour onto the correct mat. Great for fine motor skills and colour recognition!</div>
          <div class="grid-2" style="margin-top:8mm; gap:8mm;">
            ${[
              { color: '#EF5350', name: 'Red' },
              { color: '#42A5F5', name: 'Blue' },
              { color: '#66BB6A', name: 'Green' },
              { color: '#FFA726', name: 'Orange' },
              { color: '#AB47BC', name: 'Purple' },
              { color: '#FFCA28', name: 'Yellow' },
            ].map(c => `
              <div style="border:4px solid ${isColor ? c.color : '#999'}; border-radius:20px; padding:25px; text-align:center; background:${isColor ? c.color + '08' : '#fafafa'}; min-height:110px;">
                <div style="width:40px; height:40px; border-radius:50%; background:${isColor ? c.color : '#ccc'}; margin:0 auto 10px;"></div>
                <div style="font-size:28px; font-weight:800; color:${isColor ? c.color : '#555'};">${c.name}</div>
                <div style="font-size:11px; color:#999; margin-top:6px;">Place ${c.name.toLowerCase()} items here</div>
                <div style="border:2px dashed ${isColor ? c.color + '40' : '#ccc'}; border-radius:12px; height:30mm; margin-top:8px;"></div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    case 'p-13': // Sensory Walk Checklist
      return `
        <div class="content">
          ${nameDate}
          <div class="instruction">Take this sheet on your outdoor sensory walk. Tick or draw what you find! Can you find everything on the list?</div>
          ${[
            { sense: 'I Can See...', icon: '&#x1F441;', items: ['Something green', 'Something moving', 'Something tiny', 'A shadow', 'Something beautiful'] },
            { sense: 'I Can Hear...', icon: '&#x1F442;', items: ['Birds singing', 'Wind blowing', 'Footsteps', 'Water', 'Something quiet'] },
            { sense: 'I Can Touch...', icon: '&#x270B;', items: ['Something rough', 'Something smooth', 'Something cold', 'Something soft', 'Something bumpy'] },
            { sense: 'I Can Smell...', icon: '&#x1F443;', items: ['Flowers', 'Fresh air', 'Wet ground', 'Leaves', 'Something nice'] },
          ].map(section => `
            <div class="section-title"><span style="margin-right:6px;">${section.icon}</span>${section.sense}</div>
            ${section.items.map(item => `
              <div class="checklist-item">
                <div class="checkbox"></div>
                <div class="checklist-text">${item}</div>
              </div>
            `).join('')}
          `).join('')}
          <div style="margin-top:6mm;">
            <div class="section-title">My favourite thing I found was:</div>
            <div class="writing-lines"><div class="writing-line"></div><div class="writing-line"></div></div>
          </div>
        </div>
      `;

    case 'p-14': // My Quiet Garden Template
      return `
        <div class="content">
          ${nameDate}
          <div class="instruction">Design your own quiet garden! Draw the things that make you feel calm and happy. You could include flowers, trees, water, animals, or a cosy spot to sit.</div>
          <div style="border:3px dashed ${borderColor}; border-radius:16px; min-height:150mm; margin-top:5mm; position:relative; background:${isColor ? '#F1F8E9' : '#fafafa'};">
            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center; color:#ccc;">
              <svg viewBox="0 0 100 80" width="80" height="64" style="opacity:0.3;">
                <path d="M50 10 C30 10 15 25 15 40 C15 60 35 70 50 70 C65 70 85 60 85 40 C85 25 70 10 50 10Z" fill="${isColor ? '#81C784' : '#ccc'}" />
                <rect x="46" y="55" width="8" height="20" fill="${isColor ? '#8D6E63' : '#999'}" rx="2"/>
              </svg>
              <div style="font-size:14px; margin-top:8px;">Draw your quiet garden here</div>
            </div>
          </div>
          <div style="margin-top:5mm;">
            <div class="section-title">My garden makes me feel calm because...</div>
            <div class="writing-lines">
              <div class="writing-line"></div><div class="writing-line"></div>
            </div>
            <div class="section-title">In my garden I would like to...</div>
            <div class="writing-lines">
              <div class="writing-line"></div><div class="writing-line"></div>
            </div>
          </div>
        </div>
      `;

    case 'p-15': // Help Cards for Children
      return `
        <div class="content">
          <div class="instruction">Print, cut out, and laminate these cards. Children can hold up or place on their desk when they need support without having to speak.</div>
          <div style="display:flex; flex-direction:column; gap:10mm; margin-top:8mm;">
            ${[
              { text: 'I Need Help', desc: 'Show this card when you need a grown-up to help you', color: '#EF5350', bgTint: '#FFF5F5', icon: '<svg viewBox="0 0 60 60" width="48" height="48"><circle cx="30" cy="30" r="26" fill="none" stroke="#EF5350" stroke-width="4"/><text x="30" y="38" text-anchor="middle" font-size="28" font-weight="bold" fill="#EF5350">?</text></svg>' },
              { text: 'I Need a Break', desc: 'Show this card when you need a quiet moment', color: '#42A5F5', bgTint: '#F5F9FF', icon: '<svg viewBox="0 0 60 60" width="48" height="48"><circle cx="30" cy="30" r="26" fill="none" stroke="#42A5F5" stroke-width="4"/><rect x="18" y="22" width="6" height="18" rx="2" fill="#42A5F5"/><rect x="36" y="22" width="6" height="18" rx="2" fill="#42A5F5"/></svg>' },
              { text: "I'm Okay", desc: "Show this card when you're ready to carry on", color: '#66BB6A', bgTint: '#F5FFF5', icon: '<svg viewBox="0 0 60 60" width="48" height="48"><circle cx="30" cy="30" r="26" fill="none" stroke="#66BB6A" stroke-width="4"/><path d="M18 30 L26 38 L42 22" fill="none" stroke="#66BB6A" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
            ].map(card => `
              <div style="border:4px solid ${isColor ? card.color : '#999'}; border-radius:20px; padding:30px; text-align:center; background:${isColor ? card.bgTint : '#fafafa'}; min-height:80px;">
                <div style="margin-bottom:10px;">${card.icon.replace(/#EF5350|#42A5F5|#66BB6A/g, isColor ? card.color : '#666')}</div>
                <div style="font-size:28px; font-weight:800; color:${isColor ? card.color : '#333'};">${card.text}</div>
                <div style="font-size:13px; color:#888; margin-top:8px;">${card.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    case 'p-16': // Neurodiversity Info Sheet
      return `
        <div class="content">
          <div class="instruction">Teacher reference sheet. Keep this in your planning folder for quick reference when supporting neurodiverse learners.</div>
          ${[
            { title: 'What is Neurodiversity?', text: 'Neurodiversity recognises that brains work in many different ways. This includes autism, ADHD, dyslexia, dyspraxia, and other neurological differences. These are natural variations, not deficits.' },
            { title: 'Sensory Needs', text: 'Many neurodiverse children experience sensory input differently. Some may be hypersensitive (over-responsive) or hyposensitive (under-responsive) to sounds, textures, lights, or smells. Providing sensory tools and quiet spaces can help.' },
            { title: 'Communication Differences', text: 'Some children may communicate differently - through behaviour, gestures, or visual aids rather than speech. Honour all forms of communication and provide multiple ways for children to express themselves.' },
            { title: 'Supporting All Learners', text: 'Use visual schedules and clear routines. Give advance warning of transitions. Offer choices where possible. Create quiet spaces. Use concrete, literal language. Celebrate strengths and interests.' },
            { title: 'Language Matters', text: 'Use identity-first or person-first language as preferred by the individual/family. Avoid deficit-based language. Focus on needs and strengths rather than labels. Model acceptance and curiosity.' },
          ].map(section => `
            <div class="script-block">
              <div class="script-label">${section.title}</div>
              <div class="script-text">${section.text}</div>
            </div>
          `).join('')}
          <div style="margin-top:6mm; padding:12px; background:#E3F2FD; border-radius:8px; border:1px solid #90CAF9;">
            <p style="font-size:11px; color:#1565C0; font-weight:600;">Further Reading: SEND Code of Practice (2015), Autism Education Trust resources, National Autistic Society guidelines.</p>
          </div>
        </div>
      `;

    case 'p-17': // Safeguarding Notes
      return `
        <div class="content">
          <div class="instruction">Important guidance for all staff. Review regularly and follow your school's safeguarding policy at all times.</div>
          ${[
            { title: 'Inclusive Language', text: "Use positive, strengths-based language when discussing children's needs. Say 'needs support with' rather than 'can't do'. Avoid labelling children by their diagnosis." },
            { title: 'Emotional Safety', text: 'Never force a child to participate in activities that cause distress. Offer alternatives and respect boundaries. Watch for signs of anxiety or overwhelm during sensory or emotional activities.' },
            { title: 'Physical Contact', text: "Follow your school's touch policy. Some activities involve sensory materials - always ask permission before touching. Some children may need physical comfort - follow agreed protocols." },
            { title: 'When to Escalate', text: "If a child discloses abuse or harm during emotional literacy activities, follow your school's safeguarding procedure immediately. Record exactly what was said. Do not promise confidentiality to a child." },
            { title: 'Confidentiality', text: "Information about children's SEN needs, diagnoses, and family circumstances must be kept confidential. Share only on a need-to-know basis with relevant staff." },
          ].map(section => `
            <div class="script-block">
              <div class="script-label">${section.title}</div>
              <div class="script-text">${section.text}</div>
            </div>
          `).join('')}
          <div style="margin-top:6mm; padding:12px; background:#FFF3E0; border-radius:8px; border:1px solid #FFE0B2;">
            <p style="font-size:11px; color:#E65100; font-weight:600;">Remember: If in doubt, always speak to your Designated Safeguarding Lead (DSL). It is better to raise a concern that turns out to be nothing than to miss something important.</p>
          </div>
        </div>
      `;

    case 'p-18': // Curriculum Mapping Sheet
      return `
        <div class="content">
          <div class="instruction">This sheet shows how the Cobie Teacher Pack activities map to curriculum areas. Use for planning, evidence, and Ofsted preparation.</div>
          <table style="width:100%; border-collapse:collapse; margin-top:5mm; font-size:11px;">
            <thead>
              <tr style="background:${isColor ? primaryColor : '#555'}; color:white;">
                <th style="padding:10px; text-align:left; border:1px solid #ddd; width:30%;">Activity</th>
                <th style="padding:10px; text-align:left; border:1px solid #ddd; width:35%;">EYFS Area</th>
                <th style="padding:10px; text-align:left; border:1px solid #ddd; width:35%;">KS1 Link</th>
              </tr>
            </thead>
            <tbody>
              ${[
                ['Emotion Face Cards', 'PSED: Self-Regulation', 'PSHE: Feelings & Emotions'],
                ['Calm Corner Setup', 'PSED: Managing Feelings', 'PSHE: Healthy Coping Strategies'],
                ['Breathing Exercises', 'PD: Health & Self-Care', 'PE: Health & Wellbeing'],
                ['Feelings Thermometer', 'PSED: Self-Regulation', 'PSHE: Mental Health Awareness'],
                ['Sensory Walk', 'UW: The World', 'Science: Using Our Senses'],
                ['Kindness Cards', 'PSED: Relationships', 'PSHE: Caring Relationships'],
                ['Character Discussion', 'CL: Speaking', 'English: Comprehension & Discussion'],
                ['Quiet Garden Design', 'EAD: Creating', 'Art: Drawing & Design'],
                ['Pebble Sorting', 'Maths: Shape & Space', 'Maths: Sorting & Classifying'],
                ['Voice Volume', 'CL: Speaking', 'English: Spoken Language'],
              ].map((row, i) => `
                <tr style="background:${i % 2 === 0 ? '#fafafa' : 'white'};">
                  <td style="padding:8px 10px; border:1px solid #eee; font-weight:600; color:${primaryColor};">${row[0]}</td>
                  <td style="padding:8px 10px; border:1px solid #eee;">${row[1]}</td>
                  <td style="padding:8px 10px; border:1px solid #eee;">${row[2]}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top:8mm;">
            <div class="section-title">Notes for Planning</div>
            <div class="writing-lines">
              <div class="writing-line"></div><div class="writing-line"></div><div class="writing-line"></div>
            </div>
          </div>
        </div>
      `;

    default:
      return `
        <div class="content">
          <div class="instruction">${printable.description}</div>
          ${nameDate}
          <div class="writing-lines">
            ${Array(12).fill('<div class="writing-line"></div>').join('')}
          </div>
        </div>
      `;
  }
}

/* ------------------------------------------------------------------ */
/*  FULL PAGE BUILDER                                                  */
/* ------------------------------------------------------------------ */
function generatePrintableHTML(printable: Printable, format: string): string {
  const isColor = format === 'Colour';
  const isBW = format === 'B&W';


  const primaryColor = isColor ? printable.color : isBW ? '#333333' : '#666666';
  const bgColor = isColor ? printable.color + '15' : isBW ? '#ffffff' : '#f5f5f5';
  const borderColor = isColor ? printable.color : '#999999';
  const headerBg = isColor ? printable.color : isBW ? '#333333' : '#888888';

  const styles = getStyles(primaryColor, bgColor, borderColor, headerBg);
  const content = getContentHTML(printable, format, primaryColor, bgColor, borderColor, isColor, isBW);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${printable.title} - ${format} | Many Petals Learning</title>
  ${styles}
</head>
<body>
  <div class="toolbar no-print">
    <h3>${printable.title} (${format})</h3>
    <div class="toolbar-buttons">
      <button onclick="window.print()" class="primary">Print / Save as PDF</button>
      <button onclick="window.close()">Close</button>
    </div>
  </div>
  <div class="page">
    <div class="header">
      <h1>${printable.title}</h1>
      <div class="subtitle">${printable.description}</div>
      <div class="brand">Many Petals Learning &bull; Cobie Teacher Pack</div>
    </div>
    ${content}
    <div class="footer">
      Many Petals Learning &bull; Cobie Teacher Pack &bull; ${printable.title} &bull; ${format} version
    </div>
  </div>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/*  OPEN / DOWNLOAD HELPERS                                            */
/* ------------------------------------------------------------------ */

// Method 1: window.open + document.write (most compatible)
function openViaDocumentWrite(html: string): boolean {
  try {
    const win = window.open('', '_blank');
    if (!win) return false;
    win.document.open();
    win.document.write(html);
    win.document.close();
    return true;
  } catch (e) {
    return false;
  }
}

// Method 2: Blob URL
function openViaBlobURL(html: string): boolean {
  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 120000);
    return !!win;
  } catch (e) {
    return false;
  }
}

// Method 3: Data URI
function openViaDataURI(html: string): boolean {
  try {
    const encoded = encodeURIComponent(html);
    const win = window.open('data:text/html;charset=utf-8,' + encoded, '_blank');
    return !!win;
  } catch (e) {
    return false;
  }
}

// Method 4: Download as file
function downloadAsFile(html: string, filename: string): boolean {
  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  } catch (e) {
    return false;
  }
}

// Try all methods in order
function openHTML(html: string, filename: string): { success: boolean; method: string } {
  // Try document.write first
  if (openViaDocumentWrite(html)) return { success: true, method: 'tab' };
  // Try Blob URL
  if (openViaBlobURL(html)) return { success: true, method: 'tab' };
  // Try data URI
  if (openViaDataURI(html)) return { success: true, method: 'tab' };
  // Fall back to file download
  if (downloadAsFile(html, filename)) return { success: true, method: 'file' };
  return { success: false, method: 'none' };
}

/* ------------------------------------------------------------------ */
/*  PUBLIC API                                                         */
/* ------------------------------------------------------------------ */

export function downloadPrintable(printable: Printable, format: string): Promise<{ success: boolean; method: string }> {
  return new Promise((resolve) => {
    try {
      if (Platform.OS !== 'web') {
        resolve({ success: false, method: 'native' });
        return;
      }
      const html = generatePrintableHTML(printable, format);
      const filename = `${printable.title.replace(/\s+/g, '_')}_${format}.html`;
      const result = openHTML(html, filename);
      resolve(result);
    } catch (error) {
      console.error('Download error:', error);
      resolve({ success: false, method: 'error' });
    }
  });
}

export async function downloadAllPrintables(
  printables: Printable[],
  _onProgress?: (current: number, total: number) => void
): Promise<{ success: boolean; method: string }> {
  try {
    if (Platform.OS !== 'web') {
      return { success: false, method: 'native' };
    }

    // Build a combined document with FULL content for every printable
    const allPages = printables.map((p) => {
      const format = p.formats[0]; // Use first available format
      const isColor = format === 'Colour';
      const isBW = format === 'B&W';
      const primaryColor = isColor ? p.color : isBW ? '#333333' : '#666666';
      const bgColor = isColor ? p.color + '15' : isBW ? '#ffffff' : '#f5f5f5';
      const borderColor = isColor ? p.color : '#999999';

      const content = getContentHTML(p, format, primaryColor, bgColor, borderColor, isColor, isBW);

      return `
        <div class="page" style="border-left: 4px solid ${p.color};">
          <div class="header">
            <h1 style="color:${primaryColor};">${p.title}</h1>
            <div class="subtitle">${p.description}</div>
            <div class="brand">Many Petals Learning &bull; Cobie Teacher Pack &bull; ${format} version</div>
          </div>
          ${content}
          <div class="footer">
            Many Petals Learning &bull; Cobie Teacher Pack &bull; ${p.title}
          </div>
        </div>
      `;
    }).join('');

    const masterStyles = getStyles('#1B6B93', '#E3F2FD', '#1B6B93', '#1B6B93');

    const masterHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Printables - Many Petals Learning</title>
  ${masterStyles}
</head>
<body>
  <div class="toolbar no-print">
    <h3>All Printables - Many Petals Learning (${printables.length} resources)</h3>
    <div class="toolbar-buttons">
      <button onclick="window.print()" class="primary">Print All / Save as PDF</button>
      <button onclick="window.close()">Close</button>
    </div>
  </div>

  <!-- Table of Contents -->
  <div class="page" style="min-height:auto; padding-bottom:20mm;">
    <div class="header">
      <h1>Many Petals Learning</h1>
      <div class="subtitle">Cobie Teacher Pack - Complete Printable Resources</div>
      <div class="brand">${printables.length} printable resources included</div>
    </div>
    <div class="content">
      <div class="section-title">Contents</div>
      ${printables.map((p, i) => `
        <div style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px dotted #ddd;">
          <div style="width:28px; height:28px; border-radius:50%; background:${p.color}; color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; flex-shrink:0;">${i + 1}</div>
          <div style="flex:1;">
            <span style="font-weight:600; color:#333;">${p.title}</span>
            <span style="font-size:11px; color:#999; margin-left:8px;">${p.category} &bull; ${p.ageRange}</span>
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  ${allPages}
</body>
</html>`;

    const filename = 'Many_Petals_All_Printables.html';
    const result = openHTML(masterHTML, filename);
    return result;
  } catch (error) {
    console.error('Download all error:', error);
    return { success: false, method: 'error' };
  }
}
