import chalk from 'chalk';
import { BranchTree } from '../api/GitClient';

export type TreeItem = string | number | Array<TreeItem>;

const currentBranchSuffix = '[current]';

export class Logger {
    logDefinition(term: string, definition: string | boolean | number) {
        console.log(chalk.yellow(`${term}:`), definition);
    }

    logSection(title: string): void {
        console.log(chalk.blue(`\n\n${title}\n${'─'.repeat(title.length)}\n`));
    }

    logHeader(message: string): void {
        console.log(chalk.cyan(message));
    }

    logList(items: string[]): void {
        items.forEach((item) => console.log(`${chalk.gray.dim('-')} ${item}`));
    }

    logBranchTree(
        tree: BranchTree,
        currentBranch: string,
        parentIndenting: string = '',
    ): void {
        const entries = Object.entries(tree) as Array<
            [string, string | Record<string, string | BranchTree>]
        >;

        const decorateItemToHighlightCurrentBranch = (item: string): string => {
            return item === currentBranch
                ? chalk.underline.yellow(item) +
                      ` ${chalk.yellow(currentBranchSuffix)}`
                : item;
        };

        const decorateNodeKey = (key: string): string => {
            return chalk.dim(key);
        };

        const decorateTree = (tree: string): string => {
            return chalk.dim.gray(tree);
        };

        entries.forEach(([key, item], indexParent) => {
            const isLastEntry = indexParent === entries.length - 1;

            const parentListCharacter = (() => {
                if (isLastEntry) {
                    return '└';
                }

                return '├';
            })();

            if (typeof item === 'string') {
                console.log(
                    `${decorateTree(parentIndenting)}${decorateTree(
                        parentListCharacter,
                    )} ${decorateNodeKey(
                        key,
                    )}: ${decorateItemToHighlightCurrentBranch(item)}`,
                );

                return;
            }

            if (Array.isArray(item)) {
                console.log(
                    `${decorateTree(parentIndenting)}${decorateTree(
                        parentListCharacter,
                    )} ${decorateNodeKey(key)}`,
                );

                item.forEach((childItem, indexChild) => {
                    const childListCharacter = (() => {
                        if (item.length === 1) {
                            return '└';
                        }

                        if (indexChild === item.length - 1) {
                            return '└';
                        }

                        return '├';
                    })();

                    console.log(
                        `${decorateTree(parentIndenting)}  ${decorateTree(
                            childListCharacter,
                        )} ${decorateItemToHighlightCurrentBranch(childItem)}`,
                    );
                });

                return;
            }

            if (item instanceof Object) {
                console.log(
                    `${decorateTree(parentIndenting)}${decorateTree(
                        parentListCharacter,
                    )} ${decorateNodeKey(key)}`,
                );

                const parentIndentingForChildren =
                    parentIndenting + (isLastEntry ? '  ' : '│ ');
                this.logBranchTree(
                    item,
                    currentBranch,
                    parentIndentingForChildren,
                );

                return;
            }

            throw new Error(
                `Not expecting to get here, with item: '${JSON.stringify(
                    item,
                )}'`,
            );
        });
    }

    logWarning(message: string): void {
        console.warn(chalk.yellow('⚠️', message));
    }

    logError(message: string): void {
        const lines = this.wrapMessageInBox(message, '✗');

        lines.forEach((line) => console.error(chalk.red(line)));
    }

    logLineBreak(): void {
        console.log('');
    }

    logSuccess(message: string): void {
        const lines = this.wrapMessageInBox(message, '✓');

        lines.forEach((line) => console.log(chalk.green(line)));
    }

    private wrapMessageInBox(message: string, prefix: string = ''): string[] {
        const boxWidth = message.length + 2;
        const maxLineWidth = 80;
        const maxAllowedBoxWith =
            boxWidth < maxLineWidth ? boxWidth : maxLineWidth;

        const linesOfWords: string[] = [];
        message.split(' ').forEach((word) => {
            if (linesOfWords.length === 0) {
                linesOfWords.push(word);

                return;
            }

            const lastLine = linesOfWords[linesOfWords.length - 1];
            const proposedLine = `${lastLine} ${word}`;

            if (proposedLine.length > maxAllowedBoxWith) {
                linesOfWords.push(word);

                return;
            }

            linesOfWords[linesOfWords.length - 1] = proposedLine;
        });

        return [
            '┌' + '─'.repeat(maxAllowedBoxWith + 2) + '┐',
            ...linesOfWords.map((line) => {
                return '│ ' + line.padEnd(maxAllowedBoxWith, ' ') + ' │';
            }),
            '└' + '─'.repeat(maxAllowedBoxWith + 2) + '┘',
        ];
    }
}
