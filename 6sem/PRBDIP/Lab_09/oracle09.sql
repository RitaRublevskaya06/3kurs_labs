-- Задание 2a: Создание коллекций
DECLARE
    TYPE ClientCollection IS TABLE OF ClientTypeObject INDEX BY PLS_INTEGER;
    K1 ClientCollection;
    
    TYPE TourNestedCollection IS TABLE OF TourTypeObject INDEX BY PLS_INTEGER;
    TYPE ClientTourCollection IS TABLE OF TourNestedCollection INDEX BY PLS_INTEGER;
    K2 ClientTourCollection;
    
    v_client_counter NUMBER := 0;
    v_tour_counter NUMBER := 0;
    v_idx NUMBER;
    v_client_name VARCHAR2(200);
    v_tour_obj TourTypeObject;
    
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== Задание 2a: Создание коллекций ===');
    
    -- Заполнение K1
    FOR client_rec IN (SELECT * FROM ClientObjectTable)
    LOOP
        BEGIN
            K1(client_rec.client_id) := ClientTypeObject(
                NVL(client_rec.client_id, 0),
                NVL(client_rec.email, 'no email'),
                NVL(client_rec.first_name, 'Unknown'),
                NVL(client_rec.last_name, 'Unknown'),
                client_rec.phone,
                client_rec.passport_number,
                NVL(client_rec.loyalty_points, 0),
                client_rec.client_since
            );
            v_client_counter := v_client_counter + 1;
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  Ошибка при создании клиента ID ' || client_rec.client_id || ': ' || SQLERRM);
        END;
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('Загружено клиентов в K1: ' || v_client_counter);
    
    -- Заполнение K2
    v_idx := K1.FIRST;
    WHILE v_idx IS NOT NULL
    LOOP
        v_tour_counter := 0;

        BEGIN
            BEGIN
                v_client_name := K1(v_idx).GetFullName();
            EXCEPTION
                WHEN OTHERS THEN
                    v_client_name := 'ID=' || K1(v_idx).client_id;
            END;
            
            DBMS_OUTPUT.PUT_LINE(CHR(10) || 'Обработка клиента: ' || v_client_name);
            
            FOR booking_rec IN (
                SELECT 
                    t.tour_id,
                    t.title,
                    t.description,
                    t.tour_type_id,
                    t.country_id,
                    t.hotel_id,
                    t.duration_days,
                    t.departure_date,
                    t.base_price,
                    t.available_seats,
                    t.is_active,
                    t.created_at
                FROM BookingObjectTable b
                JOIN TourObjectTable t ON b.tour_id = t.tour_id
                WHERE b.client_id = K1(v_idx).client_id
            )
            LOOP
                v_tour_counter := v_tour_counter + 1;
                
                v_tour_obj := TourTypeObject(
                    booking_rec.title,
                    booking_rec.base_price,
                    booking_rec.duration_days
                );
                
                v_tour_obj.tour_id := booking_rec.tour_id;
                v_tour_obj.description := booking_rec.description;
                v_tour_obj.tour_type_id := booking_rec.tour_type_id;
                v_tour_obj.country_id := booking_rec.country_id;
                v_tour_obj.hotel_id := booking_rec.hotel_id;
                v_tour_obj.departure_date := booking_rec.departure_date;
                v_tour_obj.available_seats := booking_rec.available_seats;
                v_tour_obj.is_active := booking_rec.is_active;
                v_tour_obj.created_at := booking_rec.created_at;
                
                K2(v_idx)(v_tour_counter) := v_tour_obj;
            END LOOP;

            IF v_tour_counter > 0 THEN
                DBMS_OUTPUT.PUT_LINE(v_client_name || ': ' || v_tour_counter || ' тур(ов)');
            ELSE
                DBMS_OUTPUT.PUT_LINE(v_client_name || ': нет туров');
            END IF;
            
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('Ошибка при обработке клиента ID ' || K1(v_idx).client_id || ': ' || SQLERRM);
        END;
        
        v_idx := K1.NEXT(v_idx);
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || 'Коллекции успешно созданы!');
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Ошибка: ' || SQLERRM);
END;
/

