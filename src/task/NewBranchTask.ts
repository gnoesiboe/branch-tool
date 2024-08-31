import { GitClient } from '../api/GitClient';
import { Logger } from '../tools/Logger';
import { Task } from './TaskInterface';
import inquirer from 'inquirer';

type ChangType =
    | 'feature'
    | 'improvement'
    | 'bugfix'
    | 'refactoring'
    | 'documentation'
    | 'test';

export class NewBranchTask implements Task {
    constructor(
        private readonly logger: Logger,
        private readonly gitClient: GitClient,
    ) {}

    private transformStringToBranchNamePart(value: string): string {
        return value.replace(/[^a-z0-9]/gi, '-');
    }

    private async confirmWantsToStack(): Promise<boolean> {
        const { doStack } = await inquirer.prompt(
            // @ts-expect-error Don't know what's wrong here..
            [
                {
                    type: 'confirm',
                    name: 'doStack',
                    message:
                        'Do you want to stack your changes? This will keep the current branch name and suffix it with the follow-up number.',
                    default: false,
                    required: true,
                },
            ],
        );

        return doStack;
    }

    private async composeNewBranchName(): Promise<string> {
        const answers = await inquirer.prompt(
            // @ts-expect-error Don't know what's wrong here..
            [
                {
                    type: 'list',
                    name: 'type',
                    message: 'What type of change you work on?',
                    choices: [
                        'feature',
                        'improvement',
                        'bugfix',
                        'refactoring',
                        'documentation',
                        'test',
                    ] satisfies ChangType[],
                    default: 'improvement',
                    required: true,
                },
                {
                    type: 'input',
                    name: 'jiraTicketKey',
                    message: 'What is the Jira ticket number?',
                    required: true,
                    askAnswered: true,
                },
                {
                    type: 'input',
                    name: 'description',
                    message: 'What do you intend to work on?',
                    required: true,
                },
            ],
        );

        const firstPart = this.transformStringToBranchNamePart(
            answers.type,
        ).toLowerCase();
        const secondPart = [
            answers.jiraTicketKey,
            answers.description.toLowerCase(),
        ]
            .map((value) => this.transformStringToBranchNamePart(value))
            .join('_');

        return `${firstPart}/${secondPart}`;
    }

    private async determineNewStackedBranchName(
        currentBranch: string,
    ): Promise<string> {
        const isAlreadySuccessor = currentBranch.match(/-\d+$/);
        if (!isAlreadySuccessor) {
            return `${currentBranch}-2`;
        }

        const parts = currentBranch.split('-');
        const suffix = parts.pop();
        const baseBranch = parts.join('-');

        const newSuffix = Number(suffix) + 1;
        if (isNaN(newSuffix)) {
            throw new Error(
                `Unexpected extracted branch name suffix '${currentBranch}'`,
            );
        }

        return `${baseBranch}-${newSuffix}`;
    }

    private async determineNewBranchName(
        doStack: boolean,
        currentBranch: string,
    ): Promise<string> {
        this.logger.logSection('Determine new branch name');
        const newBranchName = doStack
            ? await this.determineNewStackedBranchName(currentBranch)
            : await this.composeNewBranchName();

        this.logger.logDefinition('New branch name', newBranchName);

        return newBranchName;
    }

    private async determineCurrentSituation(): Promise<{
        currentBranch: string;
        doStack: boolean;
    }> {
        this.logger.logSection('Determine current situation');

        const currentBranch = this.gitClient
            .resolveCurrentBranch()
            .trim()
            .toLowerCase();
        this.logger.logDefinition('Current branch', currentBranch);

        const onDefaultBranch = currentBranch === 'main';

        const doStack = !onDefaultBranch && (await this.confirmWantsToStack());
        this.logger.logDefinition('Do stack', doStack);

        return { currentBranch, doStack };
    }

    private async applyNewBranchName(newBranchName: string): Promise<void> {
        this.logger.logSection('Apply new branch name');

        this.gitClient.branchOff(newBranchName);

        this.logger.logSuccess(`Branch '${newBranchName}' created`);
    }

    async execute(): Promise<number> {
        const { currentBranch, doStack } =
            await this.determineCurrentSituation();

        const newBranchName = await this.determineNewBranchName(
            doStack,
            currentBranch,
        );

        await this.applyNewBranchName(newBranchName);

        return 1;
    }
}
