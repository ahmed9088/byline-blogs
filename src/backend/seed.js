import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Tag from './models/Tag.js';
import Post from './models/Post.js';
import Settings from './models/Settings.js';
import Comment from './models/Comment.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to Supabase for ultra-premium bulk seeding...');
    await connectDB();
    console.log('Database connected.');

    // Clear existing collections in correct order for foreign keys
    console.log('Clearing database collection entries...');
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await Tag.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    await Settings.deleteMany({});

    // 1. Create Authors
    console.log('Creating Author Profiles...');
    const admin = await User.create({
      name: 'Alexander Sterling',
      email: 'admin@byline.com',
      password: 'adminpassword123',
      role: 'Super Admin',
      bio: 'Alexander Sterling is the editor-in-chief of Byline, focusing on publishing systems, media economics, and editorial philosophy.',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      socialLinks: { twitter: 'https://twitter.com/sterling_editor', website: 'https://alexandersterling.com' }
    });

    const authorClara = await User.create({
      name: 'Clara Vance',
      email: 'clara@byline.com',
      password: 'authorpassword123',
      role: 'Author',
      bio: 'Clara Vance is a senior software architect and tech journalist specializing in distributed systems, database scaling, and clean code paradigms.',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      socialLinks: { twitter: 'https://twitter.com/clara_codes', github: 'https://github.com/claravance' }
    });

    const authorJulian = await User.create({
      name: 'Julian Thorne',
      email: 'julian@byline.com',
      password: 'authorpassword123',
      role: 'Author',
      bio: 'Julian Thorne is an essayist and design critic covering modern typography, grid systems, urban architecture, and digital product aesthetics.',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      socialLinks: { twitter: 'https://twitter.com/julian_thorne', website: 'https://julianthorne.org' }
    });

    const authorElena = await User.create({
      name: 'Dr. Elena Rostova',
      email: 'elena@byline.com',
      password: 'authorpassword123',
      role: 'Author',
      bio: 'Dr. Elena Rostova is a neuroscientist and artificial intelligence researcher investigating cognitive neural models, deep tech, and bio-engineering.',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      socialLinks: { twitter: 'https://twitter.com/elena_neuro', website: 'https://elenarostova.ai' }
    });

    const authorMarcus = await User.create({
      name: 'Marcus Chen',
      email: 'marcus@byline.com',
      password: 'authorpassword123',
      role: 'Author',
      bio: 'Marcus Chen is an investigative journalist and fintech macro-analyst focusing on venture capital, global trade, and economic infrastructure.',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      socialLinks: { twitter: 'https://twitter.com/marcus_macro', linkedin: 'https://linkedin.com/in/marcuschen' }
    });

    const authors = [admin, authorClara, authorJulian, authorElena, authorMarcus];

    // 2. Create 15 Comprehensive Categories
    console.log('Creating 15 Comprehensive Niche Categories...');
    const catEng = await Category.create({
      name: 'Systems Engineering',
      slug: 'systems-engineering',
      description: 'Technical reviews on system architecture, database performance, and clean programming abstractions.'
    });
    const catDes = await Category.create({
      name: 'Modern UI/UX Design',
      slug: 'modern-design',
      description: 'Studies in grid systems, typographic hierarchies, micro-animations, and minimalist design aesthetics.'
    });
    const catAI = await Category.create({
      name: 'Artificial Intelligence',
      slug: 'artificial-intelligence',
      description: 'Deep dives into large neural models, autonomous agents, computer vision, and cognitive AI ethics.'
    });
    const catSec = await Category.create({
      name: 'Cybersecurity & Privacy',
      slug: 'cyber-security-privacy',
      description: 'Analysis of zero-trust architecture, cryptographic protocols, security auditing, and digital sovereignty.'
    });
    const catBiz = await Category.create({
      name: 'Business & Wealth',
      slug: 'business-wealth',
      description: 'Macroeconomics, venture capital, fintech innovations, and strategic startup execution playbooks.'
    });
    const catHealth = await Category.create({
      name: 'Health & Neuroscience',
      slug: 'health-neuroscience',
      description: 'Exploring longevity research, brain-computer interfaces, bio-engineering, and cognitive performance.'
    });
    const catSports = await Category.create({
      name: 'Sports Analytics',
      slug: 'sports-analytics',
      description: 'Data science, aerodynamics, mathematical modeling, and telemetry in elite athletics and motorsport.'
    });
    const catEnt = await Category.create({
      name: 'Entertainment & Media',
      slug: 'entertainment-media',
      description: 'Acoustic engineering, streaming codecs, spatial audio, and procedural visual media analysis.'
    });
    const catSocial = await Category.create({
      name: 'Social & Lifestyle',
      slug: 'social-lifestyle',
      description: 'Essays on digital minimalism, urban third places, slow living, and human agency in the feed era.'
    });
    const catNews = await Category.create({
      name: 'News & Geopolitics',
      slug: 'news-geopolitics',
      description: 'In-depth analysis of global trade routes, semiconductor supply chains, and technology policies.'
    });
    const catLit = await Category.create({
      name: 'Literature & Philosophy',
      slug: 'literature-philosophy',
      description: 'Critical essays, modern existential philosophy, narrative structure, and longform storytelling.'
    });
    const catScience = await Category.create({
      name: 'Science & Future Tech',
      slug: 'science-future-tech',
      description: 'Frontier physics, quantum computing breakthroughs, space exploration, and clean energy innovation.'
    });
    const catTravel = await Category.create({
      name: 'Travel & Exploration',
      slug: 'travel-exploration',
      description: 'Expedition logs, architectural destination guides, cultural geography, and remote wilderness journeys.'
    });
    const catFood = await Category.create({
      name: 'Food & Gastronomy',
      slug: 'food-gastronomy',
      description: 'Food chemistry, specialty coffee processing, culinary history, and artisanal fermentation.'
    });
    const catArts = await Category.create({
      name: 'Arts & Culture',
      slug: 'arts-culture',
      description: 'Fine arts reviews, brutalist & modern architectural history, photography composition, and museum curation.'
    });

    const categories = [
      catEng, catDes, catAI, catSec, catBiz, 
      catHealth, catSports, catEnt, catSocial, catNews, 
      catLit, catScience, catTravel, catFood, catArts
    ];

    // 3. Create Tags
    console.log('Creating Tags...');
    const tagNames = [
      'architecture', 'typography', 'ai-models', 'distributed-systems', 
      'cyber-defense', 'macroeconomics', 'neuroscience', 'formula-1', 
      'sound-design', 'minimalism', 'geopolitics', 'philosophy', 
      'quantum', 'expeditions', 'gastronomy', 'fine-art', 'web-performance'
    ];
    const tags = [];
    for (const name of tagNames) {
      const tag = await Tag.create({ name, slug: name });
      tags.push(tag);
    }

    // 4. Create Settings
    console.log('Seeding Default Settings...');
    await Settings.create({
      siteName: 'Bylines.dev',
      siteDescription: 'An independent premium technical and editorial publishing platform.',
      contactEmail: 'contact@bylines.dev',
      socialLinks: {
        twitter: 'https://twitter.com/byline',
        facebook: 'https://facebook.com/byline',
        instagram: 'https://instagram.com/byline',
        linkedin: 'https://linkedin.com/company/byline'
      },
      defaultMetaTitle: 'Byline — Ultra-Premium Editorial Publishing',
      defaultMetaDescription: 'Expert-driven journalism covering technology, artificial intelligence, science, culture, design, and world affairs.'
    });

    // 5. Create 45 Rich Articles (3 per category across all 15 categories)
    console.log('Generating 45 rich publications across 15 categories...');
    const articles = [
      // 1. Systems Engineering
      {
        title: "The Typographic Grid: Engineering Readable White Space",
        category: catEng,
        image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
        summary: "An editorial investigation into layout geometry, core systems constraints, and practical typography rules."
      },
      {
        title: "Clean Code Abstractions: Guarding Against Architectural Rot",
        category: catEng,
        image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80",
        summary: "A deep dive into software interfaces, dependency injection, and clean programming paradigms in enterprise environments."
      },
      {
        title: "Demystifying Monoliths: A Case for Single-Service Systems",
        category: catEng,
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
        summary: "Why microservices might be premature optimization, and how modular monoliths offer speed and simplicity."
      },

      // 2. Modern UI/UX Design
      {
        title: "The Influence of Swiss Design on Modern UI Frameworks",
        category: catDes,
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
        summary: "Tracing typographic principles, grid structures, and minimalism of the International Typographic Style in web layouts."
      },
      {
        title: "HSL Color Theory: Achieving Harmony in Digital Design Systems",
        category: catDes,
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
        summary: "How hue, saturation, and lightness enable programmatic color generation and dark mode accessibility."
      },
      {
        title: "Proportional Type Scales in Digital Publishing",
        category: catDes,
        image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80",
        summary: "Establishing consistent typographic hierarchy and readability using mathematical ratios like the Golden Section."
      },

      // 3. Artificial Intelligence
      {
        title: "Reasoning Models & Autonomous Agents: The Next AI Frontier",
        category: catAI,
        image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
        summary: "Exploring multi-step chain-of-thought verification, tool integration, and autonomous planning frameworks."
      },
      {
        title: "Neural Memory Architectures: Moving Beyond Context Windows",
        category: catAI,
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
        summary: "How long-term vector indexing and episodic neural retrieval mimic human memory consolidation."
      },
      {
        title: "Ethics of Synthetic Media: Safeguarding Authenticity in AI Generation",
        category: catAI,
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        summary: "Watermarking standards, deepfake detection algorithms, and verification pipelines for media integrity."
      },

      // 4. Cybersecurity & Privacy
      {
        title: "Zero-Trust Architecture: Dismantling the Perimeter Myth",
        category: catSec,
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
        summary: "Continuous identity verification, micro-segmentation, and key rotation in cloud enterprise security."
      },
      {
        title: "Post-Quantum Cryptography: Preparing Encryption for Q-Day",
        category: catSec,
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
        summary: "Lattice-based encryption algorithms designed to withstand future quantum factoring attacks."
      },
      {
        title: "Digital Sovereignty: Protecting Personal Data in Cloud Infrastructures",
        category: catSec,
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
        summary: "End-to-end encryption, self-hosted identity anchors, and data privacy regulations."
      },

      // 5. Business & Wealth
      {
        title: "Venture Capital Dynamics in High-Interest Environments",
        category: catBiz,
        image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
        summary: "Shift from growth-at-all-costs to unit economics, capital efficiency, and sustainable revenue."
      },
      {
        title: "The Decentralized Ledger Shift in Cross-Border Payments",
        category: catBiz,
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
        summary: "Real-time gross settlement networks, stablecoin liquidity, and modern banking rails."
      },
      {
        title: "Building High-Margin SaaS: Lessons from Capital-Efficient Founders",
        category: catBiz,
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        summary: "Product-led growth loops, automated customer onboarding, and retention metrics."
      },

      // 6. Health & Neuroscience
      {
        title: "Brain-Computer Interfaces: Decoding Neural Signals into Text",
        category: catHealth,
        image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80",
        summary: "Non-invasive neural recording, signal processing, and motor cortex decoding techniques."
      },
      {
        title: "Cellular Longevity: The Science of NAD+ and Mitochondrial Repair",
        category: catHealth,
        image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
        summary: "Molecular mechanisms of senescence, caloric restriction mimetics, and cellular rejuvenation."
      },
      {
        title: "Circadian Optimization for Cognitive Endurance in Knowledge Workers",
        category: catHealth,
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
        summary: "Light exposure timing, sleep architecture, and cortisol regulation for mental clarity."
      },

      // 7. Sports Analytics
      {
        title: "F1 Aerodynamics: How CFD Modeling Redefined Overtaking",
        category: catSports,
        image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
        summary: "An analysis of computational fluid dynamics in ground-effect formula one cars and racing physics."
      },
      {
        title: "The Math of Moneyball: Expected Goals (xG) in Modern Football",
        category: catSports,
        image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
        summary: "How spatial analytics and machine learning tracking replace traditional scouting metrics in European football."
      },
      {
        title: "Biomechanical Efficiency in Olympic Sport Climbing",
        category: catSports,
        image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80",
        summary: "Analyzing center-of-mass trajectory and grip-force distribution in speed climbing and bouldering."
      },

      // 8. Entertainment & Media
      {
        title: "Streaming Bottlenecks: How Bitrate Allocation Shapes Cinematic Visuals",
        category: catEnt,
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
        summary: "An engineering look at modern compression codecs like AV1 and dynamic encoding pipelines."
      },
      {
        title: "Sound Design in Dune: Synthesizing the Audio Architecture of Arrakis",
        category: catEnt,
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
        summary: "A study of acoustic modeling, tactile sub-bass synthesis, and non-traditional cinema audio."
      },
      {
        title: "Procedural Generation in Indie Games: Balancing Chaos and Order",
        category: catEnt,
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
        summary: "How algorithms like Perlin noise and wave function collapse create cohesive digital landscapes."
      },

      // 9. Social & Lifestyle
      {
        title: "Digital Minimalism: Reclaiming Human Agency in the Feed Era",
        category: catSocial,
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
        summary: "An essay on cognitive offloading, intentional friction, and constructing spaces for focused thought."
      },
      {
        title: "Urban Third Places: The Sociology of Cafes and Public Libraries",
        category: catSocial,
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
        summary: "How community hubs combat isolation and foster local collaboration in modern cities."
      },
      {
        title: "The Slow Movement: Resisting the Acceleration of Modern Work",
        category: catSocial,
        image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80",
        summary: "A critical review of productivity culture, digital nomadism, and the shift towards slow living."
      },

      // 10. News & Geopolitics
      {
        title: "Information Decentralization: The Shift in Global News Distribution",
        category: catNews,
        image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
        summary: "Analyzing the transition from centralized broadcast media to sovereign newsletter networks and social feeds."
      },
      {
        title: "Global Energy Transition: Balancing Grid Security and Renewables",
        category: catNews,
        image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
        summary: "An investigation into battery storage bottlenecks, nuclear baseload capacity, and smart-grid infrastructure."
      },
      {
        title: "The Geopolitics of Semiconductors: Scaling Fabrication Constraints",
        category: catNews,
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
        summary: "How lithography limitations and specialized supply chains shape technological sovereignty."
      },

      // 11. Literature & Philosophy
      {
        title: "Narrative Structures in Modern Investigative Journalism",
        category: catLit,
        image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80",
        summary: "Exploring longform storytelling techniques, character development, and factual pacing in prestige essays."
      },
      {
        title: "Critical Thinking in the Age of High-Frequency Information",
        category: catLit,
        image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
        summary: "A philosophical essay on intellectual patience, epistemological hygiene, and resisting sensationalist feeds."
      },
      {
        title: "Revisiting Epistolary Narratives in the Digital Age",
        category: catLit,
        image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80",
        summary: "How historical letter-writing traditions map to modern asynchronous communication and newsletters."
      },

      // 12. Science & Future Tech
      {
        title: "Quantum Computing: Fault-Tolerant Qubits & Error Correction",
        category: catScience,
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
        summary: "Surface code error correction and topological qubits pushing quantum advantage closer to reality."
      },
      {
        title: "Nuclear Fusion Energy: Magnetic Confinement in Tokamaks",
        category: catScience,
        image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
        summary: "Superconducting magnets and plasma stability experiments seeking net energy gain."
      },
      {
        title: "James Webb Telescope Data: Redefining Early Cosmic Formation",
        category: catScience,
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        summary: "Infrared spectroscopic findings challenging conventional galaxy evolution models."
      },

      // 13. Travel & Exploration
      {
        title: "Expedition to the Svalbard Vault: Archiving Human Knowledge",
        category: catTravel,
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
        summary: "A journey to the Arctic permafrost seed and code archives preserving civilizational heritage."
      },
      {
        title: "Brutalist Architecture of Kyoto: Modernist Concrete in Ancient Capital",
        category: catTravel,
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
        summary: "Exploring raw concrete sanctuaries and zen spatial philosophy in contemporary Japanese structures."
      },
      {
        title: "High-Altitude Trekking in Patagonia: Solitude & Glacial Geography",
        category: catTravel,
        image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=800&q=80",
        summary: "Field notes on mountain weather systems, granite towers, and remote wilderness conservation."
      },

      // 14. Food & Gastronomy
      {
        title: "Specialty Coffee Chemistry: Water Minerals & Extraction Physics",
        category: catFood,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
        summary: "Analyzing total dissolved solids (TDS), magnesium-calcium balance, and grind distribution for ideal espresso."
      },
      {
        title: "The Microbiology of Artisanal Fermentation in Modern Cuisine",
        category: catFood,
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        summary: "Lactic acid bacteria, wild yeast dynamics, and flavor synthesis in high-end culinary arts."
      },
      {
        title: "Farm-to-Table Gastronomy: Heirloom Crops & Soil Ecology",
        category: catFood,
        image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
        summary: "Regenerative agriculture, seasonal tasting menus, and restoring biodiversity in fine dining."
      },

      // 15. Arts & Culture
      {
        title: "Architectural Photography: Geometry, Shadow & Light Composition",
        category: catArts,
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
        summary: "Capturing structural rhythm, vanishing points, and natural illumination in urban spaces."
      },
      {
        title: "The Legacy of Bauhaus: Functional Aesthetics in Contemporary Art",
        category: catArts,
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
        summary: "How Walter Gropius and the Bauhaus movement fused craftsmanship, industrial production, and fine art."
      },
      {
        title: "Digital Curation in the Modern Museum: Interactive Spatial Design",
        category: catArts,
        image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80",
        summary: "Designing immersive digital galleries that bridge physical artifacts and interactive multimedia exhibits."
      }
    ];

    const postsData = [];
    const baseDate = new Date("2026-07-28T12:00:00.000Z");

    for (let i = 0; i < articles.length; i++) {
      const art = articles[i];
      const title = art.title;
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const author = authors[i % authors.length];
      const postTags = [tags[i % tags.length]._id, tags[(i + 4) % tags.length]._id];

      const content = `
        <h2>1. Executive Overview of ${title}</h2>
        <p>In modern high-stakes environments, the execution of ${title.toLowerCase()} represents a defining pillar of professional excellence. Content creators, technical leaders, and editorial minds must look past superficial trends to build deep, resilient frameworks.</p>
        <p>When analyzing this domain, we observe that true quality emerges when structural precision matches visual elegance. Whether designing enterprise software systems or publishing longform journalism, balance remains the ultimate metric.</p>
        
        <blockquote>
          “Excellence in editorial publishing and engineering is not an act of luck; it is a discipline of consistent, intentional craftsmanship.”
        </blockquote>

        <h2>2. Fundamental Principles & Strategic Frameworks</h2>
        <p>To master these dynamics, leaders implement core methodologies:</p>
        <ul>
          <li><strong>Rigorous Standardisation:</strong> Establishing clear conventions early prevents downstream friction and cognitive fatigue.</li>
          <li><strong>Minimalist Focus:</strong> Eliminating unnecessary noise leaves room for high-impact insights and clean presentation.</li>
          <li><strong>Scalable Architecture:</strong> Building systems that accommodate growth without sacrificing speed or stability.</li>
        </ul>

        <h2>3. Practical Execution & Real-World Impact</h2>
        <p>By applying these systematic guidelines, institutions achieve sustainable performance and authoritative positioning. As technological landscape continues to accelerate, staying grounded in high-integrity fundamentals ensures long-term victory.</p>
      `;

      const publishedAt = new Date(baseDate.getTime() - (i * 4 * 60 * 60 * 1000));

      postsData.push({
        title,
        slug,
        summary: art.summary,
        content,
        featuredImage: art.image,
        author: author._id,
        category: art.category._id,
        tags: postTags,
        status: 'published',
        publishedAt,
        isFeatured: i === 0 || i === 6,
        isSticky: i === 0,
        isPremium: i % 3 === 0,
        seo: {
          metaTitle: `${title} — Byline Journal`,
          metaDescription: art.summary
        },
        viewsCount: Math.floor(Math.random() * 850) + 120,
        likesCount: Math.floor(Math.random() * 190) + 25,
        bookmarksCount: Math.floor(Math.random() * 60) + 5
      });
    }

    await Post.create(postsData);
    console.log(`Ultra-premium seeding completed! Successfully created ${postsData.length} unique articles across ${categories.length} categories!`);
    console.log('--- ADMIN DEFAULT ACCOUNT CREDENTIALS ---');
    console.log('Super Admin Username: admin@byline.com');
    console.log('Password: adminpassword123');
    console.log('----------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
