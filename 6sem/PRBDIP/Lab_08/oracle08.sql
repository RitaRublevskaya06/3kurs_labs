SET SERVEROUTPUT ON;

-- 1. ОЧИСТКА
DROP TABLE TourObjectTable CASCADE CONSTRAINTS PURGE;
DROP TABLE ClientObjectTable CASCADE CONSTRAINTS PURGE;
DROP TYPE TourTypeObject FORCE;
DROP TYPE ClientTypeObject FORCE;


-- 2.1. СОЗДАНИЕ ОБЪЕКТНОГО ТИПА TourTypeObject
CREATE OR REPLACE TYPE TourTypeObject AS OBJECT
(
    tour_id          NUMBER,
    title            NVARCHAR2(255),
    description      CLOB,
    tour_type_id     NUMBER,
    country_id       NUMBER,
    hotel_id         NUMBER,
    duration_days    NUMBER,
    departure_date   DATE,
    base_price       NUMBER(10,2),
    available_seats  NUMBER,
    is_active        NUMBER(1),
    created_at       TIMESTAMP,
    
    -- a. Дополнительный конструктор
    CONSTRUCTOR FUNCTION TourTypeObject(
        p_title        NVARCHAR2,
        p_base_price   NUMBER,
        p_duration_days NUMBER
    ) RETURN SELF AS RESULT,
    
    -- b. Метод сравнения MAP (по цене)
    MAP MEMBER FUNCTION CompareByPrice RETURN NUMBER,
    
    -- c. Функция как метод экземпляра
    MEMBER FUNCTION GetTourInfo RETURN NVARCHAR2,
    
    -- d. Процедура как метод экземпляра
    MEMBER PROCEDURE PrintTourInfo
);
/

-- Тело типа TourTypeObject
CREATE OR REPLACE TYPE BODY TourTypeObject AS

    -- a. Дополнительный конструктор
    CONSTRUCTOR FUNCTION TourTypeObject(
        p_title        NVARCHAR2,
        p_base_price   NUMBER,
        p_duration_days NUMBER
    ) RETURN SELF AS RESULT IS
    BEGIN
        SELF.tour_id := NULL;
        SELF.title := p_title;
        SELF.description := NULL;
        SELF.tour_type_id := NULL;
        SELF.country_id := NULL;
        SELF.hotel_id := NULL;
        SELF.duration_days := p_duration_days;
        SELF.departure_date := NULL;
        SELF.base_price := p_base_price;
        SELF.available_seats := 0;
        SELF.is_active := 1;
        SELF.created_at := CURRENT_TIMESTAMP;
        RETURN;
    END;

    -- b. MAP-метод для сравнения (возвращает цену)
    MAP MEMBER FUNCTION CompareByPrice RETURN NUMBER IS
    BEGIN
        RETURN NVL(SELF.base_price, 0);
    END;

    -- c. Функция-метод: возвращает строку с информацией о туре
    MEMBER FUNCTION GetTourInfo RETURN NVARCHAR2 IS
    BEGIN
        RETURN 'Тур: ' || SELF.title || 
               ', Цена: ' || TO_CHAR(SELF.base_price, '99999.00') || 
               ' руб., Длительность: ' || TO_CHAR(SELF.duration_days) || ' дней' ||
               CASE WHEN SELF.is_active = 1 THEN ' (Активен)' ELSE ' (Неактивен)' END;
    END;

    -- d. Процедура-метод: выводит информацию о туре
    MEMBER PROCEDURE PrintTourInfo IS
    BEGIN
        DBMS_OUTPUT.PUT_LINE(SELF.GetTourInfo());
    END;

END;
/


-- 2.2. СОЗДАНИЕ ОБЪЕКТНОГО ТИПА ClientTypeObject
CREATE OR REPLACE TYPE ClientTypeObject AS OBJECT
(
    client_id        NUMBER,
    email            NVARCHAR2(255),
    first_name       NVARCHAR2(100),
    last_name        NVARCHAR2(100),
    phone            NVARCHAR2(20),
    passport_number  NVARCHAR2(50),
    loyalty_points   NUMBER,
    client_since     DATE,
    
    -- a. Дополнительный конструктор
    CONSTRUCTOR FUNCTION ClientTypeObject(
        p_first_name   NVARCHAR2,
        p_last_name    NVARCHAR2,
        p_email        NVARCHAR2
    ) RETURN SELF AS RESULT,
    
    -- b. Метод сравнения ORDER (по фамилии и имени)
    ORDER MEMBER FUNCTION CompareClients(other IN ClientTypeObject) RETURN INTEGER,
    
    -- c. Функция как метод экземпляра
    MEMBER FUNCTION GetFullName RETURN NVARCHAR2,
    
    -- d. Процедура как метод экземпляра
    MEMBER PROCEDURE PrintClientInfo
);
/

