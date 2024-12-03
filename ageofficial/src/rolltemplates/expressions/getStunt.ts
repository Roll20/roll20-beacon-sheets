import type { DiceComponent } from '../rolltemplates';

export const getStunt = (dice:DiceComponent[]) => {
    return getLastEntry(dice[0].dice)
}

function getLastEntry(arr: any) {
    return arr[arr.length - 1];
}