-- Задание 2b: Проверка членства в коллекции K1
DECLARE
    TYPE ClientCollection IS TABLE OF ClientTypeObject INDEX BY PLS_INTEGER;
    K1 ClientCollection;
    
    v_client_id NUMBER := 1;
    v_is_member BOOLEAN := FALSE;
    v_result_msg VARCHAR2(500);
    v_client_name VARCHAR2(200);
    v_idx NUMBER;
    
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== Задание 2b: Проверка членства в коллекции ===');
    
    K1.DELETE;
    
    FOR client_rec IN (SELECT * FROM ClientObjectTable)
    LOOP
        BEGIN
            K1(client_rec.client_id) := ClientTypeObject(
                NVL(client_rec.client_id, 0),
                NVL(client_rec.email, 'no email'),
                NVL(client_rec.first_name, 'Unknown'),
                NVL(client_rec.last_name, 'Unknown'),
                client_rec.phone,
                client_rec.passport_number,
                NVL(client_rec.loyalty_points, 0),
                client_rec.client_since
            );
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  Ошибка создания клиента ID ' || client_rec.client_id);
        END;
    END LOOP;
    
    v_is_member := K1.EXISTS(v_client_id);
    
    IF v_is_member THEN
        BEGIN
            v_client_name := K1(v_client_id).GetFullName();
        EXCEPTION
            WHEN OTHERS THEN
                v_client_name := 'Имя недоступно';
        END;
        v_result_msg := 'Клиент с ID ' || v_client_id || ' (' || v_client_name || ') является членом коллекции K1';
    ELSE
        v_result_msg := 'Клиент с ID ' || v_client_id || ' НЕ является членом коллекции K1';
    END IF;
    
    DBMS_OUTPUT.PUT_LINE(v_result_msg);
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '--- Список всех членов коллекции K1 ---');
    v_idx := K1.FIRST;
    WHILE v_idx IS NOT NULL
    LOOP
        BEGIN
            v_client_name := K1(v_idx).GetFullName();
        EXCEPTION
            WHEN OTHERS THEN
                v_client_name := 'Имя недоступно (ошибка)';
        END;
        DBMS_OUTPUT.PUT_LINE('  ID ' || v_idx || ': ' || v_client_name);
        v_idx := K1.NEXT(v_idx);
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || 'Всего элементов в K1: ' || K1.COUNT);
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Ошибка: ' || SQLERRM);
END;
/



