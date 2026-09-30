begin;

-- Freeze the approved Manchester cohort at the authoritative DfE URN.
-- Source: Edubase snapshot 2026-09-16, 140 unique open settings serving ages 3-7.
create table if not exists public.manc50_eligible_schools (
  dfe_urn integer primary key check (dfe_urn between 100000 and 999999),
  school_key text not null unique check (school_key ~ '^dfe-urn-[0-9]{6}$'),
  school_name text not null,
  la_name text not null,
  establishment_type text not null,
  phase text,
  statutory_low_age integer not null,
  statutory_high_age integer not null,
  address_line_1 text not null,
  locality text,
  town text,
  postcode text not null,
  postcode_lookup text not null,
  website text,
  telephone text,
  priority_tier text not null,
  priority_reason text not null,
  setting_type text not null check (setting_type in (
    'Special school',
    'SEND provision',
    'Mainstream primary',
    'Nursery / early years',
    'Other eligible setting'
  )),
  send_priority boolean not null default false,
  source_snapshot date not null,
  eligible_for_manc50 boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (statutory_low_age <= 7 and statutory_high_age >= 3)
);

create index if not exists manc50_eligible_schools_postcode
  on public.manc50_eligible_schools (postcode_lookup)
  where eligible_for_manc50;

alter table public.manc50_eligible_schools enable row level security;
revoke all on table public.manc50_eligible_schools from public, anon, authenticated;
grant all on table public.manc50_eligible_schools to service_role;

