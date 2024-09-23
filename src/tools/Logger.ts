import chalk from 'chalk';

export type TreeItem = string | number | Array<TreeItem>;

export class Logger {
    logDefinition(term: string, definition: string | boolean | number) {
        console.log(chalk.yellow(`${term}:`), definition);
    }

    logSection(title: string): void {
        console.log(chalk.blue(`\n\n${title}\n${'-'.repeat(title.length)}\n`));
    }

    logHeader(message: string): void {
        console.log(chalk.cyan(message));
    }

    logTree(
        items: Array<TreeItem>,
        level: number = 1,
        prefix: string = '',
    ): void {
        const indenting = ' '.repeat(level);

        const determineCharacter = (
            index: number,
            listLength: number,
            nextIsLastAndArray: boolean,
        ): string => {
            if (index === 0) {
                return listLength === 1 ? '-' : '┌';
            }

            const isLast = index === listLength - 1;
            if (isLast || nextIsLastAndArray) {
                return '└';
            }

            return '├';
        };

        items.forEach((item, index) => {
            const nextIsLastAndArray =
                index === items.length - 2 && Array.isArray(items[index + 1]);

            const isLastItem = index === items.length - 1;

            if (Array.isArray(item)) {
                this.logTree(item, level + 1, isLastItem ? '   ' : ' ├ ');

                return;
            }

            console.log(
                chalk.gray(
                    prefix +
                        indenting +
                        determineCharacter(
                            index,
                            items.length,
                            nextIsLastAndArray,
                        ),
                ),
                item,
            );
        });
    }

    logWarning(message: string): void {
        console.warn(chalk.yellow('⚠️', message));
    }

    logError(message: string): void {
        const messageWithPrefix = `! ${message}`;

        console.error(
            chalk.red('┌' + '─'.repeat(messageWithPrefix.length + 2) + '┐'),
        );
        console.error(chalk.red('│ ' + messageWithPrefix + ' │'));
        console.error(
            chalk.red('└' + '─'.repeat(messageWithPrefix.length + 2) + '┘'),
        );
    }

    logLineBreak(): void {
        console.log('');
    }

    logSuccess(message: string): void {
        console.log(chalk.green('✅', message));
    }
}
