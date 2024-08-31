import { program } from "commander";
import { NewBranchTask } from "./task/NewBranchTask";
import { Logger } from "./tools/Logger";
import { GitClient } from "./api/gitClient";

program
  .name("branch tool")
  .description("CLI tool to help with branching and committing");

program
  .command("new")
  .description("Start a new branch")
  .action(async (...args) => {
    const task = new NewBranchTask(new Logger(), new GitClient());
    const exitCode = await task.execute();

    process.exit(exitCode);
  });

program.parse();

const options = program.opts();

console.dir(options, {
  depth: null,
  colors: true,
  compact: false,
});
