import { BranchTree, GitClient } from '../api/GitClient';
import { Logger, TreeItem } from '../tools/Logger';
import { TaskInterface } from './TaskInterface';
import chalk from 'chalk';

const currentSuffix = ' [current]';

export class ListBranchesTask implements TaskInterface {
    constructor(
        private readonly logger: Logger,
        private readonly gitClient: GitClient,
    ) {}

    private logAllBranches(current: string, tree: BranchTree): void {
        this.logger.logHeader('All local branches');

        this.logger.logBranchTree(tree, current);
    }

    private logCurrent(current: string): void {
        this.logger.logHeader('Current');
        console.log(chalk.yellow(current));
    }

    async execute(): Promise<number> {
        this.logger.logSection('Listing all branches');

        const { current, tree } = this.gitClient.listBranches();

        this.logCurrent(current);
        this.logger.logLineBreak();
        this.logAllBranches(current, tree);

        return 0;
    }
}
