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
    .description('Start a new branch')
    .action(async () => {
        const exitCode = await new NewBranchTask(
            new Logger(),
            new GitClient(),
        ).execute();

        process.exit(exitCode);
    });

program
    .command('list')
    .description('List all branches')
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
    .description('Delete branches')
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
