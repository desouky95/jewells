const yargs = require("yargs");
const path = require("path");
const { existsSync } = require("fs");
const { exec } = require("child_process");

//
yargs("build tsc")
  .command(
    "build tsc",
    "building tsc...",
    async ({ argv }) => {
      const packageRoot = process.cwd();

      const tsconfigPath = path.join(packageRoot, "tsconfig.build.json");

      if (!existsSync(tsconfigPath)) {
        throw new Error(
          "Unable to find a tsconfig to build this project. " +
            `The package root needs to contain a 'tsconfig.build.json'. ` +
            `The package root is '${packageRoot}'`
        );
      }

      const command = ["npx", "tsc", "-b", tsconfigPath].join(" ");
      exec(command);
    }

    // (err) => console.log(err)
  )
  .parse();
