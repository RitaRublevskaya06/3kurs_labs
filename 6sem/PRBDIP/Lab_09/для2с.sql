


--2а
DECLARE
    TYPE ClientCollection IS TABLE OF ClientTypeObject INDEX BY PLS_INTEGER;
    K1 ClientCollection;
    v_idx NUMBER;
    v_count NUMBER;
BEGIN
    FOR c IN (SELECT * FROM ClientObjectTable)
    LOOP
        K1(c.client_id) := ClientTypeObject(
            c.client_id, c.email, c.first_name, c.last_name,
            c.phone, c.passport_number, c.loyalty_points, c.client_since
        );
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('=== K1 (Клиенты) ===');
    v_idx := K1.FIRST;
    WHILE v_idx IS NOT NULL
    LOOP
        DBMS_OUTPUT.PUT_LINE('K1(' || v_idx || ') = ' || K1(v_idx).GetFullName());
        v_idx := K1.NEXT(v_idx);
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE(CHR(10) || '=== K2 (Туры клиентов) ===');
    v_idx := K1.FIRST;
    WHILE v_idx IS NOT NULL
    LOOP
        SELECT COUNT(*) INTO v_count 
        FROM BookingObjectTable 
        WHERE client_id = v_idx;
        DBMS_OUTPUT.PUT_LINE('K2(' || v_idx || ') = ' || v_count || ' туров');
        v_idx := K1.NEXT(v_idx);
    END LOOP;
END;
/




-- 2с 
INSERT INTO "User" (id, email, password_hash, first_name, last_name, phone, registration_date, last_login, role)
VALUES (
    seq_user.NEXTVAL,
    'new.client@example.com',
    'hash_new123',
    'Сергей',
    'Безтуров',
    '+375291234567',
    SYSDATE,
    SYSDATE,
    'client'
);

INSERT INTO Client (user_id, passport_number, passport_issue_date, passport_expiry_date, date_of_birth, loyalty_points, client_since)
VALUES (
    (SELECT id FROM "User" WHERE email = 'new.client@example.com'),
    'MP9999999',
    DATE '2020-01-01',
    DATE '2030-01-01',
    DATE '1990-01-01',
    0,
    SYSDATE
);

INSERT INTO ClientObjectTable
SELECT ClientTypeObject(
    c.user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    c.passport_number,
    c.loyalty_points,
    c.client_since
)
FROM Client c
JOIN "User" u ON c.user_id = u.id
WHERE u.email = 'new.client@example.com';

COMMIT;

SELECT client_id, first_name, last_name 
FROM ClientObjectTable 
WHERE first_name = 'Сергей' AND last_name = 'Безтуров';



-- Выполняется от имени SYS или SYSTEM
GRANT CREATE TABLESPACE TO RMV;
-- Или дать более широкие права
GRANT DBA TO RMV;

-- 1. Привилегии для создания табличного пространства (опционально)
GRANT CREATE TABLESPACE TO RMV;
GRANT UNLIMITED TABLESPACE TO RMV;

-- 2. Привилегии для создания директории (ВАЖНО!)
GRANT CREATE ANY DIRECTORY TO RMV;
GRANT DROP ANY DIRECTORY TO RMV;

-- 3. Привилегии для создания пользователей
GRANT CREATE USER TO RMV;
GRANT ALTER USER TO RMV;
GRANT DROP USER TO RMV;

-- 4. Привилегии для создания таблиц
GRANT CREATE TABLE TO RMV;
GRANT ALTER ANY TABLE TO RMV;
GRANT DROP ANY TABLE TO RMV;

-- 5. Привилегии для работы с LOB
GRANT EXECUTE ON DBMS_LOB TO RMV;

-- 6. Привилегии для создания процедур и функций
GRANT CREATE PROCEDURE TO RMV;
GRANT CREATE SEQUENCE TO RMV;

-- 7. Привилегии для работы с данными (DML)
GRANT INSERT ANY TABLE TO RMV;
GRANT UPDATE ANY TABLE TO RMV;
GRANT DELETE ANY TABLE TO RMV;
GRANT SELECT ANY TABLE TO RMV;

-- 8. Привилегии для создания сессии
GRANT CREATE SESSION TO RMV;
GRANT CONNECT TO RMV;
GRANT RESOURCE TO RMV;

-- 9. Привилегии для работы с директорией (чтение/запись)
GRANT READ ON DIRECTORY TRAVEL_DOCS_DIR TO RMV;
GRANT WRITE ON DIRECTORY TRAVEL_DOCS_DIR TO RMV;



-- =====================================================
-- ВЫПОЛНЯТЬ ОТ ИМЕНИ SYS ИЛИ SYSTEM
-- =====================================================

-- 1. Для создания пользователя (ваша текущая ошибка)
GRANT CREATE USER TO RMV;
GRANT ALTER USER TO RMV;
GRANT DROP USER TO RMV;

-- 2. Для создания табличного пространства
GRANT CREATE TABLESPACE TO RMV;
GRANT ALTER TABLESPACE TO RMV;
GRANT DROP TABLESPACE TO RMV;
GRANT UNLIMITED TABLESPACE TO RMV;

-- 3. Для создания директории
GRANT CREATE ANY DIRECTORY TO RMV;
GRANT DROP ANY DIRECTORY TO RMV;

-- 4. Для создания таблиц и работы с данными
GRANT CREATE TABLE TO RMV;
GRANT CREATE SEQUENCE TO RMV;
GRANT CREATE PROCEDURE TO RMV;
GRANT CREATE TRIGGER TO RMV;
GRANT CREATE VIEW TO RMV;

-- 5. Базовые права для работы с БД
GRANT CREATE SESSION TO RMV;
GRANT CONNECT TO RMV;
GRANT RESOURCE TO RMV;

-- 6. Права на работу с любыми таблицами (для упрощения)
GRANT SELECT ANY TABLE TO RMV;
GRANT INSERT ANY TABLE TO RMV;
GRANT UPDATE ANY TABLE TO RMV;
GRANT DELETE ANY TABLE TO RMV;
GRANT ALTER ANY TABLE TO RMV;
GRANT DROP ANY TABLE TO RMV;

-- 7. Для работы с LOB
GRANT EXECUTE ON DBMS_LOB TO RMV;

-- 8. Права на работу с директориями
GRANT READ ON DIRECTORY TRAVEL_DOCS_DIR TO RMV;
GRANT WRITE ON DIRECTORY TRAVEL_DOCS_DIR TO RMV;



-- =====================================================
-- ВЫПОЛНИТЬ ОТ ИМЕНИ SYS ИЛИ SYSTEM
-- =====================================================

-- 1. Для создания пользователя lob_user (самое важное!)
GRANT CREATE USER TO RMV;
GRANT ALTER USER TO RMV;

-- 2. Для работы с DBMS_LOB
GRANT EXECUTE ON DBMS_LOB TO RMV;

-- 3. Для создания таблиц и последовательностей
GRANT CREATE TABLE TO RMV;
GRANT CREATE SEQUENCE TO RMV;

-- 4. Базовые права (обычно уже есть)
GRANT CREATE SESSION TO RMV;
GRANT UNLIMITED TABLESPACE TO RMV;

-- Выполнить от имени SYS или SYSTEM
GRANT DBA TO RMV;
-- Даем неограниченную квоту на табличное пространство USERS
ALTER USER lob_user QUOTA UNLIMITED ON USERS;

-- Или если нужно на конкретное пространство
ALTER USER lob_user QUOTA 100M ON USERS;

