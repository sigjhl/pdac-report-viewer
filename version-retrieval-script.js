const fs = require('fs');
const { execSync } = require('child_process');

// Read the current package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Function to get the installed version of a package
function getInstalledVersion(packageName) {
  try {
    const output = execSync(`npm list ${packageName} --depth=0 --json`).toString().trim();
    const jsonOutput = JSON.parse(output);
    return jsonOutput.dependencies[packageName].version;
  } catch (error) {
    console.warn(`Warning: Unable to get version for ${packageName}. It may not be installed.`);
    return null;
  }
}

// Update versions in dependencies and devDependencies
['dependencies', 'devDependencies'].forEach(depType => {
  if (packageJson[depType]) {
    Object.keys(packageJson[depType]).forEach(pkg => {
      const installedVersion = getInstalledVersion(pkg);
      if (installedVersion) {
        packageJson[depType][pkg] = installedVersion;
        console.log(`Updated ${pkg} to version ${installedVersion}`);
      } else {
        console.log(`Keeping ${pkg} at version ${packageJson[depType][pkg]} (not installed locally)`);
      }
    });
  }
});

// Write the updated package.json
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

console.log('package.json has been updated with installed versions where possible.');
console.log('Please review the output above and manually check any packages that could not be updated.');