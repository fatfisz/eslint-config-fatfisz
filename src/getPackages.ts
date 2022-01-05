import { readFileSync } from 'fs';
import { pkgUpSync } from 'pkg-up';

export function getPackages() {
  try {
    const packageJsonPath = pkgUpSync();
    if (!packageJsonPath) {
      return [];
    }
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    return [...getDeps(packageJson.dependencies), ...getDeps(packageJson.devDependencies)];
  } catch {
    return [];
  }
}

function getDeps(dependencies: any) {
  return dependencies ? Object.keys(dependencies) : [];
}
