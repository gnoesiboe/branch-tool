import inquirer from 'inquirer';
import { GitClient } from '../api/GitClient';
import { Logger } from '../tools/Logger';
import { TaskInterface } from './TaskInterface';

export class DeleteSelectedBranchTask implements TaskInterface {
    constructor(
        private readonly logger: Logger,
        private readonly gitClient: GitClient,
    ) {}

    private determineDeletableBranches(): string[] {
        this.logger.logSection('Determine current branches');

        const { current, all } = this.gitClient.listBranches();

        const deletableBranches = all.filter((branch) => branch !== current);

        console.log(`Found ${deletableBranches.length} deletable branches`);

        return deletableBranches;
    }

    private async selectBranchToDelete(
        deletableBranches: string[],
    ): Promise<string> {
        this.logger.logSection('Select branch to delete');

        const { branchToDelete } = await inquirer.prompt(
            // @ts-expect-error Don't know what's wrong here..
            [
                {
                    type: 'list',
                    name: 'branchToDelete',
                    message: 'Select a branch to delete',
                    choices: deletableBranches,
                },
            ],
        );

        this.logger.logLineBreak();
        console.log(`Selected branch: '${branchToDelete}'.`);

        return branchToDelete;
    }

    private async deleteBranch(branchToDelete: string): Promise<boolean> {
        this.logger.logSection('Delete branch');

        console.log(`Soft deleting branch '${branchToDelete}'`);

        try {
            this.gitClient.deleteBranch(branchToDelete, false);

            this.logger.logLineBreak();
            this.logger.logSuccess(`Branch '${branchToDelete}' deleted`);

            return true;
        } catch (error) {
            this.logger.logLineBreak();

            const { confirmForceDelete } = await inquirer.prompt(
                // @ts-expect-error Don't know what's wrong here..
                [
                    {
                        type: 'confirm',
                        name: 'confirmForceDelete',
                        message:
                            'Failed to soft delete branch, which means GIT detects possibly unmerged commits. Do you want to continue?',
                    },
                ],
            );

            this.logger.logLineBreak();

            if (!confirmForceDelete) {
                this.logger.logWarning('User aborted force delete');

                return false;
            }

            console.log(`Force deleting branch '${branchToDelete}'`);

            try {
                this.gitClient.deleteBranch(branchToDelete, true);

                this.logger.logLineBreak();
                this.logger.logSuccess(`Branch '${branchToDelete}' deleted`);

                return true;
            } catch (error) {
                this.logger.logLineBreak();
                this.logger.logError(
                    `Failed to delete branch '${branchToDelete}'`,
                );

                return false;
            }
        }
    }

    async execute(): Promise<number> {
        const deletableBranches = this.determineDeletableBranches();
        if (deletableBranches.length === 0) {
            this.logger.logLineBreak();
            this.logger.logError(
                'No branches to delete, as there is only one, current branch.',
            );

            return 1;
        }

        const branchToDelete =
            deletableBranches.length > 1
                ? await this.selectBranchToDelete(deletableBranches)
                : deletableBranches[0];

        const success = await this.deleteBranch(branchToDelete);

        return success ? 0 : 1;
    }
}