insert into public.manc50_eligible_schools (
  dfe_urn,
  school_key,
  school_name,
  la_name,
  establishment_type,
  phase,
  statutory_low_age,
  statutory_high_age,
  address_line_1,
  locality,
  town,
  postcode,
  postcode_lookup,
  website,
  telephone,
  priority_tier,
  priority_reason,
  setting_type,
  send_priority,
  source_snapshot,
  eligible_for_manc50
) values
  (150009, 'dfe-urn-150009', 'Abraham Moss Community School', 'Manchester', 'Academy converter', 'All-through', 3, 16, 'Crescent Road', 'Crumpsall', 'Manchester', 'M8 5UF', 'M85UF', 'www.abrahammoss.co.uk', '01615325400', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (105389, 'dfe-urn-105389', 'Alma Park Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Errwood Road', 'Levenshulme', 'Manchester', 'M19 2PF', 'M192PF', 'www.almapark.manchester.sch.uk/', '01612248789', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (133770, 'dfe-urn-133770', 'Ashbury Meadow Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Rylance Street', 'Beswick', 'Manchester', 'M11 3NA', 'M113NA', 'www.ashburymeadow.co.uk', '01619892999', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (127802, 'dfe-urn-127802', 'Ashgate Specialist Support Primary School', 'Manchester', 'Community special school', 'Not applicable', 3, 11, 'Crossacres Road', null, 'Manchester', 'M22 5DR', 'M225DR', 'http://www.ashgateprimaryschool.co.uk/', '01613595322', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'Special school', true, date '2026-09-16', true),
  (144128, 'dfe-urn-144128', 'Barlow Hall Primary School', 'Manchester', 'Academy converter', 'Primary', 2, 11, 'Darley Avenue', 'Chorlton-Cum-Hardy', 'Manchester', 'M21 7JG', 'M217JG', 'http://barlowhallprimary.co.uk/', '01618812158', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (132241, 'dfe-urn-132241', 'Benchill Primary School', 'Manchester', 'Foundation school', 'Primary', 3, 11, 'Benchill Road', 'Wythenshawe', 'Manchester', 'M22 8EJ', 'M228EJ', 'www.benchill.manchester.sch.uk/', '01619983075', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (105397, 'dfe-urn-105397', 'Bowker Vale Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Middleton Road', 'Higher Crumpsall', 'Manchester', 'M8 4NB', 'M84NB', 'www.bowkervale.manchester.sch.uk', '01617405993', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (105467, 'dfe-urn-105467', 'Broad Oak Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Broad Oak Lane', 'East Didsbury', 'Manchester', 'M20 5QB', 'M205QB', 'www.broadoak.manchester.sch.uk', '01614456577', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (151378, 'dfe-urn-151378', 'Camberwell Park Specialist Support School', 'Manchester', 'Academy special sponsor led', 'Not applicable', 3, 11, 'Brookside Road', 'Moston', 'Manchester', 'M40 9GJ', 'M409GJ', 'www.camberwellpark.org.uk', '01616827537', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'Special school', true, date '2026-09-16', true),
  (150612, 'dfe-urn-150612', 'Co-op Academy Medlock', 'Manchester', 'Academy sponsor led', 'Primary', 2, 11, 'Wadeson Road', 'Chorlton-on-Medlock', 'Manchester', 'M13 9UJ', 'M139UJ', 'https://www.medlock.coopacademies.co.uk/', '01612731830', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (143763, 'dfe-urn-143763', 'Gorton Primary School', 'Manchester', 'Free schools', 'Primary', 3, 11, 'Mount Road', 'Gorton', 'Manchester', 'M18 7GR', 'M187GR', 'https://gorton-manchester.org.uk/', '01615050910', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (105471, 'dfe-urn-105471', 'Higher Openshaw Community School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Saunton Road', 'Higher Openshaw', 'Manchester', 'M11 1AJ', 'M111AJ', 'www.higher-openshaw.manchester.sch.uk', '01612233549', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (105608, 'dfe-urn-105608', 'Lancasterian School', 'Manchester', 'Community special school', 'Not applicable', 3, 16, 'Elizabeth Slinger Road', 'West Didsbury', 'Manchester', 'M20 2XA', 'M202XA', 'www.lancasterian.manchester.co.uk', '01614450123', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'Special school', true, date '2026-09-16', true),
  (142437, 'dfe-urn-142437', 'Newall Green Primary School', 'Manchester', 'Academy converter', 'Primary', 2, 11, 'Firbank Road', 'Newall Green', 'Manchester', 'M23 2YH', 'M232YH', 'www.newallgreen.manchester.sch.uk', '01614372872', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (142360, 'dfe-urn-142360', 'Old Moat Primary School', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Old Moat Lane', 'Withington', 'Manchester', 'M20 3FN', 'M203FN', 'www.oldmoat.manchester.sch.uk', '01614454208', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (105470, 'dfe-urn-105470', 'Pike Fold Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Old Market Street', 'Blackley', 'Manchester', 'M9 8QP', 'M98QP', 'www.pikefold.manchester.sch.uk', '01617023669', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (147885, 'dfe-urn-147885', 'Prospect House Specialist Support Primary School', 'Manchester', 'Free schools special', 'Not applicable', 3, 11, '56 Bank House Road', null, 'MANCHESTER', 'M9 8LT', 'M98LT', 'https://www.prospecthouse.school/', '01618509829', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'Special school', true, date '2026-09-16', true),
  (105448, 'dfe-urn-105448', 'Rack House Primary School', 'Manchester', 'Community school', 'Primary', 2, 11, 'Yarmouth Drive', 'Northern Moor', 'Manchester', 'M23 0BT', 'M230BT', 'www.rackhouseschool.org.uk/', '01619982544', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (138784, 'dfe-urn-138784', 'Rushbrook Primary Academy', 'Manchester', 'Academy sponsor led', 'Primary', 2, 11, 'Shillingford Road', 'Gorton', 'Manchester', 'M18 7TN', 'M187TN', 'https://rpa.bright-futures.co.uk', '01612235955', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (139831, 'dfe-urn-139831', 'Sol Christian Academy', 'Manchester', 'Other independent school', 'Not applicable', 2, 18, '115', 'Fairfield Street', null, 'M12 6EL', 'M126EL', 'www.solacademy.org.uk', '01616372944', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (105507, 'dfe-urn-105507', 'St Andrew''s CofE Primary School', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Broom Avenue', 'Levenshulme', 'Manchester', 'M19 2UH', 'M192UH', 'www.standrewsmanchester.org.uk/', '01614322731', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (105521, 'dfe-urn-105521', 'St Anne''s RC Primary School Crumpsall Manchester', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Moss Bank', 'Crumpsall', 'Manchester', 'M8 5AB', 'M85AB', 'www.stannescrumpsall.co.uk/', '01617405995', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (105523, 'dfe-urn-105523', 'St Brigid''s RC Primary School', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Grey Mare Lane', 'Beswick', 'Manchester', 'M11 3DR', 'M113DR', 'www.st-brigids.manchester.sch.uk/', '01612235538', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (141689, 'dfe-urn-141689', 'St James'' CofE Primary School Gorton', 'Manchester', 'Academy sponsor led', 'Primary', 3, 11, 'Stelling Street', 'Gorton', 'Manchester', 'M18 8LW', 'M188LW', 'www.stjames-gorton.manchester.sch.uk', '01612232423', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (105540, 'dfe-urn-105540', 'St Willibrord''s RC Primary School', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Vale Street', 'Clayton', 'Manchester', 'M11 4WR', 'M114WR', 'www.st-willibrords.manchester.sch.uk', '01612239345', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (139445, 'dfe-urn-139445', 'Webster Primary School', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Denmark Road', 'Greenheys', 'Manchester', 'M15 6JU', 'M156JU', 'www.webster.manchester.sch.uk', '01612263928', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (135296, 'dfe-urn-135296', 'William Hulme''s Grammar School', 'Manchester', 'Academy sponsor led', 'All-through', 3, 18, 'Spring Bridge Road', null, 'Manchester', 'M16 8PR', 'M168PR', 'www.whgs-academy.org', '01612262054', 'Priority 1 - SEN signal', 'Open, serves ages 3-7, and has a SEN/specialist signal in Edubase', 'SEND provision', true, date '2026-09-16', true),
  (139404, 'dfe-urn-139404', 'Abbey Hey Primary Academy', 'Manchester', 'Academy sponsor led', 'Primary', 3, 11, 'Abbey Hey Lane', 'Gorton', 'Manchester', 'M18 8PF', 'M188PF', 'www.abbeyheyprimary.org.uk/', '01612231592', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105387, 'dfe-urn-105387', 'Abbott Community Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Livesey Street', 'Collyhurst', 'Manchester', 'M40 7PR', 'M407PR', 'www.abbott.manchester.sch.uk/', '01618349529', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105401, 'dfe-urn-105401', 'Acacias Community Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Alexandra Drive', 'Burnage', 'Manchester', 'M19 2WW', 'M192WW', 'www.acacias.manchester.sch.uk', '01612241598', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105505, 'dfe-urn-105505', 'All Saints C of E Primary School', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Culcheth Lane', 'Newton Heath', 'Manchester', 'M40 1LS', 'M401LS', 'www.allsaintsnh-pri.manchester.sch.uk', '01616813455', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105480, 'dfe-urn-105480', 'All Saints Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Belle Vue Street', 'Gorton', 'Manchester', 'M12 5PW', 'M125PW', 'www.allsaints-pri.manchester.sch.uk/', '01612239325', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105502, 'dfe-urn-105502', 'Armitage CofE Primary School', 'Manchester', 'Voluntary controlled school', 'Primary', 2, 11, 'Rostron Avenue', 'Ardwick', 'Manchester', 'M12 5NP', 'M125NP', 'www.armitage.manchester.sch.uk/', '01612734654', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105485, 'dfe-urn-105485', 'Baguley Hall Primary School', 'Manchester', 'Foundation school', 'Primary', 3, 11, 'Ackworth Drive', 'Baguley', 'Manchester', 'M23 1LB', 'M231LB', 'www.baguleyhall.manchester.sch.uk/', '01619982090', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (140314, 'dfe-urn-140314', 'Beaver Road Primary School', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Beaver Road', 'Didsbury', 'Manchester', 'M20 6SX', 'M206SX', 'www.beaverroad.org.uk', '01614459337', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (130380, 'dfe-urn-130380', 'Birchfields Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Lytham Road', 'Fallowfield', 'Manchester', 'M14 6PL', 'M146PL', 'www.birchfieldsprimary.com', '01612243892', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (138653, 'dfe-urn-138653', 'Briscoe Lane Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Briscoe Lane', 'Newton Heath', 'Manchester', 'M40 2TB', 'M402TB', 'www.briscoe.manchester.sch.uk', '01616811783', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (144131, 'dfe-urn-144131', 'Brookburn Community School', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Brookburn Road', 'Chorlton-Cum-Hardy', 'Manchester', 'M21 8EH', 'M218EH', 'https://brookburn.manchester.sch.uk/', '01618818880', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (131938, 'dfe-urn-131938', 'Button Lane Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Button Lane', 'Northern Moor', 'Manchester', 'M23 0ND', 'M230ND', 'www.buttonlane.manchester.sch.uk/', '01619451965', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (152024, 'dfe-urn-152024', 'Cavendish Primary School', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Cavendish Road', 'West Didsbury', 'Manchester', 'M20 1JG', 'M201JG', 'www.cavendish.manchester.sch.uk', '01614451815', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105404, 'dfe-urn-105404', 'Chapel Street Community Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Chapel Street', 'Levenshulme', 'Manchester', 'M19 3GH', 'M193GH', 'www.chapelstreetprimary.co.uk', '01612241269', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105405, 'dfe-urn-105405', 'Charlestown Community Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Pilkington Road', 'Blackley', 'Manchester', 'M9 7BX', 'M97BX', 'www.charlestown.manchester.sch.uk', '01617403529', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (137601, 'dfe-urn-137601', 'Cheetham CofE Community Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Halliwell Lane', 'Cheetham Hill', 'Manchester', 'M8 9FR', 'M89FR', 'www.cheetham.manchester.sch.uk/', '01617405996', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105461, 'dfe-urn-105461', 'Cheetwood Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Waterloo Road', 'Cheetham', 'Manchester', 'M8 8EJ', 'M88EJ', 'www.cheetwood.manchester.sch.uk/', '01618342104', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105487, 'dfe-urn-105487', 'Chorlton CofE Primary School', 'Manchester', 'Voluntary controlled school', 'Primary', 3, 11, 'Vicars Road', 'Chorlton-Cum-Hardy', 'Manchester', 'M21 9JA', 'M219JA', 'http://www.chorltonce.co.uk', '01618816798', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (142343, 'dfe-urn-142343', 'Chorlton Park Primary', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Barlow Moor Road', 'Chorlton-Cum-Hardy', 'Manchester', 'M21 7HH', 'M217HH', 'http://www.chorltonpark.manchester.sch.uk', '01618811621', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105514, 'dfe-urn-105514', 'Christ The King RC Primary School Manchester', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Culcheth Lane', 'Newton Heath', 'Manchester', 'M40 1LU', 'M401LU', 'www.christtheking.manchester.sch.uk', '01616812779', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105408, 'dfe-urn-105408', 'Claremont Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Claremont Road', 'Moss Side', 'Manchester', 'M14 7NA', 'M147NA', 'www.claremontprimary.com', '01612262066', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (146227, 'dfe-urn-146227', 'Co-op Academy Broadhurst', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Williams Road', 'Moston', 'Manchester', 'M40 0BX', 'M400BX', 'broadhurst.coopacademies.co.uk', '01616814288', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105547, 'dfe-urn-105547', 'CofE School of the Resurrection', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Pilgrim Drive', 'Beswick', 'Manchester', 'M11 3TJ', 'M113TJ', 'www.resurrection.manchester.sch.uk', '01612233163', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105465, 'dfe-urn-105465', 'Crab Lane Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Crab Lane', 'Higher Blackley', 'Manchester', 'M9 8NB', 'M98NB', 'www.crablane.manchester.sch.uk/', '01617402851', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (140661, 'dfe-urn-140661', 'Cravenwood Primary Academy', 'Manchester', 'Academy sponsor led', 'Primary', 3, 11, 'Cravenwood Road', 'Crumpsall', 'Manchester', 'M8 5AE', 'M85AE', 'www.cravenwoodprimary.org.uk/', '01617953380', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (140709, 'dfe-urn-140709', 'Crossacres Primary Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Crossacres Road', 'Wythenshawe', 'Manchester', 'M22 5AD', 'M225AD', 'www.crossacresprimary.co.uk/', '01614371272', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (149867, 'dfe-urn-149867', 'Crosslee Community Primary School', 'Manchester', 'Academy sponsor led', 'Primary', 3, 11, 'Crosslee Road', 'Blackley', 'Manchester', 'M9 6TG', 'M96TG', 'www.crosslee.manchester.sch.uk', '01617958493', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105413, 'dfe-urn-105413', 'Crowcroft Park Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Stovell Avenue', null, 'Manchester', 'M12 5SY', 'M125SY', 'www.crowcroftpark.net', '01612245914', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (150774, 'dfe-urn-150774', 'Crown Street Primary School', 'Manchester', 'Free schools', 'Primary', 3, 11, '19 Silvercroft Street', null, 'Manchester', 'M15 4ZB', 'M154ZB', 'https://www.crownstreetprimary.org.uk/', '01615497150', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105486, 'dfe-urn-105486', 'Crumpsall Lane Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Crumpsall Lane', 'Crumpsall', 'Manchester', 'M8 5SR', 'M85SR', 'www.crumpsalllaneprimary.org/', '01617403741', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (142265, 'dfe-urn-142265', 'Didsbury CofE Primary School', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Elm Grove', 'Didsbury', 'Manchester', 'M20 6RL', 'M206RL', 'www.thrive-dce.com', '01614457144', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (137689, 'dfe-urn-137689', 'E-ACT Blackley Academy', 'Manchester', 'Academy sponsor led', 'Primary', 3, 11, 'Victoria Avenue', 'Blackley', 'Manchester', 'M9 0RD', 'M90RD', 'https://blackleyacademy.e-act.org.uk', '01617402185', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (140130, 'dfe-urn-140130', 'Green End Primary School', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Burnage Lane', 'Burnage', 'Manchester', 'M19 1DR', 'M191DR', 'www.greenend.manchester.sch.uk', '01614327036', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (139263, 'dfe-urn-139263', 'Haveley Hey Community School', 'Manchester', 'Academy sponsor led', 'Primary', 3, 11, 'Nearbrook Road', 'Benchill', 'Manchester', 'M22 9NS', 'M229NS', 'www.haveleyhey.manchester.sch.uk/', '01614989508', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105422, 'dfe-urn-105422', 'Heald Place Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Heald Place', 'Rusholme', 'Manchester', 'M14 7PN', 'M147PN', 'www.healdplace.co.uk', '01612247079', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105516, 'dfe-urn-105516', 'Holy Name Roman Catholic Primary School Manchester', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Denmark Road', 'Moss Side', 'Manchester', 'M15 6JS', 'M156JS', 'www.holyname.manchester.sch.uk', '01612266303', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105488, 'dfe-urn-105488', 'Holy Trinity CofE Primary School', 'Manchester', 'Voluntary controlled school', 'Primary', 3, 11, 'Capstan Street', 'Blackley', 'Manchester', 'M9 4DU', 'M94DU', 'https://www.holytrinity-manchester.co.uk', '01612051216', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105452, 'dfe-urn-105452', 'Irk Valley Community School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Waterloo Street', 'Lower Crumpsall', 'Manchester', 'M8 5XH', 'M85XH', 'www.irkvalley.manchester.sch.uk', '01614138707', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (139497, 'dfe-urn-139497', 'King David Primary School', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Wilton Polygon', null, 'Crumpsall', 'M8 5DJ', 'M85DJ', 'www.kingdavidprimary.manchester.sch.uk/', '01617415090', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (140137, 'dfe-urn-140137', 'Ladybarn Primary School', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Briarfield Road', 'Withington', 'Manchester', 'M20 4SR', 'M204SR', 'www.ladybarn.manchester.sch.uk/', '01614454898', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (149671, 'dfe-urn-149671', 'Lily Lane Primary School', 'Manchester', 'Academy sponsor led', 'Primary', 3, 11, '74 Kenyon Lane', 'Moston', 'Manchester', 'M40 9JP', 'M409JP', 'www.lilylane.manchester.sch.uk', '01612053397', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105592, 'dfe-urn-105592', 'Manchester High School for Girls', 'Manchester', 'Other independent school', 'Not applicable', 3, 18, 'Grangethorpe Road', null, 'Manchester', 'M14 6HS', 'M146HS', 'http://www.manchesterhigh.co.uk', '01612240447', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105598, 'dfe-urn-105598', 'Manchester Muslim Preparatory School', 'Manchester', 'Other independent school', 'Not applicable', 3, 11, '141 Barlow Moor Road', null, 'Manchester', 'M20 2PQ', 'M202PQ', 'https://www.mmps.miet.uk/', '01614455452', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105472, 'dfe-urn-105472', 'Manley Park Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'College Road', 'Whalley Range', 'Manchester', 'M16 0AA', 'M160AA', 'www.manleypark.com/', '01618813808', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105426, 'dfe-urn-105426', 'Mauldeth Road Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Mauldeth Road', 'Withington', 'Manchester', 'M14 6SG', 'M146SG', 'mauldethprimary.co.uk', '01612243588', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105585, 'dfe-urn-105585', 'Moor Allerton Preparatory School', 'Manchester', 'Other independent school', 'Not applicable', 2, 11, '131 Barlow Moor Road', 'West Didsbury', 'Manchester', 'M20 2PW', 'M202PW', 'www.moorallertonschool.co.uk', '01614454521', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105427, 'dfe-urn-105427', 'Moston Fields Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Brookside Road', 'Moston', 'Manchester', 'M40 9GJ', 'M409GJ', 'www.mostonfieldsprimaryschool.co.uk', '01616811801', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105428, 'dfe-urn-105428', 'Moston Lane Community Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Moston Lane', 'Moston', 'Manchester', 'M9 4HH', 'M94HH', 'www.mostonlane.manchester.sch.uk', '01612053864', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (148738, 'dfe-urn-148738', 'Mount Carmel RC Primary School, a Voluntary Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Wilson Road', 'Blackley', 'Manchester', 'M9 8BG', 'M98BG', 'www.mountcarmel.manchester.sch.uk/', '01617404696', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105432, 'dfe-urn-105432', 'New Moston Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Moston Lane East', 'New Moston', 'Manchester', 'M40 3QJ', 'M403QJ', 'www.newmoston.manchester.sch.uk', '01616813321', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (152025, 'dfe-urn-152025', 'Northenden Community School', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Bazley Road', 'Northenden', 'Manchester', 'M22 4FL', 'M224FL', 'www.northendenprimary.co.uk', '01619984825', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (140052, 'dfe-urn-140052', 'Oasis Academy Aspinal', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Broadacre Road', 'Gorton', 'Manchester', 'M18 7NY', 'M187NY', 'www.oasisacademyaspinal.org', '01612230053', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (139056, 'dfe-urn-139056', 'Oasis Academy Harpur Mount', 'Manchester', 'Academy sponsor led', 'Primary', 3, 11, 'Alfred Street', 'Harpurhey', 'Manchester', 'M9 5XR', 'M95XR', 'www.oasisacademyharpurmount.org/', '01612054993', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (145622, 'dfe-urn-145622', 'Oasis Academy Temple', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Smedley Lane', 'Cheetham', 'Manchester', 'M8 8SA', 'M88SA', 'www.oasistemple.org', '01612051932', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (142501, 'dfe-urn-142501', 'Old Hall Drive Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Old Hall Drive', 'Gorton', 'Manchester', 'M18 7FU', 'M187FU', 'www.oldhalldrive.co.uk', '01612232805', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (131030, 'dfe-urn-131030', 'Oswald Road Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Oswald Road', 'Chorlton-Cum-Hardy', 'Manchester', 'M21 9PL', 'M219PL', 'www.oswaldroad.co.uk/', '01618814266', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105543, 'dfe-urn-105543', 'Our Lady''s RC Primary School Manchester', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Whalley Road', 'Whalley Range', 'Manchester', 'M16 8AW', 'M168AW', 'www.ourladys-pri.manchester.sch.uk/', '01612262767', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (150600, 'dfe-urn-150600', 'Park View Community Primary Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Varley Street', 'Miles Platting', 'Manchester', 'M40 7EJ', 'M407EJ', 'www.parkview.manchester.sch.uk', '01615198562', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (150693, 'dfe-urn-150693', 'Peel Hall Primary Academy', 'Manchester', 'Academy sponsor led', 'Primary', 3, 11, 'Ashurst Road', 'Wythenshawe', 'Manchester', 'M22 5AU', 'M225AU', null, '01614372494', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105443, 'dfe-urn-105443', 'Plymouth Grove Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Plymouth Grove West', 'Chorlton-on-Medlock', 'Ardwick', 'M13 0AQ', 'M130AQ', 'www.plymouthgrove.net/', '01612731453', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (131931, 'dfe-urn-131931', 'Ringway Primary School', 'Manchester', 'Community school', 'Primary', 2, 11, 'Rossett Avenue', 'Cornishway', 'Manchester', 'M22 0WW', 'M220WW', 'www.ringway.manchester.sch.uk', '01614371899', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (144913, 'dfe-urn-144913', 'Rolls Crescent Primary School', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Rolls Crescent', 'Hulme', 'Manchester', 'M15 5FT', 'M155FT', 'www.rolls-crescent.manchester.sch.uk/', '01612099930', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105536, 'dfe-urn-105536', 'Sacred Heart Catholic Primary School', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Floatshall Road', 'Baguley', 'Manchester', 'M23 1HP', 'M231HP', 'www.sacredheart-baguley.manchester.sch.uk', '01619983419', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (134479, 'dfe-urn-134479', 'Sacred Heart RC Primary School', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Knutsford Road', 'Gorton', 'Manchester', 'M18 7NJ', 'M187NJ', 'https://www.sacredheartschool-gorton.org.uk/', '01612230231', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105469, 'dfe-urn-105469', 'Sandilands Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Wendover Road', 'Wythenshawe', 'Manchester', 'M23 9JX', 'M239JX', 'www.sandilands.manchester.sch.uk/', '01619736887', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105548, 'dfe-urn-105548', 'Saviour CofE Primary School', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Eggington Street', 'Collyhurst', 'Manchester', 'M40 7RH', 'M407RH', 'https://www.saviour.manchester.sch.uk/', '01612051221', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (139078, 'dfe-urn-139078', 'Seymour Road Academy', 'Manchester', 'Academy sponsor led', 'Primary', 3, 11, 'Seymour Road South', null, 'Manchester', 'M11 4PR', 'M114PR', 'www.seymourroad.manchester.sch.uk/', '01613702616', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (139467, 'dfe-urn-139467', 'Ss John Fisher and Thomas More Catholic Primary School', 'Manchester', 'Academy converter', 'Primary', 2, 11, 'Woodhouse Lane', 'Benchill', 'Manchester', 'M22 9NW', 'M229NW', 'www.fishermoreprimary.net', '01619983422', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105500, 'dfe-urn-105500', 'St Agnes C of E Primary School', 'Manchester', 'Voluntary controlled school', 'Primary', 3, 11, '50 Hamilton Road', null, 'Manchester', 'M13 0PE', 'M130PE', 'www.st-agnes.manchester.sch.uk', '01612246829', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105520, 'dfe-urn-105520', 'St Ambrose RC Primary School', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Princess Road', 'Chorlton-Cum-Hardy', 'Manchester', 'M21 7QA', 'M217QA', 'https://www.st-ambrose.manchester.sch.uk/', '01614453299', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (131884, 'dfe-urn-131884', 'St Anne''s RC Primary School', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Carruthers Street', 'Ancoats', 'Manchester', 'M4 7EQ', 'M47EQ', 'www.st-annes-pri.manchester.sch.uk/', '01612732417', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (139458, 'dfe-urn-139458', 'St Anthony''s Catholic Primary School', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Dunkery Road', 'Woodhouse Park', 'Manchester', 'M22 0NT', 'M220NT', 'http://www.stanthonysrcprimaryschool.co.uk', '01614373029', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105490, 'dfe-urn-105490', 'St Augustine''s CofE Primary School', 'Manchester', 'Voluntary controlled school', 'Primary', 3, 11, 'St Augustine Street', 'Monsall', 'Manchester', 'M40 8PL', 'M408PL', 'www.st-augustines.manchester.sch.uk', '01612052812', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (137866, 'dfe-urn-137866', 'St Barnabas CofE Primary Academy', 'Manchester', 'Academy sponsor led', 'Primary', 3, 11, 'Parkhouse Street', 'Openshaw', 'Manchester', 'M11 2JX', 'M112JX', 'www.stbarnabas.manchester.sch.uk', '01612233593', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105594, 'dfe-urn-105594', 'St Bede''s College', 'Manchester', 'Other independent school', 'Not applicable', 3, 19, 'Alexandra Road South', 'Whalley Range', null, 'M16 8HX', 'M168HX', 'www.sbcm.co.uk', '01612263323', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105541, 'dfe-urn-105541', 'St Bernard''s RC Primary School Manchester', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Burnage Lane', null, 'Manchester', 'M19 1DR', 'M191DR', 'www.st-bernards.manchester.sch.uk/', '01614327635', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105524, 'dfe-urn-105524', 'St Catherine''s RC Primary School', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'School Lane', 'Didsbury', 'Manchester', 'M20 6HS', 'M206HS', 'www.st-catherines.manchester.sch.uk', '01614456359', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (148326, 'dfe-urn-148326', 'St Chad''s Roman Catholic Primary School, a Voluntary Academy', 'Manchester', 'Academy sponsor led', 'Primary', 3, 11, 'Balmfield Street', 'Cheetham', 'Manchester', 'M8 0SP', 'M80SP', 'https://stchadsrcps.co.uk/', '01612056965', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105491, 'dfe-urn-105491', 'St Chrysostom''s CofE Primary School', 'Manchester', 'Voluntary controlled school', 'Primary', 3, 11, 'Lincoln Grove', 'Chorlton-on-Medlock', 'Manchester', 'M13 0DX', 'M130DX', 'www.sjcfederation.co.uk', '01612733621', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105554, 'dfe-urn-105554', 'St Clare''s RC Primary School', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Victoria Avenue', 'Blackley', 'Manchester', 'M9 0RR', 'M90RR', 'www.st-clares.manchester.sch.uk/', '01617404993', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105501, 'dfe-urn-105501', 'St Clement''s CofE Primary School', 'Manchester', 'Voluntary controlled school', 'Primary', 3, 11, 'Abbey Hey Lane', 'Higher Openshaw', 'Manchester', 'M11 1LR', 'M111LR', 'www.stclementsprimary.co.uk', '01613013268', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (152600, 'dfe-urn-152600', 'St Cuthbert''s RC Primary School and Nursery, A Voluntary Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Heyscroft Road', 'Withington', 'Manchester', 'M20 4UZ', 'M204UZ', 'www.st-cuthberts.manchester.sch.uk', '01614456079', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (151454, 'dfe-urn-151454', 'St Dunstan''s RC Primary School, a Voluntary Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Bacup Street', 'Moston', 'Manchester', 'M40 9HF', 'M409HF', 'www.stdunstansmoston.com', '01616815665', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (151605, 'dfe-urn-151605', 'St Edmund''s RC Primary School, a Voluntary Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Upper Monsall Street', 'Miles Platting', 'Manchester', 'M40 8NG', 'M408NG', 'http://www.stedmundsrcprimaryschool.co.uk', '01612051700', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (140758, 'dfe-urn-140758', 'St Elizabeth''s Catholic Primary School', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Calve Croft Road', 'Peel Hall', 'Manchester', 'M22 5EU', 'M225EU', 'www.st-elizabeths.manchester.sch.uk/', '01614373890', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (150650, 'dfe-urn-150650', 'St Francis RC Primary School, A Voluntary Academy', 'Manchester', 'Academy sponsor led', 'Primary', 3, 11, 'Ellenbrook Close', 'Gorton', 'Manchester', 'M12 5LZ', 'M125LZ', 'https://www.stfrancismanchester.com/', '01612233457', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105508, 'dfe-urn-105508', 'St James'' CofE Primary School, Birch-in-Rusholme', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Cromwell Range', 'Birch-in-Rusholme', 'Manchester', 'M14 6HW', 'M146HW', 'www.stjamesmanchester.co.uk/', '01612246173', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (152014, 'dfe-urn-152014', 'St John Bosco RC Primary School, a Voluntary Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Hall Moss Road', 'Blackley', 'Manchester', 'M9 7AT', 'M97AT', 'http://www.st-johnbosco.manchester.sch.uk/', '01617407094', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105504, 'dfe-urn-105504', 'St John''s CofE Primary School', 'Manchester', 'Voluntary controlled school', 'Primary', 3, 11, 'Clarence Road', 'Longsight', 'Manchester', 'M13 0YE', 'M130YE', 'www.sjcfederation.co.uk', '01612247752', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (152539, 'dfe-urn-152539', 'St John''s RC Primary School, a Voluntary Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Chepstow Road', 'Chorlton-Cum-Hardy', 'Manchester', 'M21 9SN', 'M219SN', 'www.stjohnsrc.net', '01618811040', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105550, 'dfe-urn-105550', 'St Joseph''s RC Primary School Manchester', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Richmond Grove', 'Longsight', 'Manchester', 'M13 0BT', 'M130BT', 'www.st-josephs.manchester.sch.uk/', '01612245347', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (149453, 'dfe-urn-149453', 'St Kentigern''s RC Primary School, a Voluntary Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Bethnall Drive', 'Fallowfield', 'Manchester', 'M14 7ED', 'M147ED', 'www.st-kentigerns.manchester.sch.uk/', '01612246842', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105503, 'dfe-urn-105503', 'St Luke''s CofE Primary School', 'Manchester', 'Voluntary controlled school', 'Primary', 3, 11, 'Langport Avenue', 'Longsight', 'Manchester', 'M12 4NG', 'M124NG', 'www.st-lukes.manchester.sch.uk', '01612733648', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (152015, 'dfe-urn-152015', 'St Malachy''s RC Primary School, a Voluntary Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Eggington Street', 'Collyhurst', 'Manchester', 'M40 7RG', 'M407RG', 'www.st-malachys.manchester.sch.uk/', '01612053496', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (151359, 'dfe-urn-151359', 'St Margaret Mary''s RC Primary School, a Voluntary Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'St Margaret''s Road', 'New Moston', 'Manchester', 'M40 0JE', 'M400JE', 'www.st-margaretmarys.manchester.sch.uk/', '01616811504', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105493, 'dfe-urn-105493', 'St Margaret''s CofE Primary School', 'Manchester', 'Voluntary controlled school', 'Primary', 3, 11, 'Withington Road', 'Whalley Range', 'Manchester', 'M16 8FQ', 'M168FQ', 'http://www.stmargaretsmanchester.co.uk', '01612262271', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105495, 'dfe-urn-105495', 'St Mary''s CofE Junior and Infant School', 'Manchester', 'Voluntary controlled school', 'Primary', 3, 11, 'Adscombe Street', 'Off Alexandra Road', 'Manchester', 'M16 7AQ', 'M167AQ', 'www.st-marys-mossside.manchester.sch.uk/', '01612261773', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105545, 'dfe-urn-105545', 'St Mary''s CofE Primary School Moston', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'St. Mary''s Road', 'Moston', 'Manchester', 'M40 0DF', 'M400DF', 'http://www.st-maryscofe.manchester.sch.uk/', '01616810407', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (152599, 'dfe-urn-152599', 'St Mary''s RC Primary School, Manchester, A Voluntary Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Clare Road', 'Levenshulme', 'Manchester', 'M19 2QW', 'M192QW', 'www.stmaryslevenshulme.org.uk', '01612245995', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (151606, 'dfe-urn-151606', 'St Patrick''s RC Primary School, a Voluntary Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Livesey Street', 'Collyhurst', 'Manchester', 'M4 5HF', 'M45HF', 'www.st-patricks.manchester.sch.uk/', '01618349004', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105498, 'dfe-urn-105498', 'St Paul''s CofE Primary School', 'Manchester', 'Voluntary controlled school', 'Primary', 3, 11, 'St Paul''s Road', 'Withington', 'Manchester', 'M20 4PG', 'M204PG', 'www.stpaulswithington.co.uk', '01613595316', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105537, 'dfe-urn-105537', 'St Peter''s Catholic Primary School', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Firbank Road', 'Newall Green', 'Manchester', 'M23 2YS', 'M232YS', 'https://www.stpeters-primary.co.uk', '01614371495', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105544, 'dfe-urn-105544', 'St Richard''s RC Primary School', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Wilpshire Avenue', 'Longsight', 'Manchester', 'M12 5TL', 'M125TL', 'www.st-richards.manchester.sch.uk/', '01612245552', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (142936, 'dfe-urn-142936', 'St Wilfrid''s CofE Aided Primary School Northenden', 'Manchester', 'Academy sponsor led', 'Primary', 3, 11, 'Patterdale Road', 'Northenden', 'Manchester', 'M22 4NR', 'M224NR', 'www.thrive-stw.com', '01619983663', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105496, 'dfe-urn-105496', 'St Wilfrid''s CofE Junior and Infant School', 'Manchester', 'Voluntary controlled school', 'Primary', 3, 11, 'Mabel Street', 'Newton Heath', 'Manchester', 'M40 1GB', 'M401GB', 'www.stwilfridsceprimary.co.uk', '01616811385', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105539, 'dfe-urn-105539', 'St Wilfrid''s RC Primary School', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, 'Birchvale Close', null, 'Hulme', 'M15 5BJ', 'M155BJ', 'www.stwilfs.com', '01612263339', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (151028, 'dfe-urn-151028', 'St. Aidan''s Catholic Primary School, a Voluntary Academy', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Rackhouse Road', 'Northern Moor', 'Manchester', 'M23 0BW', 'M230BW', 'www.st-aidans.co.uk/', '01619984126', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (138785, 'dfe-urn-138785', 'Stanley Grove Primary Academy', 'Manchester', 'Academy sponsor led', 'Primary', 3, 11, 'Stanley Grove', null, 'Longsight', 'M12 4NL', 'M124NL', 'www.stanleygrove.manchester.sch.uk/', '01612249495', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (135648, 'dfe-urn-135648', 'The Divine Mercy Roman Catholic Primary School', 'Manchester', 'Voluntary aided school', 'Primary', 3, 11, '20 Blue Moon Way', 'Rusholme', 'Manchester', 'M14 7SH', 'M147SH', 'www.thedivinemercy.manchester.sch.uk/', '01616728660', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (139438, 'dfe-urn-139438', 'The Willows Primary School', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Tayfield Road', 'Woodhouse Park', 'Manchester', 'M22 1BQ', 'M221BQ', 'www.willows.manchester.sch.uk/', '01614374444', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (141966, 'dfe-urn-141966', 'Unity Community Primary', 'Manchester', 'Free schools', 'Primary', 2, 11, 'Allesley Drive', 'Cheetham Hill', 'Manchester', 'M7 4YE', 'M74YE', 'www.unitycommunityprimary.com', '01618712614', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (105459, 'dfe-urn-105459', 'Varna Community Primary School', 'Manchester', 'Community school', 'Primary', 3, 11, 'Chisholm Street', 'Openshaw', 'Manchester', 'M11 2LE', 'M112LE', 'www.varna.manchester.sch.uk', '01617111023', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true),
  (145439, 'dfe-urn-145439', 'Wilbraham Primary School', 'Manchester', 'Academy converter', 'Primary', 3, 11, 'Platt Lane', 'Fallowfield', 'Manchester', 'M14 7FB', 'M147FB', 'www.wilbrahamprimary.com/', '01612243900', 'Priority 2 - core 3-7', 'Open Manchester setting whose statutory age range includes ages 3-7', 'Mainstream primary', false, date '2026-09-16', true)
on conflict (dfe_urn) do update
set school_key = excluded.school_key,
    school_name = excluded.school_name,
    la_name = excluded.la_name,
    establishment_type = excluded.establishment_type,
    phase = excluded.phase,
    statutory_low_age = excluded.statutory_low_age,
    statutory_high_age = excluded.statutory_high_age,
    address_line_1 = excluded.address_line_1,
    locality = excluded.locality,
    town = excluded.town,
    postcode = excluded.postcode,
    postcode_lookup = excluded.postcode_lookup,
    website = excluded.website,
    telephone = excluded.telephone,
    priority_tier = excluded.priority_tier,
    priority_reason = excluded.priority_reason,
    setting_type = excluded.setting_type,
    send_priority = excluded.send_priority,
    source_snapshot = excluded.source_snapshot,
    eligible_for_manc50 = excluded.eligible_for_manc50,
    updated_at = now();

alter table public.manc50_checkout_reservations
  add column if not exists dfe_urn integer,
  add column if not exists delivery_address_line_1 text,
  add column if not exists delivery_locality text,
  add column if not exists delivery_town text,
  add column if not exists delivery_postcode text;

alter table public.manc50_schools
  add column if not exists dfe_urn integer,
  add column if not exists delivery_address_line_1 text,
  add column if not exists delivery_locality text,
  add column if not exists delivery_town text,
  add column if not exists delivery_postcode text;

do $constraints$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'manc50_checkout_reservations_dfe_urn_fkey'
      and conrelid = 'public.manc50_checkout_reservations'::regclass
  ) then
    alter table public.manc50_checkout_reservations
      add constraint manc50_checkout_reservations_dfe_urn_fkey
      foreign key (dfe_urn) references public.manc50_eligible_schools(dfe_urn);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'manc50_schools_dfe_urn_fkey'
      and conrelid = 'public.manc50_schools'::regclass
  ) then
    alter table public.manc50_schools
      add constraint manc50_schools_dfe_urn_fkey
      foreign key (dfe_urn) references public.manc50_eligible_schools(dfe_urn);
  end if;
end;
$constraints$;

create unique index if not exists manc50_one_open_reservation_per_dfe_urn
  on public.manc50_checkout_reservations (dfe_urn)
  where status = 'reserved' and dfe_urn is not null;

create unique index if not exists manc50_schools_one_per_dfe_urn
  on public.manc50_schools (dfe_urn)
  where dfe_urn is not null;

-- A paid order and its physical pack have independent, auditable lifecycles.
create table if not exists public.manc50_orders (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null unique references public.manc50_checkout_reservations(id),
  school_id uuid not null references public.manc50_schools(id),
  entitlement_id uuid not null unique references public.manc50_entitlements(id),
  purchased_by_user_id uuid references auth.users(id) on delete set null,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text unique,
  amount_total integer not null check (amount_total = 500),
  currency text not null check (currency = 'gbp'),
  status text not null default 'paid'
    check (status in ('paid', 'refunded', 'disputed', 'cancelled')),
  paid_at timestamptz not null default now(),
  refunded_at timestamptz,
  refund_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manc50_fulfilments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.manc50_orders(id),
  school_id uuid not null references public.manc50_schools(id),
  entitlement_id uuid not null unique references public.manc50_entitlements(id),
  status text not null default 'pending'
    check (status in (
      'pending',
      'preparing',
      'dispatched',
      'delivered',
      'issue',
      'replacement_pending',
      'replaced',
      'cancelled',
      'refunded'
    )),
  recipient_name text not null default 'School office',
  address_line_1 text not null,
  locality text,
  town text,
  postcode text not null,
  address_source text not null default 'Edubase 2026-09-16',
  pack_quantity integer not null default 1 check (pack_quantity = 1),
  pack_contents jsonb not null default
    '{"book":"Cobie Starter Pack","teacher_access_months":3}'::jsonb,
  dispatch_due_at timestamptz not null default (now() + interval '7 days'),
  prepared_at timestamptz,
  dispatched_at timestamptz,
  delivered_at timestamptz,
  carrier text,
  tracking_reference text,
  issue_type text,
  issue_notes text,
  replacement_of_id uuid references public.manc50_fulfilments(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.manc50_orders enable row level security;
alter table public.manc50_fulfilments enable row level security;
revoke all on table public.manc50_orders from public, anon, authenticated;
revoke all on table public.manc50_fulfilments from public, anon, authenticated;
grant all on table public.manc50_orders to service_role;
grant all on table public.manc50_fulfilments to service_role;

drop function if exists public.reserve_manc50_checkout(uuid, text, text, text, text);
drop function if exists public.reserve_manc50_checkout(uuid, text, text, text, text, text, text, boolean);

create function public.reserve_manc50_checkout(
  p_user_id uuid,
  p_checkout_attempt_id text,
  p_dfe_urn integer,
  p_contact_email text
)
returns public.manc50_checkout_reservations
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_reservation public.manc50_checkout_reservations;
  v_source public.manc50_eligible_schools%rowtype;
begin
  if p_user_id is null then
    raise exception 'A confirmed teacher account is required';
  end if;
  if p_checkout_attempt_id is null or btrim(p_checkout_attempt_id) = '' then
    raise exception 'checkout_attempt_id is required';
  end if;
  if p_dfe_urn is null then
    raise exception 'An eligible school DfE URN is required';
  end if;
  if p_contact_email is null or btrim(p_contact_email) = '' then
    raise exception 'contact_email is required';
  end if;

  select * into v_source
  from public.manc50_eligible_schools
  where dfe_urn = p_dfe_urn
    and eligible_for_manc50 is true;

  if v_source.dfe_urn is null then
    raise exception 'School is not eligible for MANC50';
  end if;

  perform pg_advisory_xact_lock(hashtext('manc50-entitlement-cap'));

  update public.manc50_checkout_reservations
  set status = 'expired', updated_at = now()
  where status = 'reserved' and reserved_until <= now();

  select * into v_reservation
  from public.manc50_checkout_reservations
  where checkout_attempt_id = p_checkout_attempt_id;

  if v_reservation.id is not null then
    if v_reservation.user_id <> p_user_id then
      raise exception 'Checkout attempt belongs to another account';
    end if;
    if v_reservation.dfe_urn is distinct from p_dfe_urn then
      raise exception 'Checkout attempt belongs to another school';
    end if;
    return v_reservation;
  end if;

  if exists (
    select 1 from public.manc50_entitlements
    where purchased_by_user_id = p_user_id or activated_by_user_id = p_user_id
  ) then
    raise exception 'This account already has a MANC50 place';
  end if;

  if exists (
    select 1
    from public.manc50_entitlements entitlement
    join public.manc50_schools school on school.id = entitlement.school_id
    where school.dfe_urn = p_dfe_urn
       or school.school_key = v_source.school_key
  ) then
    raise exception 'This school already has a MANC50 place';
  end if;

  select * into v_reservation
  from public.manc50_checkout_reservations
  where status = 'reserved'
    and (user_id = p_user_id or dfe_urn = p_dfe_urn)
  limit 1;

  if v_reservation.id is not null then
    if v_reservation.user_id = p_user_id
      and v_reservation.dfe_urn = p_dfe_urn
      and lower(v_reservation.contact_email) = lower(btrim(p_contact_email)) then
      return v_reservation;
    end if;
    raise exception 'A checkout is already in progress for this account or school';
  end if;

  if (
    (select count(*) from public.manc50_entitlements where cohort = 'MANC50')
    +
    (select count(*) from public.manc50_checkout_reservations
      where status = 'reserved' and reserved_until > now())
  ) >= 50 then
    raise exception 'MANC50 pilot cap reached';
  end if;

  insert into public.manc50_checkout_reservations (
    checkout_attempt_id,
    user_id,
    school_key,
    school_name,
    contact_email,
    dfe_urn,
    postcode,
    setting_type,
    serves_ages_3_7,
    send_priority,
    delivery_address_line_1,
    delivery_locality,
    delivery_town,
    delivery_postcode
  ) values (
    btrim(p_checkout_attempt_id),
    p_user_id,
    v_source.school_key,
    v_source.school_name,
    lower(btrim(p_contact_email)),
    v_source.dfe_urn,
    v_source.postcode,
    v_source.setting_type,
    true,
    v_source.send_priority,
    v_source.address_line_1,
    v_source.locality,
    v_source.town,
    v_source.postcode
  )
  returning * into v_reservation;

  return v_reservation;
end;
$function$;

revoke all on function public.reserve_manc50_checkout(uuid, text, integer, text)
  from public, anon, authenticated;
grant execute on function public.reserve_manc50_checkout(uuid, text, integer, text)
  to service_role;

create or replace function public.sync_manc50_school_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
begin
  if new.status = 'converted' and old.status is distinct from new.status then
    update public.manc50_schools
    set dfe_urn = new.dfe_urn,
        postcode = new.postcode,
        setting_type = new.setting_type,
        serves_ages_3_7 = new.serves_ages_3_7,
        send_priority = new.send_priority,
        delivery_address_line_1 = new.delivery_address_line_1,
        delivery_locality = new.delivery_locality,
        delivery_town = new.delivery_town,
        delivery_postcode = new.delivery_postcode,
        updated_at = now()
    where school_key = new.school_key;
  end if;
  return new;
end;
$function$;

drop function if exists public.finalize_manc50_checkout(uuid, text, text, text);

create function public.finalize_manc50_checkout(
  p_reservation_id uuid,
  p_stripe_checkout_session_id text,
  p_stripe_payment_intent_id text,
  p_amount_total integer,
  p_currency text,
  p_idempotency_key text
)
returns public.manc50_entitlements
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_reservation public.manc50_checkout_reservations;
  v_school public.manc50_schools;
  v_entitlement public.manc50_entitlements;
  v_order public.manc50_orders;
  v_fulfilment public.manc50_fulfilments;
begin
  if p_idempotency_key is null or btrim(p_idempotency_key) = '' then
    raise exception 'idempotency_key is required';
  end if;
  if p_amount_total is distinct from 500 or lower(coalesce(p_currency, '')) <> 'gbp' then
    raise exception 'MANC50 payment amount or currency is invalid';
  end if;

  perform pg_advisory_xact_lock(hashtext('manc50-entitlement-cap'));

  if exists (
    select 1 from public.manc50_idempotency_keys
    where idempotency_key = p_idempotency_key
  ) then
    select * into v_entitlement
    from public.manc50_entitlements
    where stripe_checkout_session_id = p_stripe_checkout_session_id
       or stripe_payment_intent_id = p_stripe_payment_intent_id
    limit 1;
    return v_entitlement;
  end if;

  select * into v_entitlement
  from public.manc50_entitlements
  where stripe_checkout_session_id = p_stripe_checkout_session_id
     or (
       p_stripe_payment_intent_id is not null
       and stripe_payment_intent_id = p_stripe_payment_intent_id
     )
  limit 1;

  if v_entitlement.id is not null then
    insert into public.manc50_idempotency_keys (idempotency_key, operation)
    values (p_idempotency_key, 'finalize_manc50_checkout')
    on conflict (idempotency_key) do nothing;
    return v_entitlement;
  end if;

  select * into v_reservation
  from public.manc50_checkout_reservations
  where id = p_reservation_id
  for update;

  if v_reservation.id is null or v_reservation.status <> 'reserved' then
    raise exception 'Checkout reservation is not available';
  end if;
  if v_reservation.stripe_checkout_session_id is distinct from p_stripe_checkout_session_id then
    raise exception 'Checkout session does not match its reservation';
  end if;
  if v_reservation.dfe_urn is null then
    raise exception 'Checkout reservation has no verified DfE URN';
  end if;
  if (select count(*) from public.manc50_entitlements where cohort = 'MANC50') >= 50 then
    raise exception 'MANC50 pilot cap reached';
  end if;

  insert into public.manc50_schools (
    school_key,
    school_name,
    contact_email,
    dfe_urn,
    postcode,
    setting_type,
    serves_ages_3_7,
    send_priority,
    delivery_address_line_1,
    delivery_locality,
    delivery_town,
    delivery_postcode
  ) values (
    v_reservation.school_key,
    v_reservation.school_name,
    v_reservation.contact_email,
    v_reservation.dfe_urn,
    v_reservation.postcode,
    v_reservation.setting_type,
    true,
    v_reservation.send_priority,
    v_reservation.delivery_address_line_1,
    v_reservation.delivery_locality,
    v_reservation.delivery_town,
    v_reservation.delivery_postcode
  )
  on conflict (school_key) do update
    set school_name = excluded.school_name,
        contact_email = excluded.contact_email,
        dfe_urn = excluded.dfe_urn,
        postcode = excluded.postcode,
        setting_type = excluded.setting_type,
        serves_ages_3_7 = excluded.serves_ages_3_7,
        send_priority = excluded.send_priority,
        delivery_address_line_1 = excluded.delivery_address_line_1,
        delivery_locality = excluded.delivery_locality,
        delivery_town = excluded.delivery_town,
        delivery_postcode = excluded.delivery_postcode,
        updated_at = now()
  returning * into v_school;

  insert into public.manc50_entitlements (
    school_id,
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    purchased_by_user_id,
    activation_token_hash
  ) values (
    v_school.id,
    p_stripe_checkout_session_id,
    p_stripe_payment_intent_id,
    v_reservation.user_id,
    null
  )
  returning * into v_entitlement;

  insert into public.manc50_orders (
    reservation_id,
    school_id,
    entitlement_id,
    purchased_by_user_id,
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    amount_total,
    currency,
    status
  ) values (
    v_reservation.id,
    v_school.id,
    v_entitlement.id,
    v_reservation.user_id,
    p_stripe_checkout_session_id,
    p_stripe_payment_intent_id,
    p_amount_total,
    lower(p_currency),
    'paid'
  )
  returning * into v_order;

  insert into public.manc50_fulfilments (
    order_id,
    school_id,
    entitlement_id,
    address_line_1,
    locality,
    town,
    postcode
  ) values (
    v_order.id,
    v_school.id,
    v_entitlement.id,
    v_reservation.delivery_address_line_1,
    v_reservation.delivery_locality,
    v_reservation.delivery_town,
    v_reservation.delivery_postcode
  )
  returning * into v_fulfilment;

  update public.manc50_checkout_reservations
  set status = 'converted', updated_at = now()
  where id = v_reservation.id;

  insert into public.manc50_idempotency_keys (idempotency_key, operation)
  values (p_idempotency_key, 'finalize_manc50_checkout');

  insert into public.manc50_events (
    entitlement_id,
    school_id,
    event_name,
    source,
    idempotency_key,
    metadata
  ) values (
    v_entitlement.id,
    v_school.id,
    'purchased',
    'stripe_webhook',
    p_idempotency_key || ':purchased',
    jsonb_build_object(
      'reservation_id', v_reservation.id,
      'order_id', v_order.id,
      'fulfilment_id', v_fulfilment.id,
      'dfe_urn', v_reservation.dfe_urn
    )
  );

  return v_entitlement;
end;
$function$;

revoke all on function public.finalize_manc50_checkout(uuid, text, text, integer, text, text)
  from public, anon, authenticated;
grant execute on function public.finalize_manc50_checkout(uuid, text, text, integer, text, text)
  to service_role;

create or replace function public.update_manc50_fulfilment(
  p_fulfilment_id uuid,
  p_status text,
  p_carrier text default null,
  p_tracking_reference text default null,
  p_issue_type text default null,
  p_issue_notes text default null
)
returns public.manc50_fulfilments
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_current public.manc50_fulfilments;
  v_updated public.manc50_fulfilments;
begin
  select * into v_current
  from public.manc50_fulfilments
  where id = p_fulfilment_id
  for update;

  if v_current.id is null then
    raise exception 'Fulfilment not found';
  end if;

  if p_status not in (
    'pending',
    'preparing',
    'dispatched',
    'delivered',
    'issue',
    'replacement_pending',
    'replaced',
    'cancelled',
    'refunded'
  ) then
    raise exception 'Invalid fulfilment status';
  end if;

  if p_status <> v_current.status and not (
    (v_current.status = 'pending' and p_status in ('preparing', 'issue', 'cancelled', 'refunded'))
    or (v_current.status = 'preparing' and p_status in ('dispatched', 'issue', 'cancelled', 'refunded'))
    or (v_current.status = 'dispatched' and p_status in ('delivered', 'issue', 'refunded'))
    or (v_current.status = 'delivered' and p_status in ('issue', 'replacement_pending', 'refunded'))
    or (v_current.status = 'issue' and p_status in ('preparing', 'replacement_pending', 'cancelled', 'refunded'))
    or (v_current.status = 'replacement_pending' and p_status in ('replaced', 'issue', 'cancelled', 'refunded'))
    or (v_current.status = 'replaced' and p_status in ('delivered', 'issue', 'refunded'))
  ) then
    raise exception 'Invalid fulfilment transition from % to %', v_current.status, p_status;
  end if;

  if p_status = 'dispatched'
    and (coalesce(btrim(p_carrier), '') = '' or coalesce(btrim(p_tracking_reference), '') = '') then
    raise exception 'Carrier and tracking reference are required for dispatch';
  end if;

  if p_status = 'issue' and coalesce(btrim(p_issue_type), '') = '' then
    raise exception 'Issue type is required';
  end if;

  update public.manc50_fulfilments
  set status = p_status,
      prepared_at = case when p_status = 'preparing' then coalesce(prepared_at, now()) else prepared_at end,
      dispatched_at = case when p_status = 'dispatched' then coalesce(dispatched_at, now()) else dispatched_at end,
      delivered_at = case when p_status = 'delivered' then coalesce(delivered_at, now()) else delivered_at end,
      carrier = coalesce(p_carrier, carrier),
      tracking_reference = coalesce(p_tracking_reference, tracking_reference),
      issue_type = coalesce(p_issue_type, issue_type),
      issue_notes = coalesce(p_issue_notes, issue_notes),
      updated_at = now()
  where id = p_fulfilment_id
  returning * into v_updated;

  return v_updated;
end;
$function$;

revoke all on function public.update_manc50_fulfilment(uuid, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.update_manc50_fulfilment(uuid, text, text, text, text, text)
  to service_role;

create or replace function public.get_manc50_fulfilment_queue()
returns table (
  fulfilment_id uuid,
  order_id uuid,
  school_name text,
  dfe_urn integer,
  contact_email text,
  status text,
  recipient_name text,
  address_line_1 text,
  locality text,
  town text,
  postcode text,
  dispatch_due_at timestamptz,
  is_overdue boolean,
  carrier text,
  tracking_reference text,
  issue_type text,
  issue_notes text,
  paid_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public, pg_temp
as $function$
  select
    fulfilment.id,
    fulfilment.order_id,
    school.school_name,
    school.dfe_urn,
    school.contact_email,
    fulfilment.status,
    fulfilment.recipient_name,
    fulfilment.address_line_1,
    fulfilment.locality,
    fulfilment.town,
    fulfilment.postcode,
    fulfilment.dispatch_due_at,
    fulfilment.status in ('pending', 'preparing')
      and fulfilment.dispatch_due_at < now() as is_overdue,
    fulfilment.carrier,
    fulfilment.tracking_reference,
    fulfilment.issue_type,
    fulfilment.issue_notes,
    orders.paid_at,
    fulfilment.updated_at
  from public.manc50_fulfilments fulfilment
  join public.manc50_orders orders on orders.id = fulfilment.order_id
  join public.manc50_schools school on school.id = fulfilment.school_id
  order by
    case fulfilment.status
      when 'issue' then 0
      when 'replacement_pending' then 1
      when 'pending' then 2
      when 'preparing' then 3
      else 4
    end,
    fulfilment.dispatch_due_at asc,
    orders.paid_at asc;
$function$;

revoke all on function public.get_manc50_fulfilment_queue()
  from public, anon, authenticated;
grant execute on function public.get_manc50_fulfilment_queue()
  to service_role;

commit;
