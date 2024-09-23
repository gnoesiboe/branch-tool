import { execSync } from 'child_process';
import { groupByCallback } from '../utilities/arrayUtilities';

const listBranchesMergedInCurrentCommand = `git branch --merged | egrep -v "(^\\*|master|main)"`;

export class GitClient {
    resolveCurrentBranch(): string {
        return execSync('git branch --show-current').toString();
    }

    branchOff(newBranchName: string): void {
        execSync(`git checkout -b ${newBranchName}`);
    }

    listBranchesMergedInCurrent(): string[] {
        try {
            return execSync(listBranchesMergedInCurrentCommand)
                .toString()
                .split('\n')
                .filter((branch) => branch.length > 0)
                .map((branch) => branch.trim());
        } catch (error) {
            return [];
        }
    }

    deleteBranch(branchName: string): void {
        execSync(`git branch -d ${branchName}`);
    }

    listBranches(): {
        current: string;
        stacks: Record<string, string[]>;
    } {
        const result = execSync('git --no-pager branch').toString();

        const parts = result.split('\n');

        const currentBranchIndex = parts.findIndex((part) =>
            part.startsWith('* '),
        );
        if (currentBranchIndex === -1) {
            throw new Error('Could not find current branch');
        }

        const currentBranch = parts[currentBranchIndex]
            .replace(/^\*/, '')
            .trim();

        const allBranches = parts
            .filter((part, index) => index !== currentBranchIndex)
            .concat(currentBranch)
            .map((part) => part.trim())
            .filter((part) => part.length > 0)
            .sort((a, b) => a.localeCompare(b));

        const stacks = groupByCallback(allBranches, (branch) => {
            return branch.replace(/-[0-9]+$/, '');
        });

        return {
            current: currentBranch,
            stacks,
        };
    }
}
