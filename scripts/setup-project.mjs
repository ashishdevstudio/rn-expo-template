import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const TEMPLATE = {
  appName: 'RN Expo Template',
  packageName: 'rn-expo-template',
  slug: 'rn-expo-template',
};

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const paths = {
  appConfig: path.join(projectRoot, 'app.json'),
  packageConfig: path.join(projectRoot, 'package.json'),
  packageLock: path.join(projectRoot, 'package-lock.json'),
  runtimeConfig: path.join(projectRoot, 'src/constants/app.ts'),
};

const runtimeNamePattern = /^(\s*name:\s*)(?:'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")(\s*,?\s*)$/gm;

const isRecord = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isYes = (value) => ['y', 'yes'].includes(value.trim().toLowerCase());

const validateAppName = (value) => {
  const appName = value.trim();

  return appName
    ? { value: appName }
    : { error: 'App display name cannot be empty.' };
};

const validateSlug = (value) => {
  const slug = value.trim();

  if (!slug) {
    return { error: 'Expo slug cannot be empty.' };
  }

  if (slug.length > 214) {
    return { error: 'Expo slug must be 214 characters or fewer.' };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      error:
        'Use lowercase letters, numbers, and single hyphens; do not start or end with a hyphen.',
    };
  }

  return { value: slug };
};

const validateIosBundleIdentifier = (value) => {
  const bundleIdentifier = value.trim();
  const component = '[A-Za-z](?:[A-Za-z0-9-]*[A-Za-z0-9])?';
  const pattern = new RegExp(`^${component}(?:\\.${component})+$`);

  if (!bundleIdentifier) {
    return { error: 'iOS bundle identifier cannot be empty.' };
  }

  if (bundleIdentifier.length > 255 || !pattern.test(bundleIdentifier)) {
    return {
      error:
        'Use dot-separated components containing letters, numbers, or hyphens, with each component starting with a letter.',
    };
  }

  return { value: bundleIdentifier };
};

const validateAndroidPackage = (value) => {
  const packageName = value.trim();

  if (!packageName) {
    return { error: 'Android package cannot be empty.' };
  }

  if (
    packageName.length > 255 ||
    !/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/.test(packageName)
  ) {
    return {
      error:
        'Use at least two lowercase dot-separated components; each must start with a letter and contain only letters, numbers, or underscores.',
    };
  }

  return { value: packageName };
};

const readRequiredFile = async (filePath, label) => {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`${label} is missing at ${filePath}.`);
    }

    throw new Error(`Could not read ${label}: ${getErrorMessage(error)}`);
  }
};

const parseJson = (source, label) => {
  try {
    const value = JSON.parse(source);

    if (!isRecord(value)) {
      throw new TypeError('The root value must be an object.');
    }

    return value;
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${getErrorMessage(error)}`);
  }
};

const getErrorMessage = (error) =>
  error instanceof Error ? error.message : 'Unknown error.';

const readProjectFiles = async () => {
  const [appConfigSource, packageConfigSource, packageLockSource, runtimeConfigSource] =
    await Promise.all([
      readRequiredFile(paths.appConfig, 'app.json'),
      readRequiredFile(paths.packageConfig, 'package.json'),
      readRequiredFile(paths.packageLock, 'package-lock.json'),
      readRequiredFile(paths.runtimeConfig, 'src/constants/app.ts'),
    ]);

  const appConfig = parseJson(appConfigSource, 'app.json');
  const packageConfig = parseJson(packageConfigSource, 'package.json');
  const packageLock = parseJson(packageLockSource, 'package-lock.json');

  if (!isRecord(appConfig.expo)) {
    throw new Error('app.json must contain an "expo" object.');
  }

  if (!isRecord(packageConfig.scripts)) {
    throw new Error('package.json must contain a "scripts" object.');
  }

  if (!runtimeConfigSource.includes('export const APP_CONFIG')) {
    throw new Error('src/constants/app.ts must export APP_CONFIG.');
  }

  const runtimeNameMatches = [...runtimeConfigSource.matchAll(runtimeNamePattern)];

  if (runtimeNameMatches.length !== 1) {
    throw new Error('Could not identify exactly one APP_CONFIG name in src/constants/app.ts.');
  }

  if ('ios' in appConfig.expo && !isRecord(appConfig.expo.ios)) {
    throw new Error('expo.ios in app.json must be an object.');
  }

  if ('android' in appConfig.expo && !isRecord(appConfig.expo.android)) {
    throw new Error('expo.android in app.json must be an object.');
  }

  if ('packages' in packageLock) {
    if (!isRecord(packageLock.packages) || !isRecord(packageLock.packages[''])) {
      throw new Error('package-lock.json has invalid root package metadata.');
    }
  }

  return {
    appConfig,
    packageConfig,
    packageLock,
    sources: {
      appConfig: appConfigSource,
      packageConfig: packageConfigSource,
      packageLock: packageLockSource,
      runtimeConfig: runtimeConfigSource,
    },
  };
};

const askQuestion = async (readline, prompt) => {
  let handleClose;
  const inputClosed = new Promise((_resolve, reject) => {
    handleClose = () => {
      reject(new Error('Input ended before setup was complete.'));
    };

    readline.once('close', handleClose);
  });

  try {
    return await Promise.race([readline.question(prompt), inputClosed]);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'AbortError' || ('code' in error && error.code === 'ERR_USE_AFTER_CLOSE'))
    ) {
      throw new Error('Input ended before setup was complete.');
    }

    throw error;
  } finally {
    readline.off('close', handleClose);
  }
};

const askUntilValid = async (readline, prompt, validate) => {
  while (true) {
    const result = validate(await askQuestion(readline, prompt));

    if ('value' in result) {
      return result.value;
    }

    process.stdout.write(`${result.error}\n`);
  }
};

const appearsUntouched = ({ appConfig, packageConfig, sources }) =>
  appConfig.expo.name === TEMPLATE.appName &&
  appConfig.expo.slug === TEMPLATE.slug &&
  packageConfig.name === TEMPLATE.packageName &&
  sources.runtimeConfig.includes(`name: '${TEMPLATE.appName}'`);

const updateRuntimeConfig = (source, appName) =>
  source.replace(runtimeNamePattern, (_match, prefix, suffix) => {
    return `${prefix}${JSON.stringify(appName)}${suffix}`;
  });

const buildChanges = (project, answers) => {
  const { appConfig, packageConfig, packageLock, sources } = project;
  const { appName, slug, iosBundleIdentifier, androidPackage } = answers;

  appConfig.expo.name = appName;
  appConfig.expo.slug = slug;
  appConfig.expo.ios = {
    ...(appConfig.expo.ios ?? {}),
    bundleIdentifier: iosBundleIdentifier,
  };
  appConfig.expo.android = {
    ...(appConfig.expo.android ?? {}),
    package: androidPackage,
  };

  packageConfig.name = slug;
  packageLock.name = slug;

  if (isRecord(packageLock.packages) && isRecord(packageLock.packages[''])) {
    packageLock.packages[''].name = slug;
  }

  return [
    {
      label: 'app.json',
      path: paths.appConfig,
      original: sources.appConfig,
      updated: `${JSON.stringify(appConfig, null, 2)}\n`,
    },
    {
      label: 'package.json',
      path: paths.packageConfig,
      original: sources.packageConfig,
      updated: `${JSON.stringify(packageConfig, null, 2)}\n`,
    },
    {
      label: 'package-lock.json',
      path: paths.packageLock,
      original: sources.packageLock,
      updated: `${JSON.stringify(packageLock, null, 2)}\n`,
    },
    {
      label: 'src/constants/app.ts',
      path: paths.runtimeConfig,
      original: sources.runtimeConfig,
      updated: updateRuntimeConfig(sources.runtimeConfig, appName),
    },
  ];
};

let temporaryFileCounter = 0;

const replaceFile = async (filePath, content) => {
  temporaryFileCounter += 1;
  const temporaryPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.setup-${process.pid}-${temporaryFileCounter}.tmp`,
  );

  try {
    await writeFile(temporaryPath, content, { encoding: 'utf8', flag: 'wx' });
    await rename(temporaryPath, filePath);
  } finally {
    await rm(temporaryPath, { force: true }).catch(() => undefined);
  }
};

