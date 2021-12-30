export function isPackageInstalled(name: string) {
  try {
    require.resolve(name);
    return true;
  } catch {
    return false;
  }
}