-- Задание 2c: Поиск пустых коллекций K2
DECLARE
    TYPE ClientCollection IS TABLE OF ClientTypeObject INDEX BY PLS_INTEGER;
    TYPE TourNestedCollection IS TABLE OF TourTypeObject INDEX BY PLS_INTEGER;
    TYPE ClientTourCollection IS TABLE OF TourNestedCollection INDEX BY PLS_INTEGER;
    
    K1 ClientCollection;
    K2 ClientTourCollection;
    
    v_empty_clients VARCHAR2(4000) := '';
    v_clients_with_tours VARCHAR2(4000) := '';
    v_empty_count NUMBER := 0;
    v_with_tours_count NUMBER := 0;
    v_client_name VARCHAR2(200);
    v_idx NUMBER;
    v_tour_count NUMBER;
    v_tour_obj TourTypeObject;
    
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== Задание 2c: Поиск пустых коллекций ===');
    DBMS_OUTPUT.PUT_LINE('(Клиенты без туров - пустые коллекции K2)' || CHR(10));
    
    -- Заполнение K1
    FOR client_rec IN (SELECT * FROM ClientObjectTable)
    LOOP
        BEGIN
            K1(client_rec.client_id) := ClientTypeObject(
                NVL(client_rec.client_id, 0),
                NVL(client_rec.email, 'no email'),
                NVL(client_rec.first_name, 'Unknown'),
                NVL(client_rec.last_name, 'Unknown'),
                client_rec.phone,
                client_rec.passport_number,
                NVL(client_rec.loyalty_points, 0),
                client_rec.client_since
            );
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  Ошибка создания клиента ID ' || client_rec.client_id);
        END;
    END LOOP;
    
    v_idx := K1.FIRST;
    WHILE v_idx IS NOT NULL
    LOOP
        BEGIN
            v_client_name := K1(v_idx).GetFullName();
        EXCEPTION
            WHEN OTHERS THEN
                v_client_name := 'Клиент ID=' || K1(v_idx).client_id;
        END;
        
        v_tour_count := 0;
        
        BEGIN
            FOR booking_rec IN (
                SELECT 
                    t.tour_id,
                    t.title,
                    t.base_price,
                    t.duration_days,
                    t.description,
                    t.tour_type_id,
                    t.country_id,
                    t.hotel_id,
                    t.departure_date,
                    t.available_seats,
                    t.is_active,
                    t.created_at
                FROM BookingObjectTable b
                JOIN TourObjectTable t ON b.tour_id = t.tour_id
                WHERE b.client_id = K1(v_idx).client_id
            )
            LOOP
                v_tour_count := v_tour_count + 1;
                
                v_tour_obj := TourTypeObject(
                    booking_rec.title,
                    booking_rec.base_price,
                    booking_rec.duration_days
                );
                
                v_tour_obj.tour_id := booking_rec.tour_id;
                v_tour_obj.description := booking_rec.description;
                v_tour_obj.tour_type_id := booking_rec.tour_type_id;
                v_tour_obj.country_id := booking_rec.country_id;
                v_tour_obj.hotel_id := booking_rec.hotel_id;
                v_tour_obj.departure_date := booking_rec.departure_date;
                v_tour_obj.available_seats := booking_rec.available_seats;
                v_tour_obj.is_active := booking_rec.is_active;
                v_tour_obj.created_at := booking_rec.created_at;
                
                K2(v_idx)(v_tour_count) := v_tour_obj;
            END LOOP;
            
            IF v_tour_count = 0 THEN
                v_empty_clients := v_empty_clients || '  - ' || v_client_name || CHR(10);
                v_empty_count := v_empty_count + 1;
            ELSE
                v_clients_with_tours := v_clients_with_tours || 
                    '  - ' || v_client_name || ' (туров: ' || v_tour_count || ')' || CHR(10);
                v_with_tours_count := v_with_tours_count + 1;
            END IF;
            
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  Ошибка при обработке клиента: ' || v_client_name);
                DBMS_OUTPUT.PUT_LINE('  ' || SQLERRM);
                v_empty_clients := v_empty_clients || '  - ' || v_client_name || ' (ошибка)' || CHR(10);
                v_empty_count := v_empty_count + 1;
        END;
        
        v_idx := K1.NEXT(v_idx);
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('--- КЛИЕНТЫ БЕЗ ТУРОВ (пустые коллекции K2) ---');
    IF v_empty_clients IS NOT NULL AND LENGTH(TRIM(v_empty_clients)) > 0 THEN
        DBMS_OUTPUT.PUT_LINE(v_empty_clients);
    ELSE
        DBMS_OUTPUT.PUT_LINE('  (нет таких клиентов)');
    END IF;
    DBMS_OUTPUT.PUT_LINE('Всего клиентов без туров: ' || v_empty_count);
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '--- КЛИЕНТЫ С ТУРАМИ ---');
    IF v_clients_with_tours IS NOT NULL AND LENGTH(TRIM(v_clients_with_tours)) > 0 THEN
        DBMS_OUTPUT.PUT_LINE(v_clients_with_tours);
    ELSE
        DBMS_OUTPUT.PUT_LINE('  (нет таких клиентов)');
    END IF;
    DBMS_OUTPUT.PUT_LINE('Всего клиентов с турами: ' || v_with_tours_count);
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || 'Поиск пустых коллекций завершен!');
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Ошибка: ' || SQLERRM);
END;
/