const applyChanges = async (changes) => {
  const applied = [];

  try {
    for (const change of changes) {
      await replaceFile(change.path, change.updated);
      applied.push(change);
    }
  } catch (writeError) {
    const rollbackFailures = [];

    for (const change of applied.reverse()) {
      try {
        await replaceFile(change.path, change.original);
      } catch (rollbackError) {
        rollbackFailures.push(`${change.label}: ${getErrorMessage(rollbackError)}`);
      }
    }

    const rollbackMessage = rollbackFailures.length
      ? ` Rollback also failed for ${rollbackFailures.join('; ')}.`
      : ' Previously updated files were restored.';

    throw new Error(`Could not write project configuration: ${getErrorMessage(writeError)}.${rollbackMessage}`);
  }
};

const run = async () => {
  const project = await readProjectFiles();
  const readline = createInterface({ input: process.stdin, output: process.stdout });

  readline.on('SIGINT', () => {
    readline.close();
  });

  try {
    if (!appearsUntouched(project)) {
      process.stdout.write(
        'This project no longer appears to be the untouched RN Expo Template.\n' +
          'Running setup again may overwrite project identifiers.\n',
      );

      const shouldContinue = await askQuestion(readline, 'Continue anyway? (y/N) ');

      if (!isYes(shouldContinue)) {
        process.stdout.write('Setup cancelled. No files were changed.\n');
        return;
      }
    }

    const appName = await askUntilValid(readline, 'App display name: ', validateAppName);
    const slug = await askUntilValid(readline, 'Expo slug: ', validateSlug);
    const iosBundleIdentifier = await askUntilValid(
      readline,
      'iOS bundle identifier: ',
      validateIosBundleIdentifier,
    );
    const androidPackage = await askUntilValid(
      readline,
      'Android package: ',
      validateAndroidPackage,
    );

    process.stdout.write(
      `\nApp name: ${appName}\n` +
        `Slug: ${slug}\n` +
        `iOS bundle ID: ${iosBundleIdentifier}\n` +
        `Android package: ${androidPackage}\n\n`,
    );

    const shouldApply = await askQuestion(readline, 'Apply these changes? (y/N) ');

    if (!isYes(shouldApply)) {
      process.stdout.write('Setup cancelled. No files were changed.\n');
      return;
    }

    const changes = buildChanges(project, {
      appName,
      slug,
      iosBundleIdentifier,
      androidPackage,
    });

    await applyChanges(changes);

    for (const change of changes) {
      process.stdout.write(`✓ Updated ${change.label}\n`);
    }

    process.stdout.write(
      '\nProject setup complete.\n\n' +
        'Next:\n' +
        '1. Configure .env\n' +
        '2. Replace app icons/splash assets\n' +
        '3. Run npx expo start\n',
    );
  } finally {
    readline.close();
  }
};

try {
  await run();
} catch (error) {
  process.stderr.write(`Setup failed: ${getErrorMessage(error)}\n`);
  process.exitCode = 1;
}
