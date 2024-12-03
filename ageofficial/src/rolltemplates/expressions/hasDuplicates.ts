export const hasDuplicates = (dice:any[]) => {
    const unique = new Set(dice[0].dice);
    return unique.size !== dice[0].dice.length;
}