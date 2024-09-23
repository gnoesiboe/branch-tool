import { GitClient } from '../api/GitClient';
import { Logger, TreeItem } from '../tools/Logger';
import { TaskInterface } from './TaskInterface';
import chalk from 'chalk';

const currentSuffix = ' [current]';

export class ListBranchesTask implements TaskInterface {
    constructor(
        private readonly logger: Logger,
        private readonly gitClient: GitClient,
    ) {}

    private logAllBranches(
        current: string,
        stacks: Record<string, string[]>,
    ): void {
        this.logger.logHeader('All local branches');
        const stacksAsTree = Object.entries(stacks).reduce<Array<TreeItem>>(
            (accumulator, [branch, stackBranches]) => {
                accumulator.push(
                    branch === current
                        ? chalk.yellow(branch + currentSuffix)
                        : branch,
                );
                if (stackBranches.length > 1) {
                    accumulator.push(
                        stackBranches.map((stackBranch) => {
                            return stackBranch === current
                                ? chalk.yellow(stackBranch + currentSuffix)
                                : stackBranch;
                        }),
                    );
                }

                return accumulator;
            },
            [],
        );

        this.logger.logTree(stacksAsTree);
    }

    private logCurrent(current: string): void {
        this.logger.logHeader('Current');
        console.log(chalk.yellow(current));
    }

    async execute(): Promise<number> {
        this.logger.logSection('Listing all branches');

        const { current, stacks } = this.gitClient.listBranches();

        this.logCurrent(current);
        this.logger.logLineBreak();
        this.logAllBranches(current, stacks);

        return 0;
    }
}
