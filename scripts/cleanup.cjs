const yargs = require("yargs");
const glob = require("glob");
const { existsSync, rmSync } = require("fs");
const { resolve } = require("path");
yargs("cleanup")
  .command("cleanup", false, async (args) => {
    const files = glob.sync("packages/**/build".replace(/\\/g, "/"), {});
    files.forEach((_) => {
      if (existsSync(resolve(_))) {
        rmSync(resolve(_), {
          force: true,
          recursive: true,
          maxRetries: 2,
        });
      }
    });
  })
  .parse();
