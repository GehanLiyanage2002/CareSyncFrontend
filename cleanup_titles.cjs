const fs = require('fs');
const path = require('path');

function removeTitles(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const titlesToRemove = [
    'title="Update your full name"',
    'title="Update your contact number"',
    'title="Your registered email address (cannot be changed)"',
    'title="Save all changes to your basic information"',
    'title="Enter your medical specialization"',
    'title="Enter your years of professional experience"',
    'title="Enter your medical qualifications"',
    'title="Write a brief professional bio"',
    'title="Enter your clinic location"',
    'title="Save changes to your professional details"',
    'title="Select your blood group"',
    'title="Enter any known allergies"',
    'title="Enter any ongoing chronic medical conditions"',
    'title="Enter the name of your emergency contact"',
    'title="Enter the phone number of your emergency contact"'
  ];

  titlesToRemove.forEach(title => {
    content = content.replace(new RegExp('\\s*' + title.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&'), 'g'), '');
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleaned up titles in ${path.basename(filePath)}`);
}

const frontendPath = 'd:/React Project/CareSync/CareSyncFrontend';
removeTitles(path.join(frontendPath, 'src/components/profile/GeneralProfileTab.jsx'));
removeTitles(path.join(frontendPath, 'src/components/profile/MedicalProfileTab.jsx'));
