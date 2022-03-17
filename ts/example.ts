// Объявляем класс Foo, который можно будет импортировать из других модулей
export class Foo {

    // Объявляем поле foo типа string только для чтения
    private readonly foo: string;

    // Объявляем конструктор
    constructor(foo: string) {
        this.foo = foo;
    }

    // Объявляем метод
    alert(): void {
        alert(this.foo);
    }
}