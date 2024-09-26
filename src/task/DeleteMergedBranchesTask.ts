import inquirer from 'inquirer';
import { GitClient } from '../api/GitClient';
import { Logger } from '../tools/Logger';
import { TaskInterface } from './TaskInterface';

export class DeleteMergedBranchesTask implements TaskInterface {
    constructor(
        private readonly logger: Logger,
        private readonly gitClient: GitClient,
    ) {}

    private determineBranchesMergedInCurrent(): string[] {
        this.logger.logSection('Determine to be deleted branches');

        const { current } = this.gitClient.listBranches();

        console.log(
            `The following branches will be deleted, as they are already merged into '${current}'.`,
        );
        this.logger.logLineBreak();

        const branchesMergedInCurrent =
            this.gitClient.listBranchesMergedInCurrent();

        this.logger.logList(branchesMergedInCurrent);

        return branchesMergedInCurrent;
    }

    private async confirmWantsToDelete(): Promise<boolean> {
        const { confirmed } = await inquirer.prompt(
            // @ts-expect-error Don't know what's wrong here..
            [
                {
                    type: 'confirm',
                    name: 'confirmed',
                    message: 'Do you want to delete these branches?',
                },
            ],
        );

        return confirmed;
    }

    private deleteBranches(branches: string[]): void {
        this.logger.logSection('Delete branches');

        branches.forEach((branch) => {
            console.log(`Deleting branch '${branch}'`);

            this.gitClient.deleteBranch(branch);
        });

        this.logger.logLineBreak();
        this.logger.logSuccess('All branches deleted');
    }

    async execute(): Promise<number> {
        const branchesMergedInCurrent = this.determineBranchesMergedInCurrent();
        if (branchesMergedInCurrent.length === 0) {
            this.logger.logWarning('No branches to delete');

            return 0;
        }

        this.logger.logLineBreak();

        const confirmed = await this.confirmWantsToDelete();

        this.logger.logLineBreak();

        if (!confirmed) {
            this.logger.logWarning('Deletion aborted');

            return 0;
        }

        this.deleteBranches(branchesMergedInCurrent);

        return 0;
    }
}
