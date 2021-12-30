import { isPackageInstalled } from './isPackageInstalled';

export function checkDeps() {
  const missingPackages: string[] = [];

  if (isPackageInstalled('react')) {
    checkRequiredPackages('eslint-plugin-react', 'eslint-plugin-react-hooks');
  }

  if (isPackageInstalled('typescript')) {
    checkRequiredPackages(
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      'typescript',
    );
  }

  if (missingPackages.length > 0) {
    console.error(`
Error from eslint-config-fatfisz: some packages are missing
${missingPackages.map((missingPackage) => `- ${missingPackage}`).join('\n')}

Run \`yarn add -ED ${missingPackages.join(' ')}\`
  `);
  }

  function checkRequiredPackages(...requiredPackages: string[]) {
    missingPackages.push(...requiredPackages.filter((name) => !isPackageInstalled(name)));
  }
}