-- Тело типа ClientTypeObject
CREATE OR REPLACE TYPE BODY ClientTypeObject AS

    -- a. Дополнительный конструктор
    CONSTRUCTOR FUNCTION ClientTypeObject(
        p_first_name   NVARCHAR2,
        p_last_name    NVARCHAR2,
        p_email        NVARCHAR2
    ) RETURN SELF AS RESULT IS
    BEGIN
        SELF.client_id := NULL;
        SELF.email := p_email;
        SELF.first_name := p_first_name;
        SELF.last_name := p_last_name;
        SELF.phone := NULL;
        SELF.passport_number := NULL;
        SELF.loyalty_points := 0;
        SELF.client_since := SYSDATE;
        RETURN;
    END;

    -- b. ORDER-метод для сравнения клиентов
    ORDER MEMBER FUNCTION CompareClients(other IN ClientTypeObject) RETURN INTEGER IS
    BEGIN
        IF SELF.last_name > other.last_name THEN
            RETURN 1;
        ELSIF SELF.last_name < other.last_name THEN
            RETURN -1;
        ELSE
            IF SELF.first_name > other.first_name THEN
                RETURN 1;
            ELSIF SELF.first_name < other.first_name THEN
                RETURN -1;
            ELSE
                RETURN 0;
            END IF;
        END IF;
    END;

    -- c. Функция-метод: возвращает полное имя клиента
    MEMBER FUNCTION GetFullName RETURN NVARCHAR2 IS
    BEGIN
        RETURN SELF.first_name || ' ' || SELF.last_name;
    END;

    -- d. Процедура-метод: выводит информацию о клиенте
    MEMBER PROCEDURE PrintClientInfo IS
    BEGIN
        DBMS_OUTPUT.PUT_LINE('Клиент: ' || SELF.GetFullName());
        DBMS_OUTPUT.PUT_LINE('  Email: ' || NVL(SELF.email, 'не указан'));
        DBMS_OUTPUT.PUT_LINE('  Телефон: ' || NVL(SELF.phone, 'не указан'));
        DBMS_OUTPUT.PUT_LINE('  Баллы лояльности: ' || NVL(TO_CHAR(SELF.loyalty_points), '0'));
        DBMS_OUTPUT.PUT_LINE('  Клиент с: ' || TO_CHAR(SELF.client_since, 'DD.MM.YYYY'));
    END;

END;
/

-- 3. СОЗДАНИЕ ОБЪЕКТНЫХ ТАБЛИЦ
CREATE TABLE TourObjectTable OF TourTypeObject (
    PRIMARY KEY (tour_id)
);

CREATE TABLE ClientObjectTable OF ClientTypeObject (
    PRIMARY KEY (client_id)
);



-- 4. ЗАПОЛНЕНИЕ ТАБЛИЦ
TRUNCATE TABLE TourObjectTable;
TRUNCATE TABLE ClientObjectTable;

BEGIN
    FOR i IN 1..50 LOOP
        INSERT INTO TourObjectTable VALUES (
            TourTypeObject(
                i,                                          -- tour_id
                'Тур ' || i || ': Путешествие мечты',      -- title
                'Описание тура номер ' || i,               -- description
                MOD(i, 5) + 1,                             -- tour_type_id
                MOD(i, 10) + 1,                            -- country_id
                MOD(i, 8) + 1,                             -- hotel_id
                5 + MOD(i, 15),                            -- duration_days
                SYSDATE + i,                               -- departure_date
                5000 + (i * 500),                          -- base_price
                10 + MOD(i, 20),                           -- available_seats
                CASE WHEN MOD(i, 10) < 8 THEN 1 ELSE 0 END, -- is_active
                CURRENT_TIMESTAMP                          -- created_at
            )
        );
    END LOOP;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Добавлено туров: ' || SQL%ROWCOUNT);
END;
/

