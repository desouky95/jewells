const yargs = require("yargs");
const path = require("path");
const glob = require("fast-glob");
const child_process = require("child_process");
const { promisify } = require("util");
const exec = promisify(child_process.exec);
const fse = require("fs-extra");

const packagePath = process.cwd();
const buildPath = path.join(packagePath, "./build");

async function createPackageFile() {
  const packageData = await fse.readFile(
    path.resolve(packagePath, "./package.json"),
    "utf8"
  );
  const { nyc, scripts, devDependencies, workspaces, ...packageDataOther } =
    JSON.parse(packageData);

  const newPackageData = {
    ...packageDataOther,
    private: false,
    ...(packageDataOther.main
      ? {
          main: fse.existsSync(path.resolve(buildPath, "./node/index.js"))
            ? "./node/index.js"
            : "./index.js",
          module: fse.existsSync(path.resolve(buildPath, "./esm/index.js"))
            ? "./esm/index.js"
            : "./index.js",
        }
      : {}),
    types: "./index.d.ts",
  };

  const targetPath = path.resolve(buildPath, "./package.json");

  await fse.writeFile(
    targetPath,
    JSON.stringify(newPackageData, null, 2),
    "utf8"
  );
  console.log(`Created package.json in ${targetPath}`);

  return newPackageData;
}
yargs("build")
  .option("out-dir", { default: "./build", type: "string" })
  .command("build", "building...", async ({ argv }) => {
    const { outDir: relativeOutDir } = await argv;
    const srcDir = path.resolve("./src");
    const extensions = [".js", ".ts", ".tsx"];
    const babelConfigPath = path.resolve(__dirname, "../.babelrc");
    const ignore = [
      "**/*.test.js",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/*.d.ts",
      "**/*.stories.tsx",
    ];

    const topLevelNonIndexFiles = glob
      .sync(`*{${extensions.join(",")}}`, { cwd: srcDir, ignore })
      .filter((file) => {
        return path.basename(file, path.extname(file)) !== "index";
      });
    const topLevelPathImportsCanBePackages = topLevelNonIndexFiles.length === 0;
    const outDir = path.resolve(relativeOutDir, "");

    const env = {
      NODE_ENV: "production",
    };
    const babelArgs = [
      "--config-file",
      babelConfigPath,
      "--extensions",
      `${extensions.join(",")}`,
      srcDir,
      "--out-dir",
      outDir,
      "--copy-files",
      "--no-copy-ignored",
      "--ignore",
      `${ignore.join(",")}`,
    ];

    const command = ["npx babel", ...babelArgs].join(" ");

    const { stderr, stdout } = await exec(command, {
      env: { ...process.env, ...env },
    });
    if (stderr) {
      throw new Error(`'${command}' failed with \n${error}`);
    }
    await createPackageFile();
  })
  .parse();