-- Задание 3: Преобразование коллекции к другому виду
DECLARE
    TYPE TourCollection IS TABLE OF TourTypeObject INDEX BY PLS_INTEGER;
    K_Tours TourCollection;
    
    TYPE TourInfoCollection IS TABLE OF VARCHAR2(500) INDEX BY PLS_INTEGER;
    K_TourInfo TourInfoCollection;
    
    TYPE TourNestedTable IS TABLE OF TourTypeObject;
    K_TourNested TourNestedTable := TourNestedTable();
    
    TYPE TourVarray IS VARRAY(100) OF VARCHAR2(300);
    K_TourVarray TourVarray := TourVarray();
    
    v_counter NUMBER := 0;
    v_idx NUMBER;
    v_tour_obj TourTypeObject;
    
    TYPE TempRecType IS RECORD (
        tour_id NUMBER,
        tour_title NVARCHAR2(255),
        tour_price NUMBER
    );
    TYPE TempTableType IS TABLE OF TempRecType;
    v_temp_data TempTableType := TempTableType();
    
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== Задание 3: Преобразование коллекций ===');
    
    FOR tour_rec IN (SELECT * FROM TourObjectTable WHERE ROWNUM <= 20)
    LOOP
        v_tour_obj := TourTypeObject(
            tour_rec.title,
            tour_rec.base_price,
            tour_rec.duration_days
        );
        
        v_tour_obj.tour_id := tour_rec.tour_id;
        v_tour_obj.description := tour_rec.description;
        v_tour_obj.tour_type_id := tour_rec.tour_type_id;
        v_tour_obj.country_id := tour_rec.country_id;
        v_tour_obj.hotel_id := tour_rec.hotel_id;
        v_tour_obj.departure_date := tour_rec.departure_date;
        v_tour_obj.available_seats := tour_rec.available_seats;
        v_tour_obj.is_active := tour_rec.is_active;
        v_tour_obj.created_at := tour_rec.created_at;
        
        K_Tours(tour_rec.tour_id) := v_tour_obj;
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('Загружено туров в K_Tours: ' || K_Tours.COUNT);
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '--- 3.1. Преобразование к коллекции VARCHAR2 ---');
    v_idx := K_Tours.FIRST;
    WHILE v_idx IS NOT NULL
    LOOP
        BEGIN
            K_TourInfo(v_idx) := v_idx || ' | ' || 
                                 K_Tours(v_idx).title || ' | ' ||
                                 TO_CHAR(K_Tours(v_idx).base_price, '99999.00');
            DBMS_OUTPUT.PUT_LINE('  ' || K_TourInfo(v_idx));
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  Ошибка получения информации для тура ID ' || v_idx);
        END;
        v_idx := K_Tours.NEXT(v_idx);
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '--- 3.2. Преобразование к NESTED TABLE ---');
    v_idx := K_Tours.FIRST;
    WHILE v_idx IS NOT NULL
    LOOP
        K_TourNested.EXTEND;
        K_TourNested(K_TourNested.COUNT) := K_Tours(v_idx);
        v_idx := K_Tours.NEXT(v_idx);
    END LOOP;
    DBMS_OUTPUT.PUT_LINE('  NESTED TABLE содержит ' || K_TourNested.COUNT || ' элементов');
    
    FOR i IN 1 .. K_TourNested.COUNT LOOP
        BEGIN
            DBMS_OUTPUT.PUT_LINE(' ' || i || ' | ' || 
                                 K_TourNested(i).title || ' | ' ||
                                 TO_CHAR(K_TourNested(i).base_price, '99999.00') || ' руб.');
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE(' ' || i || ': ошибка получения данных');
        END;
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '--- 3.3. Преобразование к VARRAY ---');
    v_idx := K_Tours.FIRST;
    WHILE v_idx IS NOT NULL
    LOOP
        IF K_TourVarray.COUNT < 100 THEN
            K_TourVarray.EXTEND;
            BEGIN
                K_TourVarray(K_TourVarray.COUNT) := K_Tours(v_idx).GetTourInfo();
            EXCEPTION
                WHEN OTHERS THEN
                    K_TourVarray(K_TourVarray.COUNT) := 'Тур ID ' || v_idx || ' (ошибка)';
            END;
        END IF;
        v_idx := K_Tours.NEXT(v_idx);
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('  VARRAY содержит ' || K_TourVarray.COUNT || ' элементов');
    FOR i IN 1 .. LEAST(K_TourVarray.COUNT, 5)
    LOOP
        DBMS_OUTPUT.PUT_LINE('  ' || i || ': ' || SUBSTR(K_TourVarray(i), 1, 100));
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '--- 3.4. Преобразование к реляционным данным ---');
    
    v_idx := K_Tours.FIRST;
    WHILE v_idx IS NOT NULL
    LOOP
        v_temp_data.EXTEND;
        v_temp_data(v_temp_data.COUNT).tour_id := K_Tours(v_idx).tour_id;
        v_temp_data(v_temp_data.COUNT).tour_title := K_Tours(v_idx).title;
        v_temp_data(v_temp_data.COUNT).tour_price := K_Tours(v_idx).base_price;
        v_idx := K_Tours.NEXT(v_idx);
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('  Подготовлено данных для вставки: ' || v_temp_data.COUNT);
    
    DECLARE
        v_sql CLOB;
        v_row_count NUMBER;
    BEGIN
        BEGIN
            EXECUTE IMMEDIATE 'DROP TABLE TempTourInfo PURGE';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        
        EXECUTE IMMEDIATE '
            CREATE TABLE TempTourInfo (
                tour_id NUMBER,
                tour_title NVARCHAR2(255),
                tour_price NUMBER
            )';
        
        FOR i IN 1 .. v_temp_data.COUNT
        LOOP
            v_sql := 'INSERT INTO TempTourInfo (tour_id, tour_title, tour_price) VALUES (' ||
                     v_temp_data(i).tour_id || ', ''' || 
                     REPLACE(v_temp_data(i).tour_title, '''', '''''') || ''', ' ||
                     NVL(TO_CHAR(v_temp_data(i).tour_price), 'NULL') || ')';
            EXECUTE IMMEDIATE v_sql;
        END LOOP;
        
        COMMIT;
        
        EXECUTE IMMEDIATE 'SELECT COUNT(*) FROM TempTourInfo' INTO v_row_count;
        DBMS_OUTPUT.PUT_LINE('  Вставлено записей в TempTourInfo: ' || v_row_count);
        
        DBMS_OUTPUT.PUT_LINE(CHR(10) || '  Примеры вставленных данных:');
        DECLARE
            v_cursor SYS_REFCURSOR;
            v_tid NUMBER;
            v_title NVARCHAR2(255);
            v_price NUMBER;
        BEGIN
            OPEN v_cursor FOR 'SELECT tour_id, tour_title, tour_price FROM TempTourInfo WHERE ROWNUM <= 5';
            LOOP
                FETCH v_cursor INTO v_tid, v_title, v_price;
                EXIT WHEN v_cursor%NOTFOUND;
                DBMS_OUTPUT.PUT_LINE('    ID ' || v_tid || ': ' || v_title || ' - ' || NVL(TO_CHAR(v_price), 'NULL') || ' руб.');
            END LOOP;
            CLOSE v_cursor;
        END;
        
        EXECUTE IMMEDIATE 'DROP TABLE TempTourInfo PURGE';
        
    END;
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || 'Преобразование коллекций успешно завершено!');
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Ошибка: ' || SQLERRM);
        BEGIN
            EXECUTE IMMEDIATE 'DROP TABLE TempTourInfo PURGE';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        ROLLBACK;
