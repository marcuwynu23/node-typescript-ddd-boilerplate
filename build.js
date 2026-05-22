const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs').promises;

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  outdir: 'dist',
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  sourcemap: false,
  external: [],
};
async function copyOpenAPISpec() {
  const openAPISpecPath = path.join(__dirname, 'openapi');
  const distOpenAPISpecPath = path.join(__dirname, 'dist', 'openapi');

  try {
    await fs.stat(openAPISpecPath);
    console.log('Copying openapi directory...');
    await fs.cp(openAPISpecPath, distOpenAPISpecPath, { recursive: true });
    console.log('openapi directory copied to dist!');
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
    console.log('openapi directory not found, skipping...');
  }
}

async function build() {
  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('Watching for changes...');
  } else {
    await copyOpenAPISpec();
    await esbuild.build(buildOptions);
    console.log('Build complete!');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
