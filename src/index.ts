import { program } from 'commander';
import { NewBranchTask } from './task/NewBranchTask';
import { Logger } from './tools/Logger';
import { GitClient } from './api/GitClient';

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

program.parse();
