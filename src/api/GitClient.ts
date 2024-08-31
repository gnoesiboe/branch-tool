import { execSync } from "child_process";

export class GitClient {
  resolveCurrentBranch(): string {
    return execSync("git branch --show-current").toString();
  }

  branchOff(newBranchName: string): void {
    const result = execSync(`git checkout -b ${newBranchName}`);
  }
}
