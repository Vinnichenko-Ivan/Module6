/**
 * Вычисление двоичного логарифма от числа, который умножен на то же число
 * @param num число
 */
export function log2linear(num: number): number {
    return num <= 0 ? 0 : num * Math.log2(num);
}

/**
 * Вычисление энтропии:
 * @param bag массив с количеством элементов класса i, где i - номер класса
 * @param total количество всего элементов
 * @return энтропия
 * @see <img src="https://studfile.net/html/1334/288/html_sxlCF4lY9R.S2nb/img-Cvsqif.png" width=256, height=80>
 */
export function entropy(bag: number[], total: number): number {
    let entropy = 0;

    for (let j = 0; j < bag.length; j++) {
        entropy -= log2linear(bag[j] / total);
    }
    return entropy;
}