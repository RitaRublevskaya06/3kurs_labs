----№10
CREATE TABLE TEST_TABLE
(
  x NUMBER(3),
  s VARCHAR2(50)
);

INSERT ALL INTO TEST_TABLE VALUES (1, 'a')
INTO TEST_TABLE VALUES (2, 'b')
INTO TEST_TABLE VALUES (3, 'c')
INTO TEST_TABLE VALUES (4, 'd')
INTO TEST_TABLE VALUES (5, 'e')
SELECT * FROM DUAL;


SELECT * FROM TEST_TABLE;

CREATE VIEW TEST_VIEW AS
SELECT * FROM TEST_TABLE WHERE x > 2 ORDER BY x DESC;

SELECT * FROM TEST_VIEW;

----№11

CREATE TABLE RMV_T1
(
    xx NUMBER(2),
    ss VARCHAR2(50)
) TABLESPACE RMV_QDATA;

INSERT ALL INTO RMV_T1 VALUES (11, 'aa')
INTO RMV_T1 VALUES (22, 'bb')
INTO RMV_T1 VALUES (33, 'cc')
SELECT * FROM DUAL;

SELECT * FROM RMV_T1;


----ПРОВЕРКА
SELECT table_name, tablespace_name FROM user_tables;

SELECT view_name FROM user_views;

SELECT * FROM TEST_TABLE;
SELECT * FROM RMV_T1;
SELECT * FROM TEST_VIEW;




---- УДАЛЕНИЕ ТАБЛИЦ И ПРЕДСТАВЛЕНИЙ RMVCORE

-- Удаляем представление
DROP VIEW TEST_VIEW;

-- Удаляем таблицы
DROP TABLE TEST_TABLE;
DROP TABLE RMV_T1;

-- Проверяем что удалилось
SELECT table_name FROM user_tables;
SELECT view_name FROM user_views;

