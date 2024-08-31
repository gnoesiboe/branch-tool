import chalk from 'chalk';

export class Logger {
    logDefinition(term: string, definition: string | boolean | number) {
        console.log(chalk.yellow(`${term}:`), definition);
    }
    logSection(title: string): void {
        console.log(chalk.cyan(`\n${title}\n${'-'.repeat(title.length)}\n`));
    }

    logLineBreak(): void {
        console.log('\n');
    }

    logSuccess(message: string): void {
        console.log(chalk.green('✅', message));
    }
}
