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

const deleteCommand = program
    .command('delete')
    .summary('Delete branches')
    .description('Tools for deleting branches.');

deleteCommand
    .command('merged')
    .summary('Delete branches merged in current')
    .description(
        'Tool to delete branches that are already merged in the current branch. It will list the branches to be deleted, and will confirm before deleting. It will not use force delete let GIT do additional checks to see if it is merged.',
    )
    .action(async (deleteAction: string) => {
        const logger = new Logger();

        const exitCode = await new DeleteMergedBranchesTask(
            logger,
            new GitClient(),
        ).execute();

        process.exit(exitCode);
    });

program.parse();
