-- 1. Создание отдельного табличного пространства для хранения LOB
CREATE TABLESPACE travel_lob_ts
    DATAFILE 'D:\travel_lob.dbf' SIZE 100M
    AUTOEXTEND ON NEXT 10M;

-- 2. Создание папки для хранения внешних документов (диск D)
CREATE OR REPLACE DIRECTORY TRAVEL_DOCS_DIR AS 'D:\TRAVEL_DOCS';
CREATE OR REPLACE DIRECTORY TRAVEL_DOCS_DIR AS '/tmp/travel_docs';


-- 3. Создание пользователя lob_user
CREATE USER lob_user IDENTIFIED BY lob123;

GRANT CONNECT, RESOURCE, CREATE SESSION TO lob_user;
GRANT CREATE TABLE TO lob_user;
GRANT CREATE SEQUENCE TO lob_user;
GRANT EXECUTE ON DBMS_LOB TO lob_user;
GRANT READ, WRITE ON DIRECTORY TRAVEL_DOCS_DIR TO lob_user;


-- 4. Квота на табличное пространство
ALTER USER lob_user QUOTA UNLIMITED ON travel_lob_ts;
ALTER USER lob_user DEFAULT TABLESPACE travel_lob_ts;

-- 5. Создаем таблицу
CREATE TABLE LOB_USER.TOUR_LOB
(
    ID   NUMBER PRIMARY KEY,
    TOUR_NAME VARCHAR2(200),
    FOTO BLOB DEFAULT EMPTY_BLOB(),
    DOC  BFILE
);

-- 6. Добавляем (INSERT) фотографии и документы
INSERT INTO LOB_USER.TOUR_LOB (id, tour_name, foto, doc)
VALUES (1, 'Тур в Турцию', EMPTY_BLOB(), BFILENAME('TRAVEL_DOCS_DIR', 'turkey_tour.docx'));

INSERT INTO LOB_USER.TOUR_LOB (id, tour_name, foto, doc)
VALUES (2, 'Тур в Египет', EMPTY_BLOB(), BFILENAME('TRAVEL_DOCS_DIR', 'egypt_tour.pdf'));

INSERT INTO LOB_USER.TOUR_LOB (id, tour_name, foto, doc)
VALUES (3, 'Тур в Италию', EMPTY_BLOB(), BFILENAME('TRAVEL_DOCS_DIR', 'italy_tour.docx'));

COMMIT;

-- Проверяем вставку
SELECT * FROM LOB_USER.TOUR_LOB;

-- 7. Загрузка фото
SELECT table_name, owner FROM all_tables WHERE table_name = 'TOUR_LOB';

DECLARE
    v_bfile BFILE;
    v_blob BLOB;
    v_dest_offset INTEGER := 1;
    v_src_offset INTEGER := 1;
    v_length NUMBER;
BEGIN
    v_bfile := BFILENAME('TRAVEL_DOCS_DIR', 'turkey_photo.jpg');
    IF DBMS_LOB.FILEEXISTS(v_bfile) = 1 THEN
        SELECT foto INTO v_blob FROM LOB_USER.TOUR_LOB WHERE id = 1 FOR UPDATE;
        v_length := DBMS_LOB.GETLENGTH(v_bfile);
        DBMS_LOB.FILEOPEN(v_bfile, DBMS_LOB.FILE_READONLY);
        DBMS_LOB.LOADFROMFILE(v_blob, v_bfile, v_length, v_dest_offset, v_src_offset);
        DBMS_LOB.FILECLOSE(v_bfile);
        UPDATE LOB_USER.TOUR_LOB SET foto = v_blob WHERE id = 1;
        DBMS_OUTPUT.PUT_LINE('Фото Турции загружено! Размер: ' || v_length || ' байт');
    END IF;
    
    v_bfile := BFILENAME('TRAVEL_DOCS_DIR', 'egypt_photo.jpg');
    IF DBMS_LOB.FILEEXISTS(v_bfile) = 1 THEN
        SELECT foto INTO v_blob FROM LOB_USER.TOUR_LOB WHERE id = 2 FOR UPDATE;
        v_length := DBMS_LOB.GETLENGTH(v_bfile);
        DBMS_LOB.FILEOPEN(v_bfile, DBMS_LOB.FILE_READONLY);
        DBMS_LOB.LOADFROMFILE(v_blob, v_bfile, v_length, v_dest_offset, v_src_offset);
        DBMS_LOB.FILECLOSE(v_bfile);
        UPDATE LOB_USER.TOUR_LOB SET foto = v_blob WHERE id = 2;
        DBMS_OUTPUT.PUT_LINE('Фото Египта загружено! Размер: ' || v_length || ' байт');
    END IF;
    
    v_bfile := BFILENAME('TRAVEL_DOCS_DIR', 'italy_photo.jpg');
    IF DBMS_LOB.FILEEXISTS(v_bfile) = 1 THEN
        SELECT foto INTO v_blob FROM LOB_USER.TOUR_LOB WHERE id = 3 FOR UPDATE;
        v_length := DBMS_LOB.GETLENGTH(v_bfile);
        DBMS_LOB.FILEOPEN(v_bfile, DBMS_LOB.FILE_READONLY);
        DBMS_LOB.LOADFROMFILE(v_blob, v_bfile, v_length, v_dest_offset, v_src_offset);
        DBMS_LOB.FILECLOSE(v_bfile);
        UPDATE LOB_USER.TOUR_LOB SET foto = v_blob WHERE id = 3;
        DBMS_OUTPUT.PUT_LINE('Фото Италии загружено! Размер: ' || v_length || ' байт');
    END IF;
    
    COMMIT;
END;
/


-- 8. Проверка результатов
SET SERVEROUTPUT ON;

SELECT 
    id, 
    tour_name,
    CASE 
        WHEN foto IS NOT NULL AND DBMS_LOB.GETLENGTH(foto) > 0 
            THEN 'Фото загружено (' || DBMS_LOB.GETLENGTH(foto) || ' байт)'
        ELSE 'Фото отсутствует'
    END AS статус_фото,
    doc AS ссылка_на_документ
FROM LOB_USER.TOUR_LOB;

SELECT foto FROM LOB_USER.TOUR_LOB WHERE id = 1;
SELECT foto FROM LOB_USER.TOUR_LOB WHERE id = 2;
SELECT foto FROM LOB_USER.TOUR_LOB WHERE id = 3;