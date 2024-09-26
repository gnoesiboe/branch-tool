import { execSync } from 'child_process';
import { groupByCallback } from '../utilities/arrayUtilities';
import { branchSeparator } from '../task/NewBranchTask';

const listBranchesMergedInCurrentCommand = `git branch --merged | egrep -v "(^\\*|master|main)"`;

export interface BranchTree {
    [key: string]: string | BranchTree;
}

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

    deleteBranch(branchName: string, force: boolean = false): void {
        const operator = force ? '-D' : '-d';

        execSync(`git branch ${operator} ${branchName}`);
    }

    listBranches(): {
        current: string;
        stacks: Record<string, string[]>;
        all: string[];
        tree: BranchTree;
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
            all: allBranches,
            tree: this.composeBranchTree(stacks),
        };
    }

    private composeBranchTree(stacks: Record<string, string[]>): BranchTree {
        const tree: BranchTree = {};

        Object.entries(stacks).forEach(([stackRoot, stackBranches]) => {
            const hasSections = stackRoot.includes(branchSeparator);
            if (!hasSections) {
                tree['other'] = tree['other'] || {};
                // @ts-expect-error Some issue here. Fix later
                tree['other'][stackRoot] =
                    stackBranches.length === 1
                        ? stackBranches[0]
                        : stackBranches;

                return;
            }

            const sections = stackRoot.split(branchSeparator);
            const type = sections.shift() as string;

            tree[type] = tree[type] || {};

            if (sections.length === 1) {
                // @ts-expect-error Some issue here. Fix later
                tree[type][sections.join(branchSeparator)] =
                    stackBranches.length === 1
                        ? stackBranches[0]
                        : stackBranches;
            }

            if (sections.length >= 2) {
                const [issueKey, ...others] = sections;

                (tree[type] as BranchTree)[issueKey] =
                    (tree[type] as BranchTree)[issueKey] || {};

                // @ts-expect-error Some issue here. Fix later
                tree[type][issueKey][others.join(branchSeparator)] =
                    stackBranches.length === 1
                        ? stackBranches[0]
                        : stackBranches;
            }
        });

        return tree;
    }
}