BEGIN
    FOR i IN 1..30 LOOP
        INSERT INTO ClientObjectTable VALUES (
            ClientTypeObject(
                i,                                          -- client_id
                'client' || i || '@example.com',           -- email
                CASE MOD(i, 10)
                    WHEN 0 THEN 'Александр'
                    WHEN 1 THEN 'Мария'
                    WHEN 2 THEN 'Дмитрий'
                    WHEN 3 THEN 'Елена'
                    WHEN 4 THEN 'Сергей'
                    WHEN 5 THEN 'Анна'
                    WHEN 6 THEN 'Владимир'
                    WHEN 7 THEN 'Ольга'
                    WHEN 8 THEN 'Алексей'
                    ELSE 'Татьяна'
                END,                                        -- first_name
                CASE MOD(i, 8)
                    WHEN 0 THEN 'Иванов'
                    WHEN 1 THEN 'Петров'
                    WHEN 2 THEN 'Сидоров'
                    WHEN 3 THEN 'Кузнецов'
                    WHEN 4 THEN 'Смирнов'
                    WHEN 5 THEN 'Васильев'
                    WHEN 6 THEN 'Михайлов'
                    ELSE 'Федоров'
                END,                                        -- last_name
                '+375 29' || LPAD(i, 7, '0'),               -- phone
                'PASS' || LPAD(i, 8, '0'),                  -- passport_number
                MOD(i, 15) * 100,                          -- loyalty_points
                SYSDATE - (i * 30)                          -- client_since
            )
        );
    END LOOP;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Добавлено клиентов: ' || SQL%ROWCOUNT);
END;
/

-- 5.1. Представление для туров
CREATE OR REPLACE VIEW TourInfoView AS
SELECT 
    t.tour_id,
    t.title,
    t.base_price,
    t.duration_days,
    t.departure_date,
    t.available_seats,
    CASE WHEN t.is_active = 1 THEN 'Активен' ELSE 'Неактивен' END AS status,
    t.GetTourInfo() AS tour_info
FROM TourObjectTable t;

-- 5.2. Представление для клиентов
CREATE OR REPLACE VIEW ClientInfoView AS
SELECT 
    c.client_id,
    c.GetFullName() AS full_name,
    c.email,
    c.phone,
    c.loyalty_points,
    c.client_since
FROM ClientObjectTable c;

-- Просмотр представлений
SELECT * FROM TourInfoView WHERE ROWNUM <= 5;
SELECT * FROM ClientInfoView WHERE ROWNUM <= 5;

SELECT * FROM TourObjectTable;
SELECT * FROM ClientObjectTable;


-- 6.1. Индекс по обычному атрибуту (title)
CREATE INDEX idx_tour_title ON TourObjectTable (title);

-- 6.2. Индекс по обычному атрибуту (base_price)
CREATE INDEX idx_tour_price ON TourObjectTable (base_price);

-- Демонстрация
EXPLAIN PLAN FOR
    SELECT * FROM TourObjectTable WHERE title = 'Тур 25: Путешествие мечты';
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

SELECT * FROM TourObjectTable WHERE title = 'Тур 25: Путешествие мечты';



-- 6.3. Создание функционального индекса
CREATE TABLE TourFunctionalIndex AS
SELECT 
    t.tour_id,
    t.title,
    t.base_price,
    t.duration_days,
    t.is_active,
    t.GetTourInfo() AS tour_info
FROM TourObjectTable t;

-- Индекс по методу
CREATE INDEX idx_tour_method ON TourFunctionalIndex (tour_info);

-- Демонстрация
EXPLAIN PLAN FOR
    SELECT * FROM TourFunctionalIndex 
    WHERE tour_info LIKE '%Активен%';
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

-- Вывод результата
SELECT tour_id, title, tour_info 
FROM TourFunctionalIndex 
WHERE tour_info LIKE '%Активен%'
AND ROWNUM <= 5;

----------------------------------------------------------------------------------------

ALTER TABLE TourFunctionalIndex MODIFY is_active_text VARCHAR2(20);

UPDATE TourFunctionalIndex SET is_active_text = 
    CASE WHEN is_active = 1 THEN 'Активен' ELSE 'Неактивен' END;

CREATE INDEX idx_active_text ON TourFunctionalIndex (is_active_text);

SELECT * FROM TourFunctionalIndex WHERE is_active_text = 'Активен';


----------------------------------------------------------------------------------------

-- 7.1. Индекс по обычному атрибуту (last_name)
CREATE INDEX idx_client_lastname ON ClientObjectTable (last_name);

