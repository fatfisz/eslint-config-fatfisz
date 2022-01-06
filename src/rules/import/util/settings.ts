import { Rule } from 'eslint';

export function getPackagesFromSettings(context: Rule.RuleContext) {
  return new Set([
    ...getPackageList(context, 'fatfisz/imports/builtins'),
    ...getPackageList(context, 'fatfisz/imports/packages'),
  ]);
}

function getPackageList(context: Rule.RuleContext, key: string) {
  const maybeArray = context.settings[key];
  if (!maybeArray) {
    return [];
  }
  if (!Array.isArray(maybeArray)) {
    throw new Error(`Expected the "${key}" setting to be an array of paths`);
  }
  for (const element of maybeArray) {
    if (typeof element !== 'string') {
      throw new Error(
        `Expected elements of the "${key}" setting to be strings, instead found an element of type "${typeof element}"`,
      );
    }
  }
  return maybeArray as string[];
}
