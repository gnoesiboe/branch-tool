import { GitClient } from "../api/gitClient";
import { Logger } from "../tools/Logger";
import { Task } from "./Task.i";
import inquirer from "inquirer";

export class NewBranchTask implements Task {
  constructor(
    private readonly logger: Logger,
    private readonly gitClient: GitClient
  ) {}

  async execute(): Promise<number> {
    this.logger.logSection("Check current situation");

    const currentBranch = this.gitClient.resolveCurrentBranch();
    this.logger.logDefinition("Current branch", currentBranch);

    return 1;
  }
}
