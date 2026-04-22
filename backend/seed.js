require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');
const Opportunity = require('./server/models/Opportunity');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB...');

  // Clear existing data
  await User.deleteMany({});
  await Opportunity.deleteMany({});
  console.log('Cleared existing data');

  // Create organizations
  const orgs = await User.insertMany([
    { name: 'TechCorp Admin', email: 'techcorp@demo.com', password: await bcrypt.hash('demo123', 12), role: 'organization', companyName: 'TechCorp Solutions', industry: 'Technology', location: 'Bangalore, India', website: 'https://techcorp.com', bio: 'A leading tech company building innovative software products.', companySize: '51-200', verified: true },
    { name: 'Analytics Hub', email: 'analytics@demo.com', password: await bcrypt.hash('demo123', 12), role: 'organization', companyName: 'Analytics Hub', industry: 'Data Science', location: 'Hyderabad, India', website: 'https://analyticshub.in', bio: 'Data-driven insights company transforming businesses.', companySize: '11-50', verified: true },
    { name: 'CreativeStudio', email: 'creative@demo.com', password: await bcrypt.hash('demo123', 12), role: 'organization', companyName: 'CreativeStudio', industry: 'Design', location: 'Mumbai, India', bio: 'Award-winning design studio for web and mobile products.', companySize: '11-50', verified: true },
    { name: 'GreenTech', email: 'greentech@demo.com', password: await bcrypt.hash('demo123', 12), role: 'organization', companyName: 'GreenTech Ventures', industry: 'Engineering', location: 'Pune, India', bio: 'Sustainable technology solutions for a better tomorrow.', companySize: '1-10', verified: true },
    { name: 'EduLearn', email: 'edulearn@demo.com', password: await bcrypt.hash('demo123', 12), role: 'organization', companyName: 'EduLearn Platform', industry: 'Education', location: 'Remote', bio: 'EdTech startup revolutionizing online learning.', companySize: '1-10' },
  ]);

  // Create students
  await User.insertMany([
    { name: 'Alice Johnson', email: 'alice@demo.com', password: await bcrypt.hash('demo123', 12), role: 'student', skills: ['JavaScript', 'React.js', 'Node.js', 'CSS'], bio: 'Passionate frontend developer', education: { degree: 'B.Tech', field: 'CSE', institution: 'IIT Bombay', graduationYear: 2025 }, portfolio: 'https://alice.dev' },
    { name: 'Bob Sharma', email: 'bob@demo.com', password: await bcrypt.hash('demo123', 12), role: 'student', skills: ['Python', 'Machine Learning', 'Data Analysis', 'SQL'], bio: 'Data science enthusiast', education: { degree: 'B.Sc', field: 'Data Science', institution: 'Delhi University', graduationYear: 2024 } },
    { name: 'Carol Patel', email: 'carol@demo.com', password: await bcrypt.hash('demo123', 12), role: 'student', skills: ['Figma', 'Adobe XD', 'UI/UX', 'Prototyping'], bio: 'Creative UI/UX designer', education: { degree: 'B.Des', field: 'Design', institution: 'NID Ahmedabad', graduationYear: 2025 } },
  ]);

  const deadline30 = new Date(); deadline30.setDate(deadline30.getDate() + 30);
  const deadline60 = new Date(); deadline60.setDate(deadline60.getDate() + 60);
  const deadline15 = new Date(); deadline15.setDate(deadline15.getDate() + 15);
  const deadline45 = new Date(); deadline45.setDate(deadline45.getDate() + 45);
  const deadline7 = new Date(); deadline7.setDate(deadline7.getDate() + 7);

  // Create opportunities
  await Opportunity.insertMany([
    {
      title: 'Frontend Developer Intern',
      description: 'Join our dynamic engineering team and work on building beautiful, responsive web applications using React.js and modern JavaScript frameworks. You will collaborate with senior developers, designers, and product managers to deliver exceptional user experiences.\n\nThis is a hands-on role where you\'ll be coding from day one!',
      type: 'internship', organization: orgs[0]._id,
      skills: ['React.js', 'JavaScript', 'CSS', 'HTML', 'Git'],
      domain: 'Technology', duration: { value: 3, unit: 'months' },
      location: 'Bangalore, India', mode: 'hybrid',
      stipend: { isPaid: true, amount: 20000, currency: 'INR' },
      openings: 3, applicationDeadline: deadline30,
      requirements: 'Basic knowledge of React and JavaScript. Familiarity with Git is a plus.',
      responsibilities: 'Build and maintain React components\nCollaborate with the design team\nWrite clean, testable code\nParticipate in code reviews',
      perks: ['Certificate of Completion', 'Letter of Recommendation', 'PPO Opportunity', 'Flexible Hours', 'Free Lunch'],
      status: 'active', views: 245
    },
    {
      title: 'Data Science & ML Project',
      description: 'Work on an exciting end-to-end machine learning project to build a recommendation system for our e-commerce platform. You\'ll process large datasets, train ML models, and deploy them to production.\n\nPerfect for students wanting real industry ML experience.',
      type: 'project', organization: orgs[1]._id,
      skills: ['Python', 'Machine Learning', 'Pandas', 'Scikit-learn', 'SQL'],
      domain: 'Data Science', duration: { value: 2, unit: 'months' },
      location: 'Remote', mode: 'remote',
      stipend: { isPaid: true, amount: 15000, currency: 'INR' },
      openings: 2, applicationDeadline: deadline60,
      requirements: 'Good understanding of Python and basic ML concepts.',
      responsibilities: 'Data preprocessing and EDA\nTrain and evaluate ML models\nBuild data pipeline\nPresent findings to stakeholders',
      perks: ['Certificate', 'LinkedIn Recommendation', 'Publication Opportunity'],
      status: 'active', views: 189
    },
    {
      title: 'UI/UX Design Internship',
      description: 'CreativeStudio is looking for a talented UI/UX design intern to join our team. You\'ll work on real client projects ranging from mobile apps to enterprise dashboards.\n\nYour designs will be used by thousands of real users!',
      type: 'internship', organization: orgs[2]._id,
      skills: ['Figma', 'Adobe XD', 'UI Design', 'Prototyping', 'User Research'],
      domain: 'Design', duration: { value: 4, unit: 'months' },
      location: 'Mumbai, India', mode: 'onsite',
      stipend: { isPaid: true, amount: 18000, currency: 'INR' },
      openings: 1, applicationDeadline: deadline15,
      requirements: 'Portfolio with at least 2 design projects. Proficiency in Figma.',
      responsibilities: 'Create wireframes and prototypes\nConduct user research\nDesign mobile and web interfaces\nPresent designs to clients',
      perks: ['Certificate', 'Portfolio Project', 'Mentorship', 'Networking Events'],
      status: 'active', views: 312
    },
    {
      title: 'Full Stack Web Development Intern',
      description: 'Build complete web applications from scratch using MERN stack. This is a great opportunity for students who want to experience the full product development lifecycle.',
      type: 'internship', organization: orgs[0]._id,
      skills: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'REST APIs'],
      domain: 'Technology', duration: { value: 6, unit: 'months' },
      location: 'Bangalore, India', mode: 'remote',
      stipend: { isPaid: true, amount: 25000, currency: 'INR' },
      openings: 2, applicationDeadline: deadline45,
      requirements: 'Knowledge of JavaScript and basic web development.',
      responsibilities: 'Develop full-stack features\nDesign database schemas\nBuild RESTful APIs\nDeploy applications',
      perks: ['Strong PPO opportunity', 'Certificate', 'Mentorship from senior engineers', 'Stock options upon joining'],
      status: 'active', views: 478
    },
    {
      title: 'Content Marketing Intern',
      description: 'Join EduLearn\'s marketing team to create compelling content that helps students discover our platform. You\'ll write blogs, manage social media, and run email campaigns.',
      type: 'internship', organization: orgs[4]._id,
      skills: ['Content Writing', 'SEO', 'Social Media', 'Canva', 'Email Marketing'],
      domain: 'Marketing', duration: { value: 3, unit: 'months' },
      location: 'Remote', mode: 'remote',
      stipend: { isPaid: false, amount: 0, currency: 'INR' },
      openings: 2, applicationDeadline: deadline30,
      requirements: 'Strong English writing skills. Familiarity with social media platforms.',
      perks: ['Certificate', 'Letter of Recommendation', 'Flexible hours', 'Portfolio building'],
      status: 'active', views: 134
    },
    {
      title: 'Sustainability Research Project',
      description: 'Conduct research on renewable energy solutions and their economic feasibility in emerging markets. You\'ll prepare reports, data analysis, and present findings.\n\nJoin us in solving climate change!',
      type: 'research', organization: orgs[3]._id,
      skills: ['Research', 'Data Analysis', 'Report Writing', 'Excel', 'Presentation'],
      domain: 'Research', duration: { value: 3, unit: 'months' },
      location: 'Pune, India', mode: 'hybrid',
      stipend: { isPaid: false, amount: 0, currency: 'INR' },
      openings: 3, applicationDeadline: deadline7,
      requirements: 'Interest in sustainability and environmental science.',
      perks: ['Research Publication Opportunity', 'Certificate', 'Conference Participation'],
      status: 'active', views: 87
    },
    {
      title: 'Android App Developer Intern',
      description: 'Build Android applications using Kotlin and modern Android architecture. Work on our mobile app used by over 100K users.',
      type: 'internship', organization: orgs[0]._id,
      skills: ['Kotlin', 'Android', 'Firebase', 'REST APIs', 'MVVM'],
      domain: 'Technology', duration: { value: 4, unit: 'months' },
      location: 'Bangalore, India', mode: 'hybrid',
      stipend: { isPaid: true, amount: 22000, currency: 'INR' },
      openings: 2, applicationDeadline: deadline60,
      requirements: 'Basic understanding of Kotlin and Android development.',
      perks: ['PPO', 'Certificate', 'Device for testing', 'Team outings'],
      status: 'active', views: 203
    },
    {
      title: 'Business Development Intern',
      description: 'Help EduLearn expand partnerships with colleges and companies. Manage outreach, presentations, and partnership negotiations.',
      type: 'internship', organization: orgs[4]._id,
      skills: ['Communication', 'Sales', 'PowerPoint', 'Market Research', 'Networking'],
      domain: 'Business', duration: { value: 2, unit: 'months' },
      location: 'Remote', mode: 'remote',
      stipend: { isPaid: false, amount: 0, currency: 'INR' },
      openings: 4, applicationDeadline: deadline45,
      requirements: 'Strong communication skills and drive for sales.',
      perks: ['Performance bonus', 'Certificate', 'Letter of Recommendation'],
      status: 'active', views: 156
    },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('\n📧 Demo accounts (all passwords: demo123):');
  console.log('🎓 Students: alice@demo.com, bob@demo.com, carol@demo.com');
  console.log('🏢 Organizations: techcorp@demo.com, analytics@demo.com, creative@demo.com, greentech@demo.com, edulearn@demo.com');
  await mongoose.disconnect();
};

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
