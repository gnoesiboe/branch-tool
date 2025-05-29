import { has } from 'lodash';
import { GitClient } from '../api/GitClient';
import { Logger } from '../tools/Logger';
import inquirer from 'inquirer';
import { randomUUID } from 'crypto';

export class RebaseTask {
    constructor(
        private readonly logger: Logger,
        private readonly gitClient: GitClient,
    ) {}

    private checkHasOpenChanges(): boolean {
        this.logger.logSection('Check for open changes');

        const filesThatHaveChanges =
            this.gitClient.getOpenChangedAndStagedFileNames();

        if (filesThatHaveChanges.length > 0) {
            this.logger.logWarning('Has open changes');
            this.logger.logLineBreak();

            this.logger.logList(filesThatHaveChanges);
        } else {
            this.logger.logSection('No open changes found');
        }

        return filesThatHaveChanges.length > 0;
    }

    private async confirm(message: string): Promise<boolean> {
        const { confirm } = await inquirer.prompt(
            // @ts-expect-error Don't know what's wrong here..
            [
                {
                    type: 'confirm',
                    name: 'confirm',
                    message,
                    default: false,
                    required: true,
                },
            ],
        );

        return confirm;
    }

    private stashOpenChanges(): void {
        this.logger.logSection('Stacking open changes');

        this.gitClient.stashOpenChanges();

        this.logger.logSuccess(`Open changes stashed`);
    }

    private popStashedChanges(): void {
        this.logger.logSection('Popping stashed changes');

        this.gitClient.popStashedChanges();

        this.logger.logSuccess(`Done`);
    }

    private async determineBranchToRebaseOnto(): Promise<string> {
        this.logger.logSection('Determine branch to rebase onto');

        const { branchName } = await inquirer.prompt(
            // @ts-expect-error Don't know what's wrong here..
            [
                {
                    type: 'input',
                    name: 'branchName',
                    message: 'What branch do you want to rebase onto? ',
                    default: 'main',
                    required: true,
                },
            ],
        );

        this.logger.logLineBreak();
        this.logger.logSuccess(`Branch to rebase onto: ${branchName}`);

        return branchName;
    }

    rebaseOnTopOf(branchName: string): void {
        this.logger.logSection(`Rebase current branch onto ${branchName}`);

        this.gitClient.rebaseCurrentBranchOnTopOf(branchName);

        this.logger.logLineBreak();
        this.logger.logSuccess('Done');
    }

    pullLatestChangesFromOrigin(): void {
        this.logger.logSection('Pull latest changes from origin');

        this.gitClient.pullLatestChangesFromOrigin();

        this.logger.logLineBreak();
        this.logger.logSuccess('done');
    }

    async execute(): Promise<number> {
        const hasOpenChanges = this.checkHasOpenChanges();

        let hasStashedChanges: boolean = false;

        if (hasOpenChanges) {
            this.logger.logLineBreak();

            const wantsToStash = await this.confirm(
                'Do you want to stack your changes so we can proceed with the rebase?',
            );
            if (!wantsToStash) {
                this.logger.logLineBreak();
                this.logger.logError(
                    'Exiting, as we cannot proceed with rebase without stashing changes',
                );

                return 1;
            }

            hasStashedChanges = true;

            this.stashOpenChanges();
        }

        this.logger.logLineBreak();
        const wantsToPullOrigin = await this.confirm(
            'Do you want to pull the latest changes from origin before rebasing?',
        );
        if (wantsToPullOrigin) {
            this.pullLatestChangesFromOrigin();
        }

        this.rebaseOnTopOf(await this.determineBranchToRebaseOnto());

        if (hasStashedChanges) {
            this.popStashedChanges();
        }

        return 0;
    }
}
