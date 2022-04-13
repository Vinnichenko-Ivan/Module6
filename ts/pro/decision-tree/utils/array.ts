/**
 * Простая функция для создания массива чисел определенной длины
 * @param length длина массива
 * @return number[] массив
 */
export function numberArray(length: number): number[] {
    let array = new Array<number>(length);

    for (let i = 0; i < length; i++) {
        array[i] = 0;
    }

    return array;
}

/**
 * Простая функция для создания матрицы чисел определенной длины
 * @param height высота матрицы
 * @param width ширина матрицы
 * @return number[][] матрица
 */
export function numberMatrix(height: number, width: number): number[][] {
    let array = new Array<number[]>(height);

    for (let i = 0; i < height; i++) {
        array[i] = new Array<number>(width);

        for (let j = 0; j < width; j++) {
            array[i][j] = 0;
        }
    }

    return array;
}