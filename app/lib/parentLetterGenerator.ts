import { Platform } from 'react-native';
import { ParentLetter } from '../data/parentLetters';

/* ------------------------------------------------------------------ */
/*  STYLES                                                             */
/* ------------------------------------------------------------------ */
function getLetterStyles(primaryColor: string): string {
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
        background: ${primaryColor}; color: white; padding: 12px 24px;
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
      .toolbar button.primary { background: white; color: ${primaryColor}; border-color: white; }
      .page {
        max-width: 210mm; margin: 70px auto 20px; background: white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.12); position: relative;
        min-height: 297mm; padding: 18mm 20mm 25mm;
        border-radius: 4px;
      }
      .letter-header {
        text-align: center; margin-bottom: 8mm; padding-bottom: 6mm;
        border-bottom: 3px solid ${primaryColor};
      }
      .letter-header h1 { font-size: 22pt; color: ${primaryColor}; margin-bottom: 4px; font-weight: 800; }
      .letter-header .subtitle { font-size: 12pt; color: #666; font-weight: 500; margin-top: 4px; }
      .letter-header .brand { font-size: 9pt; color: #aaa; margin-top: 8px; font-style: italic; }
      .letter-header .school-info { font-size: 11pt; color: #444; margin-top: 8px; font-weight: 600; }
      .letter-body { margin-top: 6mm; font-size: 11.5pt; line-height: 1.7; color: #333; }
      .letter-body p { margin-bottom: 4mm; }
      .letter-body h2 { font-size: 14pt; color: ${primaryColor}; margin: 6mm 0 3mm; font-weight: 700; }
      .letter-body h3 { font-size: 12pt; color: ${primaryColor}; margin: 5mm 0 2mm; font-weight: 700; }
      .letter-body ul { margin-left: 6mm; margin-bottom: 4mm; }
      .letter-body li { margin-bottom: 2mm; }
      .info-box {
        background: ${primaryColor}10; border-left: 4px solid ${primaryColor};
        padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 5mm 0;
        font-size: 11pt; line-height: 1.6;
      }
      .activity-card {
        border: 2px solid ${primaryColor}30; border-radius: 12px; padding: 14px 16px;
        margin: 4mm 0; background: #fafafa;
      }
      .activity-card h4 { font-size: 12pt; color: ${primaryColor}; font-weight: 700; margin-bottom: 4px; }
      .activity-card p { font-size: 10.5pt; color: #555; margin: 0; }
      .activity-card .age { font-size: 9pt; color: #999; margin-top: 4px; font-style: italic; }
      .question-block {
        border-bottom: 1px solid #ddd; padding: 10px 0;
      }
      .question-block label { font-size: 11pt; font-weight: 600; color: #333; display: block; margin-bottom: 4px; }
      .question-block .options { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 4px; }
      .question-block .option {
        display: flex; align-items: center; gap: 6px; font-size: 10.5pt; color: #555;
      }
      .checkbox { width: 16px; height: 16px; border: 2px solid ${primaryColor}; border-radius: 3px; flex-shrink: 0; }
      .radio { width: 16px; height: 16px; border: 2px solid ${primaryColor}; border-radius: 50%; flex-shrink: 0; }
      .write-line { border-bottom: 1px solid #ccc; height: 10mm; margin: 2mm 0; }
      .write-area { border: 1px solid #ccc; border-radius: 6px; min-height: 20mm; margin: 3mm 0; padding: 6px; }
      .progress-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; margin: 4mm 0; }
      .progress-item {
        border: 2px solid #eee; border-radius: 10px; padding: 12px; text-align: center;
      }
      .progress-item h4 { font-size: 11pt; color: ${primaryColor}; margin-bottom: 4px; }
      .progress-item .rating { display: flex; justify-content: center; gap: 6px; margin: 6px 0; }
      .progress-item .dot { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ccc; }
      .progress-item .dot-label { font-size: 8pt; color: #999; }
      .sign-off { margin-top: 8mm; padding-top: 5mm; border-top: 1px solid #eee; }
      .sign-off p { font-size: 11pt; color: #444; margin-bottom: 2mm; }
      .footer {
        position: absolute; bottom: 12mm; left: 20mm; right: 20mm;
        text-align: center; font-size: 8pt; color: #bbb;
        border-top: 1px solid #eee; padding-top: 3mm;
      }
      .scale-row { display: flex; align-items: center; gap: 4px; margin: 3mm 0; }
      .scale-label { font-size: 9pt; color: #888; min-width: 60px; }
      .scale-dots { display: flex; gap: 6px; }
      .scale-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid ${primaryColor}40; }
    </style>
  `;
}

/* ------------------------------------------------------------------ */
/*  CONTENT GENERATORS                                                 */
/* ------------------------------------------------------------------ */
function getLetterContent(letter: ParentLetter, schoolName: string, teacherName: string, primaryColor: string): string {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  switch (letter.id) {
    /* ============================================================ */
    /* PL-1: PROGRAMME INTRODUCTION LETTER                          */
    /* ============================================================ */
    case 'pl-1':
      return `
        <div class="letter-body">
          <p style="text-align:right; color:#888; font-size:10pt;">${dateStr}</p>
          <p>Dear Parents and Carers,</p>
          <p>I am writing to let you know about an exciting programme we are introducing in our class called <strong>"Cobie the Cactus: Happy As He Is"</strong>, developed by <em>Many Petals Learning</em>.</p>

          <h2>What is the Cobie Programme?</h2>
          <p>The Cobie programme is a carefully designed emotional literacy and wellbeing resource for Early Years and Key Stage 1 children. Through the story of Cobie the Cactus and his garden friends, children learn to:</p>
          <ul>
            <li><strong>Identify and name their emotions</strong> &ndash; understanding what different feelings look and feel like</li>
            <li><strong>Develop calming strategies</strong> &ndash; breathing techniques, sensory tools, and self-regulation skills</li>
            <li><strong>Build empathy and kindness</strong> &ndash; understanding that everyone is different and that&rsquo;s wonderful</li>
            <li><strong>Explore their senses</strong> &ndash; becoming aware of sensory preferences and how to manage sensory experiences</li>
            <li><strong>Communicate their needs</strong> &ndash; using words, visual aids, and strategies to express how they feel</li>
          </ul>

          <div class="info-box">
            <strong>Why does this matter?</strong> Research shows that children who develop strong emotional literacy in their early years are better equipped to manage challenges, build positive relationships, and engage with learning. The Cobie programme is inclusive and designed to support all children, including those with additional needs.
          </div>

          <h2>What Will My Child Be Doing?</h2>
          <p>Over the coming weeks, your child will take part in a range of activities including:</p>
          <ul>
            <li>Listening to the Cobie story and discussing the characters and themes</li>
            <li>Daily emotion check-ins using visual tools like feelings thermometers and emotion cards</li>
            <li>Calm corner activities with breathing exercises and sensory tools</li>
            <li>Creative activities such as drawing, role-play, and sensory exploration</li>
            <li>Circle time discussions about feelings, kindness, and being unique</li>
          </ul>

          <h2>How Can You Help at Home?</h2>
          <p>You can support your child&rsquo;s emotional literacy development at home by:</p>
          <ul>
            <li>Asking about their day and naming emotions together (&ldquo;It sounds like you felt proud!&rdquo;)</li>
            <li>Practising deep breathing together when things feel tricky</li>
            <li>Reading stories that explore feelings and discussing the characters</li>
            <li>Modelling emotional language yourself (&ldquo;I&rsquo;m feeling a bit frustrated, so I&rsquo;m going to take a deep breath&rdquo;)</li>
          </ul>

          <p>We will be sending home a <strong>Home Activities Sheet</strong> with more specific ideas, and a <strong>Sensory Preferences Questionnaire</strong> that we would be grateful if you could complete and return. This will help us understand your child&rsquo;s individual sensory needs.</p>

          <p>If you have any questions about the programme, please don&rsquo;t hesitate to get in touch.</p>

          <div class="sign-off">
            <p>Warm regards,</p>
            <p style="margin-top:8mm;"><strong>${teacherName || '___________________'}</strong></p>
            <p style="color:#888; font-size:10pt;">${schoolName || '___________________'}</p>
          </div>
        </div>
      `;

    /* ============================================================ */
    /* PL-2: HOME ACTIVITIES SHEET                                   */
    /* ============================================================ */
    case 'pl-2':
      return `
        <div class="letter-body">
          <div class="info-box">
            <strong>For Parents &amp; Carers:</strong> These simple activities can be done at home to reinforce the emotional literacy skills your child is learning at school through the Cobie programme. Choose activities that feel natural and enjoyable &ndash; there&rsquo;s no pressure to do them all!
          </div>

          <h2>Talking About Feelings</h2>
          <div class="activity-card">
            <h4>Emotion Check-In at Mealtimes</h4>
            <p>At dinner or breakfast, go around the table and share one feeling from the day. Use simple prompts: &ldquo;Today I felt... because...&rdquo; This normalises talking about emotions and builds vocabulary.</p>
            <div class="age">All ages &bull; 5 minutes &bull; No materials needed</div>
          </div>
          <div class="activity-card">
            <h4>Feelings Faces Drawing</h4>
            <p>Draw simple face outlines together and add different expressions. Ask your child to name each emotion and think of a time they felt that way. Display them on the fridge!</p>
            <div class="age">Ages 3&ndash;7 &bull; 15 minutes &bull; Paper and crayons</div>
          </div>
          <div class="activity-card">
            <h4>Story Time Emotion Spotting</h4>
            <p>While reading bedtime stories, pause to ask: &ldquo;How do you think this character is feeling? How can you tell? Have you ever felt like that?&rdquo;</p>
            <div class="age">All ages &bull; During reading time &bull; Any storybook</div>
          </div>

          <h2>Calming Strategies</h2>
          <div class="activity-card">
            <h4>Balloon Breathing</h4>
            <p>Sit together and pretend your tummy is a balloon. Breathe in slowly through your nose (balloon inflates) and out through your mouth (balloon deflates). Count to 4 for each breath. Do 5 rounds together.</p>
            <div class="age">All ages &bull; 3 minutes &bull; No materials needed</div>
          </div>
          <div class="activity-card">
            <h4>Calm Down Jar</h4>
            <p>Fill a jar with water, glitter glue, and food colouring. When your child feels upset, shake the jar and watch the glitter settle. Explain: &ldquo;Your feelings are like the glitter &ndash; they&rsquo;re swirling now, but they will settle.&rdquo;</p>
            <div class="age">Ages 3&ndash;7 &bull; 20 minutes to make &bull; Jar, glitter glue, water</div>
          </div>
          <div class="activity-card">
            <h4>Five Senses Grounding</h4>
            <p>When your child feels anxious, guide them through: &ldquo;Tell me 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.&rdquo;</p>
            <div class="age">Ages 4+ &bull; 5 minutes &bull; No materials needed</div>
          </div>

          <h2>Sensory Exploration</h2>
          <div class="activity-card">
            <h4>Texture Treasure Hunt</h4>
            <p>Go on a walk around the house or garden and collect items with different textures: smooth, rough, soft, bumpy, cold, warm. Talk about which textures your child likes and dislikes.</p>
            <div class="age">All ages &bull; 15 minutes &bull; Items from around the home</div>
          </div>
          <div class="activity-card">
            <h4>Listening Walk</h4>
            <p>Go for a quiet walk outside. Challenge your child to count how many different sounds they can hear. Whisper about each sound: &ldquo;Can you hear the birds? What about the wind?&rdquo;</p>
            <div class="age">All ages &bull; 15 minutes &bull; Outdoor space</div>
          </div>

          <h2>Kindness &amp; Empathy</h2>
          <div class="activity-card">
            <h4>Kindness Jar</h4>
            <p>Place an empty jar in a visible spot. Each time someone in the family does something kind, add a pom-pom, button, or small stone. When the jar is full, celebrate together!</p>
            <div class="age">All ages &bull; Ongoing &bull; Jar and small objects</div>
          </div>
          <div class="activity-card">
            <h4>Compliment Circle</h4>
            <p>At bedtime, take turns saying one kind thing about each family member. This builds positive self-image and teaches children to notice good qualities in others.</p>
            <div class="age">All ages &bull; 5 minutes &bull; No materials needed</div>
          </div>

          <div class="info-box" style="margin-top:8mm;">
            <strong>Remember:</strong> The most powerful thing you can do is model emotional literacy yourself. When you name your own feelings, use calming strategies, and show empathy, your child learns that these skills are for everyone &ndash; not just children.
          </div>

          <div class="sign-off">
            <p style="color:#888; font-size:10pt;">Prepared by ${teacherName || '___________________'} &bull; ${schoolName || '___________________'}</p>
          </div>
        </div>
      `;

    /* ============================================================ */
    /* PL-3: SENSORY PREFERENCES QUESTIONNAIRE                      */
    /* ============================================================ */
    case 'pl-3':
      return `
        <div class="letter-body">
          <div class="info-box">
            <strong>Dear Parent/Carer,</strong> We would be grateful if you could complete this questionnaire about your child&rsquo;s sensory preferences. This information will help us create a comfortable and supportive learning environment. All information is kept confidential. Please return to ${teacherName || 'your child&rsquo;s class teacher'} by ____________.
          </div>

          <div class="question-block">
            <label>Child&rsquo;s Name:</label>
            <div class="write-line"></div>
          </div>
          <div class="question-block">
            <label>Date of Birth:</label>
            <div class="write-line"></div>
          </div>
          <div class="question-block">
            <label>Completed by:</label>
            <div class="write-line"></div>
          </div>

          <h2>Sight (Visual)</h2>
          <div class="question-block">
            <label>How does your child respond to bright or flashing lights?</label>
            <div class="options">
              <div class="option"><div class="radio"></div> Enjoys them</div>
              <div class="option"><div class="radio"></div> Doesn&rsquo;t mind</div>
              <div class="option"><div class="radio"></div> Finds them uncomfortable</div>
              <div class="option"><div class="radio"></div> Avoids them</div>
            </div>
          </div>
          <div class="question-block">
            <label>Does your child have a preference for certain colours or visual patterns?</label>
            <div class="write-line"></div>
          </div>
          <div class="question-block">
            <label>How does your child respond to busy or cluttered visual environments?</label>
            <div class="options">
              <div class="option"><div class="radio"></div> Comfortable</div>
              <div class="option"><div class="radio"></div> Slightly unsettled</div>
              <div class="option"><div class="radio"></div> Becomes distressed</div>
            </div>
          </div>

          <h2>Sound (Auditory)</h2>
          <div class="question-block">
            <label>How does your child respond to loud or unexpected noises?</label>
            <div class="options">
              <div class="option"><div class="radio"></div> Doesn&rsquo;t notice</div>
              <div class="option"><div class="radio"></div> Notices but copes</div>
              <div class="option"><div class="radio"></div> Covers ears / becomes upset</div>
              <div class="option"><div class="radio"></div> Seeks out loud sounds</div>
            </div>
          </div>
          <div class="question-block">
            <label>Are there particular sounds your child finds soothing or distressing?</label>
            <div class="write-line"></div>
            <div class="write-line"></div>
          </div>
          <div class="question-block">
            <label>Does your child find it difficult to concentrate with background noise?</label>
            <div class="options">
              <div class="option"><div class="radio"></div> Yes, often</div>
              <div class="option"><div class="radio"></div> Sometimes</div>
              <div class="option"><div class="radio"></div> Rarely</div>
              <div class="option"><div class="radio"></div> Not at all</div>
            </div>
          </div>

          <h2>Touch (Tactile)</h2>
          <div class="question-block">
            <label>How does your child respond to different textures (e.g., sand, paint, playdough)?</label>
            <div class="options">
              <div class="option"><div class="radio"></div> Enjoys most textures</div>
              <div class="option"><div class="radio"></div> Prefers certain textures</div>
              <div class="option"><div class="radio"></div> Avoids messy play</div>
              <div class="option"><div class="radio"></div> Seeks out tactile experiences</div>
            </div>
          </div>
          <div class="question-block">
            <label>Does your child have clothing preferences (e.g., avoids tags, seams, certain fabrics)?</label>
            <div class="write-line"></div>
            <div class="write-line"></div>
          </div>
          <div class="question-block">
            <label>How does your child respond to physical contact (hugs, hand-holding)?</label>
            <div class="options">
              <div class="option"><div class="radio"></div> Seeks it out</div>
              <div class="option"><div class="radio"></div> Enjoys it from familiar people</div>
              <div class="option"><div class="radio"></div> Tolerates it</div>
              <div class="option"><div class="radio"></div> Avoids it</div>
            </div>
          </div>

          <h2>Taste &amp; Smell</h2>
          <div class="question-block">
            <label>Does your child have strong food preferences or aversions?</label>
            <div class="write-line"></div>
            <div class="write-line"></div>
          </div>
          <div class="question-block">
            <label>Are there particular smells your child finds comforting or upsetting?</label>
            <div class="write-line"></div>
          </div>

          <h2>Movement &amp; Body Awareness</h2>
          <div class="question-block">
            <label>Does your child seek out movement (spinning, jumping, rocking)?</label>
            <div class="options">
              <div class="option"><div class="radio"></div> Frequently</div>
              <div class="option"><div class="radio"></div> Sometimes</div>
              <div class="option"><div class="radio"></div> Rarely</div>
            </div>
          </div>
          <div class="question-block">
            <label>Does your child find it difficult to sit still for extended periods?</label>
            <div class="options">
              <div class="option"><div class="radio"></div> Yes, often</div>
              <div class="option"><div class="radio"></div> Sometimes</div>
              <div class="option"><div class="radio"></div> Rarely</div>
            </div>
          </div>

          <h2>General Wellbeing</h2>
          <div class="question-block">
            <label>What helps your child feel calm when they are upset?</label>
            <div class="write-line"></div>
            <div class="write-line"></div>
          </div>
          <div class="question-block">
            <label>Is there anything else you would like us to know about your child&rsquo;s sensory needs or preferences?</label>
            <div class="write-area"></div>
          </div>
          <div class="question-block">
            <label>Does your child have any diagnosed conditions we should be aware of (e.g., autism, ADHD, sensory processing difficulties)?</label>
            <div class="write-line"></div>
            <div class="write-line"></div>
          </div>

          <div class="sign-off" style="margin-top:10mm;">
            <p><strong>Thank you for taking the time to complete this questionnaire.</strong> Your insights are invaluable in helping us support your child.</p>
            <p style="margin-top:4mm; color:#888; font-size:10pt;">Please return to: ${teacherName || '___________________'} &bull; ${schoolName || '___________________'}</p>
          </div>
        </div>
      `;

    /* ============================================================ */
    /* PL-4: PROGRESS REPORT TEMPLATE                               */
    /* ============================================================ */
    case 'pl-4':
      return `
        <div class="letter-body">
          <p style="text-align:right; color:#888; font-size:10pt;">${dateStr}</p>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:4mm; margin-bottom:6mm;">
            <div class="question-block">
              <label>Child&rsquo;s Name:</label>
              <div class="write-line"></div>
            </div>
            <div class="question-block">
              <label>Class / Year Group:</label>
              <div class="write-line"></div>
            </div>
            <div class="question-block">
              <label>Report Period:</label>
              <div class="write-line"></div>
            </div>
            <div class="question-block">
              <label>Teacher:</label>
              <div class="write-line" style="position:relative;"><span style="position:absolute; top:2px; left:0; color:#aaa; font-size:10pt;">${teacherName || ''}</span></div>
            </div>
          </div>

          <p>Dear Parent/Carer,</p>
          <p>This report provides an update on your child&rsquo;s progress in emotional literacy and wellbeing, as part of the Cobie programme at ${schoolName || 'our school'}.</p>

          <h2>Progress Overview</h2>
          <p style="font-size:10pt; color:#888; margin-bottom:3mm;">Rating scale: 1 = Emerging &bull; 2 = Developing &bull; 3 = Secure &bull; 4 = Exceeding</p>

          <div class="progress-grid">
            ${[
              { area: 'Emotional Awareness', desc: 'Identifying and naming emotions in self and others' },
              { area: 'Self-Regulation', desc: 'Using calming strategies and managing strong feelings' },
              { area: 'Empathy & Kindness', desc: 'Showing understanding and care for others\' feelings' },
              { area: 'Communication', desc: 'Expressing needs and feelings using words or visual aids' },
              { area: 'Sensory Awareness', desc: 'Understanding and managing sensory preferences' },
              { area: 'Social Skills', desc: 'Turn-taking, sharing, and positive peer interactions' },
            ].map(item => `
              <div class="progress-item">
                <h4>${item.area}</h4>
                <p style="font-size:9pt; color:#888; margin:2px 0 6px;">${item.desc}</p>
                <div class="rating">
                  <div style="text-align:center;"><div class="dot"></div><div class="dot-label">1</div></div>
                  <div style="text-align:center;"><div class="dot"></div><div class="dot-label">2</div></div>
                  <div style="text-align:center;"><div class="dot"></div><div class="dot-label">3</div></div>
                  <div style="text-align:center;"><div class="dot"></div><div class="dot-label">4</div></div>
                </div>
              </div>
            `).join('')}
          </div>

          <h2>Key Strengths</h2>
          <div class="write-area" style="min-height:25mm;"></div>

          <h2>Areas for Development</h2>
          <div class="write-area" style="min-height:25mm;"></div>

          <h2>Strategies Used in School</h2>
          <p style="font-size:10pt; color:#666; margin-bottom:3mm;">Tick all that apply:</p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:2mm;">
            ${[
              'Calm corner / quiet space',
              'Breathing exercises',
              'Emotion check-in cards',
              'Feelings thermometer',
              'Sensory tools (fidgets, etc.)',
              'Visual schedule / timetable',
              'Social stories',
              'Help / break cards',
              'Peer buddy system',
              'Small group work',
            ].map(s => `
              <div style="display:flex; align-items:center; gap:6px; padding:3px 0;">
                <div class="checkbox"></div>
                <span style="font-size:10pt; color:#444;">${s}</span>
              </div>
            `).join('')}
          </div>

          <h2>Suggestions for Home</h2>
          <div class="write-area" style="min-height:20mm;"></div>

          <h2>Emotional Check-In Summary</h2>
          <p style="font-size:10pt; color:#666; margin-bottom:3mm;">Most frequently recorded emotions this term:</p>
          <div style="display:flex; gap:4mm; flex-wrap:wrap; margin-bottom:4mm;">
            ${['Happy', 'Calm', 'Excited', 'Worried', 'Sad', 'Angry', 'Scared', 'Tired'].map(e => `
              <div style="border:2px solid #ddd; border-radius:8px; padding:6px 12px; text-align:center; min-width:60px;">
                <div style="font-size:10pt; font-weight:600; color:#444;">${e}</div>
                <div class="write-line" style="height:6mm; margin:2px 0 0;"></div>
              </div>
            `).join('')}
          </div>

          <h2>Additional Notes</h2>
          <div class="write-area" style="min-height:25mm;"></div>

          <div class="sign-off" style="margin-top:8mm;">
            <p>If you would like to discuss this report further, please don&rsquo;t hesitate to arrange a meeting.</p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8mm; margin-top:6mm;">
              <div>
                <p style="font-size:10pt; color:#888;">Teacher&rsquo;s signature:</p>
                <div class="write-line" style="margin-top:10mm;"></div>
                <p style="font-size:10pt; color:#888; margin-top:2mm;">${teacherName || ''}</p>
              </div>
              <div>
                <p style="font-size:10pt; color:#888;">Parent/Carer&rsquo;s signature:</p>
                <div class="write-line" style="margin-top:10mm;"></div>
                <p style="font-size:10pt; color:#888; margin-top:2mm;">Date: _______________</p>
              </div>
            </div>
          </div>
        </div>
      `;

    default:
      return `<div class="letter-body"><p>${letter.description}</p></div>`;
  }
}

/* ------------------------------------------------------------------ */
/*  FULL PAGE BUILDER                                                  */
/* ------------------------------------------------------------------ */
function generateLetterHTML(letter: ParentLetter, schoolName: string, teacherName: string): string {
  const primaryColor = letter.color;
  const styles = getLetterStyles(primaryColor);
  const content = getLetterContent(letter, schoolName, teacherName, primaryColor);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${letter.title} | Many Petals Learning</title>
  ${styles}
</head>
<body>
  <div class="toolbar no-print">
    <h3>${letter.title}</h3>
    <div class="toolbar-buttons">
      <button onclick="window.print()" class="primary">Print / Save as PDF</button>
      <button onclick="window.close()">Close</button>
    </div>
  </div>
  <div class="page">
    <div class="letter-header">
      <div class="school-info">${schoolName || ''}</div>
      <h1>${letter.title}</h1>
      <div class="subtitle">${letter.subtitle}</div>
      <div class="brand">Many Petals Learning &bull; Cobie Teacher Pack</div>
    </div>
    ${content}
    <div class="footer">
      Many Petals Learning &bull; Cobie Teacher Pack &bull; ${letter.title} &bull; Parent Communication
    </div>
  </div>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/*  OPEN / DOWNLOAD HELPERS                                            */
/* ------------------------------------------------------------------ */
function openViaDocumentWrite(html: string): boolean {
  try {
    const win = window.open('', '_blank');
    if (!win) return false;
    win.document.open();
    win.document.write(html);
    win.document.close();
    return true;
  } catch (e) { return false; }
}

function openViaBlobURL(html: string): boolean {
  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 120000);
    return !!win;
  } catch (e) { return false; }
}

function openViaDataURI(html: string): boolean {
  try {
    const encoded = encodeURIComponent(html);
    const win = window.open('data:text/html;charset=utf-8,' + encoded, '_blank');
    return !!win;
  } catch (e) { return false; }
}

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
  } catch (e) { return false; }
}

function openHTML(html: string, filename: string): { success: boolean; method: string } {
  if (openViaDocumentWrite(html)) return { success: true, method: 'tab' };
  if (openViaBlobURL(html)) return { success: true, method: 'tab' };
  if (openViaDataURI(html)) return { success: true, method: 'tab' };
  if (downloadAsFile(html, filename)) return { success: true, method: 'file' };
  return { success: false, method: 'none' };
}

/* ------------------------------------------------------------------ */
/*  PUBLIC API                                                         */
/* ------------------------------------------------------------------ */
export function downloadParentLetter(
  letter: ParentLetter,
  schoolName: string,
  teacherName: string
): Promise<{ success: boolean; method: string }> {
  return new Promise((resolve) => {
    try {
      if (Platform.OS !== 'web') {
        resolve({ success: false, method: 'native' });
        return;
      }
      const html = generateLetterHTML(letter, schoolName, teacherName);
      const filename = `${letter.title.replace(/\s+/g, '_')}.html`;
      const result = openHTML(html, filename);
      resolve(result);
    } catch (error) {
      console.error('Parent letter download error:', error);
      resolve({ success: false, method: 'error' });
    }
  });
}

export function downloadAllParentLetters(
  letters: ParentLetter[],
  schoolName: string,
  teacherName: string
): Promise<{ success: boolean; method: string }> {
  return new Promise((resolve) => {
    try {
      if (Platform.OS !== 'web') {
        resolve({ success: false, method: 'native' });
        return;
      }

      const primaryColor = '#1B6B93';
      const styles = getLetterStyles(primaryColor);

      const allPages = letters.map((letter) => {
        const content = getLetterContent(letter, schoolName, teacherName, letter.color);
        return `
          <div class="page" style="border-left: 4px solid ${letter.color};">
            <div class="letter-header">
              <div class="school-info">${schoolName || ''}</div>
              <h1 style="color:${letter.color};">${letter.title}</h1>
              <div class="subtitle">${letter.subtitle}</div>
              <div class="brand">Many Petals Learning &bull; Cobie Teacher Pack</div>
            </div>
            ${content}
            <div class="footer">
              Many Petals Learning &bull; Cobie Teacher Pack &bull; ${letter.title}
            </div>
          </div>
        `;
      }).join('');

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parent Communication Pack | Many Petals Learning</title>
  ${styles}
</head>
<body>
  <div class="toolbar no-print">
    <h3>Parent Communication Pack (${letters.length} documents)</h3>
    <div class="toolbar-buttons">
      <button onclick="window.print()" class="primary">Print All / Save as PDF</button>
      <button onclick="window.close()">Close</button>
    </div>
  </div>
  <div class="page" style="min-height:auto; padding-bottom:20mm;">
    <div class="letter-header">
      <div class="school-info">${schoolName || ''}</div>
      <h1>Parent Communication Pack</h1>
      <div class="subtitle">Cobie Emotional Literacy Programme</div>
      <div class="brand">Many Petals Learning &bull; Cobie Teacher Pack</div>
    </div>
    <div class="letter-body">
      <h2>Contents</h2>
      ${letters.map((l, i) => `
        <div style="display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px dotted #ddd;">
          <div style="width:28px; height:28px; border-radius:50%; background:${l.color}; color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; flex-shrink:0;">${i + 1}</div>
          <div>
            <div style="font-weight:600; color:#333;">${l.title}</div>
            <div style="font-size:10pt; color:#888;">${l.subtitle}</div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  ${allPages}
</body>
</html>`;

      const filename = 'Parent_Communication_Pack.html';
      const result = openHTML(html, filename);
      resolve(result);
    } catch (error) {
      console.error('Download all parent letters error:', error);
      resolve({ success: false, method: 'error' });
    }
  });
}