END;
/



---- 4. BlUK-операции
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE BulkTourTable PURGE';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/



CREATE TABLE BulkTourTable (
    tour_id NUMBER PRIMARY KEY,
    title NVARCHAR2(255),
    base_price NUMBER(10,2),
    duration_days NUMBER,
    is_active NUMBER
);

DECLARE
    TYPE TourIdCollection IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
    TYPE TourTitleCollection IS TABLE OF NVARCHAR2(255) INDEX BY PLS_INTEGER;
    TYPE TourPriceCollection IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
    TYPE TourDurationCollection IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
    
    v_tour_ids TourIdCollection;
    v_tour_titles TourTitleCollection;
    v_tour_prices TourPriceCollection;
    v_tour_durations TourDurationCollection;
    
    TYPE TourObjectCollection IS TABLE OF TourTypeObject INDEX BY PLS_INTEGER;
    v_tours TourObjectCollection;
    
    v_start_time NUMBER;
    v_end_time NUMBER;
    v_tour_obj TourTypeObject;
    
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== Задание 4: BULK операции ===');
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '--- 4.1. BULK COLLECT (массовое извлечение) ---');
    
    v_start_time := DBMS_UTILITY.GET_TIME;
    
    SELECT tour_id, title, base_price, duration_days
    BULK COLLECT INTO v_tour_ids, v_tour_titles, v_tour_prices, v_tour_durations
    FROM TourObjectTable
    WHERE is_active = 1;
    
    v_end_time := DBMS_UTILITY.GET_TIME;
    
    DBMS_OUTPUT.PUT_LINE('  Извлечено туров: ' || v_tour_ids.COUNT);
    DBMS_OUTPUT.PUT_LINE('  Время выполнения: ' || (v_end_time - v_start_time) || ' сотых секунды');
    
    DBMS_OUTPUT.PUT_LINE('  Примеры извлеченных данных:');
    FOR i IN 1 .. LEAST(v_tour_ids.COUNT, 5)
    LOOP
        DBMS_OUTPUT.PUT_LINE('    ' || v_tour_ids(i) || '. ' || 
                             SUBSTR(v_tour_titles(i), 1, 40) || '... - ' ||
                             v_tour_prices(i) || ' руб.');
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '--- 4.2. BULK COLLECT в объектную коллекцию ---');
    
    DECLARE
        CURSOR tour_cursor IS
            SELECT tour_id, title, description, tour_type_id, country_id, hotel_id,
                   duration_days, departure_date, base_price, available_seats, is_active, created_at
            FROM TourObjectTable
            WHERE ROWNUM <= 10;
            
        TYPE TempTourCollection IS TABLE OF tour_cursor%ROWTYPE;
        v_temp_tours TempTourCollection;
    BEGIN
        OPEN tour_cursor;
        FETCH tour_cursor BULK COLLECT INTO v_temp_tours;
        CLOSE tour_cursor;
        
        FOR i IN 1 .. v_temp_tours.COUNT
        LOOP
            v_tour_obj := TourTypeObject(
                v_temp_tours(i).title,
                v_temp_tours(i).base_price,
                v_temp_tours(i).duration_days
            );
            
            v_tour_obj.tour_id := v_temp_tours(i).tour_id;
            v_tour_obj.description := v_temp_tours(i).description;
            v_tour_obj.tour_type_id := v_temp_tours(i).tour_type_id;
            v_tour_obj.country_id := v_temp_tours(i).country_id;
            v_tour_obj.hotel_id := v_temp_tours(i).hotel_id;
            v_tour_obj.departure_date := v_temp_tours(i).departure_date;
            v_tour_obj.available_seats := v_temp_tours(i).available_seats;
            v_tour_obj.is_active := v_temp_tours(i).is_active;
            v_tour_obj.created_at := v_temp_tours(i).created_at;
            
            v_tours(i) := v_tour_obj;
        END LOOP;
        
        DBMS_OUTPUT.PUT_LINE('  Создано объектных элементов: ' || v_tours.COUNT);
        
        FOR i IN 1 .. LEAST(v_tours.COUNT, 5)
        LOOP
            BEGIN
                DBMS_OUTPUT.PUT_LINE('    ' || v_tours(i).GetTourInfo());
            EXCEPTION
                WHEN OTHERS THEN
                    DBMS_OUTPUT.PUT_LINE('    Тур ID ' || v_tours(i).tour_id || ' (ошибка вывода)');
            END;
        END LOOP;
    END;
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '--- 4.3. FORALL (массовая вставка) ---');
    EXECUTE IMMEDIATE 'TRUNCATE TABLE BulkTourTable';
    v_start_time := DBMS_UTILITY.GET_TIME;
    
    FORALL i IN 1 .. v_tour_ids.COUNT
        INSERT INTO BulkTourTable (tour_id, title, base_price, duration_days, is_active)
        VALUES (v_tour_ids(i), v_tour_titles(i), v_tour_prices(i), v_tour_durations(i), 1);
    
    v_end_time := DBMS_UTILITY.GET_TIME;
    
    DBMS_OUTPUT.PUT_LINE('  Вставлено записей: ' || SQL%ROWCOUNT);
    DBMS_OUTPUT.PUT_LINE('  Время выполнения: ' || (v_end_time - v_start_time) || ' сотых секунды');
    
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '--- 4.4. BULK COLLECT с LIMIT (постранично) ---');
    
    DECLARE
        CURSOR tour_cursor IS
            SELECT tour_id, title, base_price
            FROM TourObjectTable
            WHERE is_active = 1;
        
        TYPE LimitCollection IS TABLE OF tour_cursor%ROWTYPE;
        v_batch LimitCollection;
        
        v_batch_size NUMBER := 5;
        v_total NUMBER := 0;
    BEGIN
        OPEN tour_cursor;
        LOOP
            FETCH tour_cursor BULK COLLECT INTO v_batch LIMIT v_batch_size;
            EXIT WHEN v_batch.COUNT = 0;
            
            v_total := v_total + v_batch.COUNT;
            DBMS_OUTPUT.PUT_LINE('  Обработана партия: ' || v_batch.COUNT || ' записей');
            
            FOR i IN 1 .. v_batch.COUNT
            LOOP
                DBMS_OUTPUT.PUT_LINE('    - ' || v_batch(i).title);
                NULL;
            END LOOP;
        END LOOP;
        CLOSE tour_cursor;
        
        DBMS_OUTPUT.PUT_LINE('  Всего обработано записей: ' || v_total);
    END;
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || 'BULK операции успешно выполнены!');
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Ошибка: ' || SQLERRM);
        ROLLBACK;
