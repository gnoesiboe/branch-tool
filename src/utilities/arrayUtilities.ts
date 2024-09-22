export function groupByCallback<T>(
    array: T[],
    callback: (item: T) => string,
): Record<string, T[]> {
    return array.reduce((accumulator, item) => {
        const key = callback(item);

        if (!accumulator[key]) {
            accumulator[key] = [];
        }

        accumulator[key].push(item);

        return accumulator;
    }, {} as Record<string, T[]>);
}
