-- как RMV_SYS
GRANT SELECT ON v_$parameter TO RMV;
GRANT SELECT ON v_$reserved_words TO RMV;

-- как RMV_USER
SET SERVEROUTPUT ON;


-- Задание 1
BEGIN
    NULL;
END;
/

-- Задание 2
BEGIN
    DBMS_OUTPUT.PUT_LINE('Hello World!');
END;
/

-- Задание 3
DECLARE
    x NUMBER(3) := 3;
    y NUMBER(3) := 0;
    z NUMBER(10, 2);
BEGIN
    z := x / y;
    DBMS_OUTPUT.PUT_LINE('z = ' || z);
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLCODE || ': ' || SQLERRM);
END;
/

-- Задание 4
DECLARE
    x NUMBER(3) := 3;
    y NUMBER(3) := 0;
    z NUMBER(10, 2);
BEGIN
    DBMS_OUTPUT.PUT_LINE('x = ' || x || ', y = ' || y);
    BEGIN
        z := x / y;
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('Внутренний блок: ошибка = ' || SQLERRM);
            z := 0;
    END;
    DBMS_OUTPUT.PUT_LINE('z = ' || z);
END;
/


-- Задание 5
SELECT name, value 
FROM v$parameter 
WHERE name = 'plsql_warnings';



-- Задание 6
SELECT keyword
FROM v$reserved_words
WHERE length = 1
ORDER BY keyword;


-- Задание 7
SELECT keyword
FROM v$reserved_words
WHERE length > 1
ORDER BY keyword;


-- Задание 8
SELECT name, value
FROM v$parameter
WHERE name LIKE 'plsql%'
ORDER BY name;


-- Задание 9 (10-17)
DECLARE
    t10     NUMBER(3)      := 50;
    t11     NUMBER(3)      := 15;
    -- 11
    sum_var NUMBER(10, 2);
    dwr     NUMBER(10, 2);
    t12     NUMBER(10, 2)  := 2.11;
    t13     NUMBER(10, -3) := 222999.45;
    t14     BINARY_FLOAT   := 123456789.123456789;
    t15     BINARY_DOUBLE  := 123456789.123456789;
    t16     NUMBER(38, 10) := 12345E+10;
    t17     BOOLEAN        := TRUE;
BEGIN
    sum_var := t10 + t11;
    dwr := MOD(t10, t11);

    DBMS_OUTPUT.PUT_LINE('10. Целое число t10 = ' || t10);
    DBMS_OUTPUT.PUT_LINE('10. Целое число t11 = ' || t11);
    DBMS_OUTPUT.PUT_LINE('11. Остаток от деления = ' || dwr);
    DBMS_OUTPUT.PUT_LINE('11. Сумма = ' || sum_var);
    DBMS_OUTPUT.PUT_LINE('12. Число с фиксированной точкой = ' || t12);
    DBMS_OUTPUT.PUT_LINE('13. Округление (масштаб -3) = ' || t13);
    DBMS_OUTPUT.PUT_LINE('14. BINARY_FLOAT = ' || t14);
    DBMS_OUTPUT.PUT_LINE('15. BINARY_DOUBLE = ' || t15);
    DBMS_OUTPUT.PUT_LINE('16. Число с E+10 = ' || t16);
    
    IF t17 THEN
        DBMS_OUTPUT.PUT_LINE('17. BOOLEAN = true');
    ELSE
        DBMS_OUTPUT.PUT_LINE('17. BOOLEAN = false');
    END IF;
END;
/



-- Задание 18
DECLARE
    nm CONSTANT NUMBER       := 24;
    vc CONSTANT VARCHAR2(10) := 'Varchar2';
    ch CONSTANT CHAR(5)      := 'Char';
BEGIN
    DBMS_OUTPUT.PUT_LINE('Числовая константа: ' || nm);
    DBMS_OUTPUT.PUT_LINE('Строковая константа: ' || vc);
    DBMS_OUTPUT.PUT_LINE('Символьная константа: ' || ch);
    
    DBMS_OUTPUT.PUT_LINE('nm * 2 = ' || (nm * 2));
    DBMS_OUTPUT.PUT_LINE('vc || '' test'' = ' || vc || ' test');
    DBMS_OUTPUT.PUT_LINE('ch || ''***'' = ' || ch || '***');
END;
/


-- Задание 19
DECLARE
    pulp PULPIT.PULPIT%TYPE;
BEGIN
    pulp := 'ПИ';
    DBMS_OUTPUT.PUT_LINE('Pulpit code: ' || pulp);
    
    SELECT PULPIT INTO pulp FROM PULPIT WHERE ROWNUM = 1;
    DBMS_OUTPUT.PUT_LINE('Pulpit from table: ' || pulp);
END;
/


-- Задание 20
DECLARE
    faculty_res FACULTY%ROWTYPE;
BEGIN
    faculty_res.FACULTY := 'ИТ';
    faculty_res.FACULTY_NAME := 'Факультет информационных технологий';
    DBMS_OUTPUT.PUT_LINE('Created: ' || faculty_res.FACULTY || ' - ' || faculty_res.FACULTY_NAME);
    
    SELECT * INTO faculty_res FROM FACULTY WHERE FACULTY = 'ИДиП';
    DBMS_OUTPUT.PUT_LINE('From table: ' || faculty_res.FACULTY || ' - ' || faculty_res.FACULTY_NAME);
END;
/


-- Задание 21 (22)
DECLARE
    x NUMBER := 7;
BEGIN
    IF x < 10 THEN
        DBMS_OUTPUT.PUT_LINE('x < 10');
    ELSIF x > 10 THEN
        DBMS_OUTPUT.PUT_LINE('x > 10');
    ELSE
        DBMS_OUTPUT.PUT_LINE('x = 10');
    END IF;
END;
/


-- Задание 23
DECLARE
    x NUMBER := 22;
BEGIN
    CASE
        WHEN x BETWEEN 10 AND 20 THEN 
            DBMS_OUTPUT.PUT_LINE('10 <= x <= 20');
        WHEN x BETWEEN 21 AND 40 THEN 
            DBMS_OUTPUT.PUT_LINE('21 <= x <= 40');
        ELSE 
            DBMS_OUTPUT.PUT_LINE('else block');
    END CASE;
END;
/


-- Задание 24
DECLARE
    x NUMBER := 0;
BEGIN
    DBMS_OUTPUT.PUT_LINE('LOOP: ');
    LOOP
        x := x + 2;
        DBMS_OUTPUT.PUT_LINE(x);
        EXIT WHEN x >= 10;
    END LOOP;
END;
/


-- Задание 25
DECLARE
    x NUMBER := 5;
BEGIN
    DBMS_OUTPUT.PUT_LINE('WHILE: ');
    WHILE (x > 0) LOOP
        DBMS_OUTPUT.PUT_LINE(x);
        x := x - 1;
    END LOOP;
END;
/


-- Задание 26
BEGIN
    DBMS_OUTPUT.PUT_LINE('FOR: ');
    FOR k IN 1..5 LOOP
        DBMS_OUTPUT.PUT_LINE(k);
    END LOOP;
END;
/