-- 7.2. Индекс по обычному атрибуту (email)
CREATE INDEX idx_client_email ON ClientObjectTable (email);

-- Демонстрация
EXPLAIN PLAN FOR
    SELECT * FROM ClientObjectTable WHERE last_name = 'Иванов';
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

SELECT * FROM ClientObjectTable WHERE last_name = 'Иванов';

-- 7.3. Индекс по методу GetFullName (функциональный)
CREATE TABLE ClientFunctionalIndex AS
SELECT 
    c.client_id,
    c.first_name,
    c.last_name,
    c.email,
    c.loyalty_points,
    c.GetFullName() AS full_name
FROM ClientObjectTable c;

-- Функциональный индекс
CREATE INDEX idx_client_method ON ClientFunctionalIndex (full_name);

-- Демонстрация
EXPLAIN PLAN FOR
    SELECT * FROM ClientFunctionalIndex 
    WHERE full_name = 'Дмитрий Сидоров';
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

-- Вывод результата
SELECT client_id, full_name, loyalty_points, email
FROM ClientFunctionalIndex 
WHERE full_name = 'Дмитрий Сидоров';


-- 8. ПОКАЗ ИНДЕКСОВ
PROMPT === Все индексы для объектных таблиц ===
SELECT index_name, table_name, uniqueness, index_type
FROM user_indexes 
WHERE table_name IN ('TOUROBJECTTABLE', 'CLIENTOBJECTTABLE', 'TOURFUNCTIONALINDEX', 'CLIENTFUNCTIONALINDEX')
ORDER BY table_name, index_name;

PROMPT === Колонки индексов ===
SELECT index_name, table_name, column_name, column_position
FROM user_ind_columns 
WHERE table_name IN ('TOUROBJECTTABLE', 'CLIENTOBJECTTABLE', 'TOURFUNCTIONALINDEX', 'CLIENTFUNCTIONALINDEX')
ORDER BY table_name, index_name, column_position;


-- 9. ДЕМОНСТРАЦИЯ РАБОТЫ МЕТОДОВ ТИПОВ
DECLARE
    v_tour     TourTypeObject;
    v_tour2    TourTypeObject;
    v_client   ClientTypeObject;
    v_client2  ClientTypeObject;
    v_client3  ClientTypeObject;
    cmp_result INTEGER;
BEGIN
    -- Тестирование TourTypeObject
    DBMS_OUTPUT.PUT_LINE('--- TourTypeObject ---');
    v_tour := TourTypeObject('Эксклюзивный тур', 25000, 14);
    v_tour.PrintTourInfo();
    
    -- Демонстрация MAP метода сравнения
    v_tour2 := TourTypeObject('Эконом тур', 8000, 7);
    IF v_tour.CompareByPrice() > v_tour2.CompareByPrice() THEN
        DBMS_OUTPUT.PUT_LINE('Первый тур дороже второго');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Второй тур дороже или равен первому');
    END IF;
    
    -- Тестирование ClientTypeObject
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('--- ClientTypeObject ---');
    v_client := ClientTypeObject('Иван', 'Петров', 'ivan@mail.com');
    v_client.PrintClientInfo();
    
    -- Демонстрация ORDER метода сравнения
    v_client2 := ClientTypeObject('Анна', 'Иванова', 'anna@mail.com');
    v_client3 := ClientTypeObject('Иван', 'Петров', 'ivan2@mail.com');
    
    cmp_result := v_client.CompareClients(v_client2);
    DBMS_OUTPUT.PUT_LINE('Результат сравнения Петров vs Иванова: ' || cmp_result);
    
    cmp_result := v_client.CompareClients(v_client3);
    DBMS_OUTPUT.PUT_LINE('Результат сравнения Петров vs Петров: ' || cmp_result);
    
    -- Демонстрация функции GetFullName
    DBMS_OUTPUT.PUT_LINE('Функция GetFullName(): ' || v_client.GetFullName());
END;
/

-- 10. ИТОГОВАЯ ПРОВЕРКА
PROMPT === Итоговое количество записей ===
SELECT 'TourObjectTable' AS table_name, COUNT(*) AS row_count FROM TourObjectTable
UNION ALL
SELECT 'ClientObjectTable', COUNT(*) FROM ClientObjectTable;

PROMPT === Вывод данных из представлений ===
SELECT * FROM TourInfoView WHERE ROWNUM <= 10;
SELECT * FROM ClientInfoView WHERE ROWNUM <= 10;
