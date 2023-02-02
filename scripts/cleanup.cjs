const yargs = require("yargs");
const glob = require("glob");
const { existsSync, rmSync } = require("fs");
const { default: path } = require("path");
yargs("cleanup")
  .command("cleanup", false, async (args) => {
    const files = glob.sync("packages/**/build".replace(/\\/g, "/"), {});
    files.forEach((_) => {
      if (existsSync(path.resolve(_))) {
        rmSync(path.resolve(_), {
          force: true,
          recursive: true,
          maxRetries: 2,
        });
      }
    });
  })
  .parse();
