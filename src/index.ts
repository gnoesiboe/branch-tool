import { program } from 'commander';
import { NewBranchTask } from './task/NewBranchTask';
import { Logger } from './tools/Logger';
import { GitClient } from './api/GitClient';
import { ListBranchesTask } from './task/ListBranchesTask';
import { DeleteMergedBranchesTask } from './task/DeleteMergedBranchesTask';

program
    .name('branch tool')
    .description('CLI tool to help with branching and committing');

program
    .command('new')
    .summary('Start a new branch')
    .description(
        'Tools for creating new branches. It will allow you to create a stacked branch, or create a new branch with a type, ticket reference and description.',
    )
    .action(async () => {
        const exitCode = await new NewBranchTask(
            new Logger(),
            new GitClient(),
        ).execute();

        process.exit(exitCode);
    });

program
    .command('list')
    .summary('List all local branches')
    .description(
        'Tool for listing branches. It clearly displays the current branch, and also nests stacks of branches together in a tree.',
    )
    .action(async () => {
        const exitCode = await new ListBranchesTask(
            new Logger(),
            new GitClient(),
        ).execute();

        process.exit(exitCode);
    });

program
    .command('delete')
    .argument(
        'deleteAction',
        `Required. Action to perform. Supported are:
- 'merged' -> Lists and deletes all branches that are already merged into the current branch`,
    )
    .description('Tools for deleting branches.')
    .summary('Delete branches')
    .action(async (deleteAction: string) => {
        const logger = new Logger();

        switch (deleteAction) {
            case 'merged':
                const exitCode = await new DeleteMergedBranchesTask(
                    logger,
                    new GitClient(),
                ).execute();

                process.exit(exitCode);

            default:
                logger.logError(
                    `Unknown delete action: '${deleteAction}'. Supported are: 'merged'`,
                );

                process.exit(1);
        }
    });

program.parse();