END;
/


-- 4.3. Проверка результатов BULK операций
SELECT COUNT(*) AS "Количество записей в BulkTourTable" FROM BulkTourTable;

SELECT * FROM BulkTourTable WHERE ROWNUM <= 10;


DROP TABLE BulkTourTable PURGE;




















-- Задание 2c: Поиск пустых коллекций K1
DECLARE
    TYPE ClientCollection IS TABLE OF ClientTypeObject INDEX BY PLS_INTEGER;
    K1 ClientCollection;
    
    v_is_empty BOOLEAN;
    v_client_count NUMBER;
    
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== Задание 2c: Поиск пустых коллекций K1 ===');
    
    -- Заполнение K1 (как и раньше)
    FOR client_rec IN (SELECT * FROM ClientObjectTable)
    LOOP
        BEGIN
            K1(client_rec.client_id) := ClientTypeObject(
                NVL(client_rec.client_id, 0),
                NVL(client_rec.email, 'no email'),
                NVL(client_rec.first_name, 'Unknown'),
                NVL(client_rec.last_name, 'Unknown'),
                client_rec.phone,
                client_rec.passport_number,
                NVL(client_rec.loyalty_points, 0),
                client_rec.client_since
            );
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('  Ошибка создания клиента ID ' || client_rec.client_id);
        END;
    END LOOP;
    
    -- Проверка, пуста ли коллекция K1
    v_client_count := K1.COUNT;
    
    IF v_client_count = 0 THEN
        DBMS_OUTPUT.PUT_LINE('РЕЗУЛЬТАТ: Коллекция K1 ПУСТАЯ');
        DBMS_OUTPUT.PUT_LINE('  В коллекции нет ни одного клиента');
    ELSE
        DBMS_OUTPUT.PUT_LINE('РЕЗУЛЬТАТ: Коллекция K1 НЕ ПУСТАЯ');
        DBMS_OUTPUT.PUT_LINE('  В коллекции содержится ' || v_client_count || ' клиент(ов)');
        
        -- Выводим список клиентов для наглядности
        DBMS_OUTPUT.PUT_LINE(CHR(10) || '--- Содержимое K1 ---');
        DECLARE
            v_idx NUMBER := K1.FIRST;
            v_name VARCHAR2(200);
        BEGIN
            WHILE v_idx IS NOT NULL LOOP
                BEGIN
                    v_name := K1(v_idx).GetFullName();
                EXCEPTION
                    WHEN OTHERS THEN
                        v_name := 'Имя недоступно';
                END;
                DBMS_OUTPUT.PUT_LINE('  ID ' || v_idx || ': ' || v_name);
                v_idx := K1.NEXT(v_idx);
            END LOOP;
        END;
    END IF;
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || 'Поиск пустых коллекций завершен!');
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Ошибка: ' || SQLERRM);
END;
/








