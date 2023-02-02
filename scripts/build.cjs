const yargs = require("yargs");
const path = require("path");
const glob = require("fast-glob");
const { exec, execSync } = require("child_process");
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

    exec(command, {
      env: { ...process.env, ...env },
    }).on("error", (error) => {
      throw new Error(`'${command}' failed with \n${error}`);
    });
  })
  .parse();
