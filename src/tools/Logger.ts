import chalk from "chalk";

export class Logger {
  logDefinition(term: string, definition: string) {
    console.log(chalk.yellow(`${term}:`), definition);
  }
  logSection(title: string): void {
    console.log(chalk.cyan(`\n${title}\n${"-".repeat(title.length)}\n`));
  }
}
