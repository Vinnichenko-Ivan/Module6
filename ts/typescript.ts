// Импортируем класс Foo из модуля example
import {Foo} from "./example";

// Объявляем переменную с типом Foo
let foo: Foo;

// Создаем объект Foo
foo = new Foo("Hello World!");

// Через jquery вызываем при клике метод alert() у объекта Foo
$('button').on('click', () => foo.alert());

// Выводим после загрузки странички
alert('Загружено!');