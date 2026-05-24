// Определение меток для тестов
const TestTags = {
    SMOKE: 'smoke',
    REGRESSION: 'regression',
    LOGIN: 'login',
    CART: 'cart',
    CHECKOUT: 'checkout',
    SORT: 'sort',
    SLOW: 'slow',
    FAST: 'fast'
};

// Базовый класс для тестов с метками
class TaggedTest {
    constructor(name, tags, priority = 0) {
        this.name = name;
        this.tags = tags;
        this.priority = priority;
        this.status = null;
        this.error = null;
    }
}

// Определение всех тестов с метками
const allTests = [
    new TaggedTest('Авторизация: Стандартный пользователь', 
        [TestTags.LOGIN, TestTags.SMOKE, TestTags.FAST], 1),
    
    new TaggedTest('Авторизация: Заблокированный пользователь', 
        [TestTags.LOGIN, TestTags.REGRESSION, TestTags.FAST], 2),
    
    new TaggedTest('Авторизация: Пользователь с проблемами', 
        [TestTags.LOGIN, TestTags.REGRESSION, TestTags.FAST], 2),
    
    new TaggedTest('Авторизация: Неверные данные', 
        [TestTags.LOGIN, TestTags.SMOKE, TestTags.FAST], 1),
    
    new TaggedTest('Добавление одного товара в корзину', 
        [TestTags.CART, TestTags.SMOKE, TestTags.FAST], 1),
    
    new TaggedTest('Добавление нескольких товаров в корзину', 
        [TestTags.CART, TestTags.REGRESSION, TestTags.FAST], 2),
    
    new TaggedTest('Удаление товара из корзины', 
        [TestTags.CART, TestTags.SMOKE, TestTags.FAST], 1),
    
    new TaggedTest('Полный цикл оформления заказа', 
        [TestTags.CHECKOUT, TestTags.SMOKE, TestTags.SLOW], 1),
    
    new TaggedTest('Сортировка Name (A to Z)', 
        [TestTags.SORT, TestTags.SMOKE, TestTags.FAST], 1),
    
    new TaggedTest('Сортировка Name (Z to A)', 
        [TestTags.SORT, TestTags.REGRESSION, TestTags.FAST], 2),
    
    new TaggedTest('Сортировка Price (low to high)', 
        [TestTags.SORT, TestTags.SMOKE, TestTags.FAST], 1),
    
    new TaggedTest('Сортировка Price (high to low)', 
        [TestTags.SORT, TestTags.REGRESSION, TestTags.FAST], 2),
    
    new TaggedTest('Пустые поля (ожидаемо падает)', 
        [TestTags.LOGIN, TestTags.REGRESSION, TestTags.FAST], 3),
    
    new TaggedTest('Тест с русским языком (SKIP)', 
        [TestTags.REGRESSION, TestTags.SLOW], 4)
];

// Функция фильтрации тестов по меткам
function filterTestsByTags(tests, includeTags = [], excludeTags = []) {
    return tests.filter(test => {
        // Проверка на включение (если указаны includeTags, тест должен иметь хотя бы одну из них)
        if (includeTags.length > 0) {
            const hasIncludeTag = includeTags.some(tag => test.tags.includes(tag));
            if (!hasIncludeTag) return false;
        }
        // Проверка на исключение
        if (excludeTags.length > 0) {
            const hasExcludeTag = excludeTags.some(tag => test.tags.includes(tag));
            if (hasExcludeTag) return false;
        }
        return true;
    });
}

// Функция сортировки тестов по приоритету
function sortTestsByPriority(tests) {
    return [...tests].sort((a, b) => a.priority - b.priority);
}

module.exports = {
    TestTags,
    TaggedTest,
    allTests,
    filterTestsByTags,
    sortTestsByPriority
};