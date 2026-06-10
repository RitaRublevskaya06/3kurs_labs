-- 1. Создание отдельного табличного пространства для хранения LOB
CREATE TABLESPACE travel_lob_ts
    DATAFILE '/opt/oracle/oradata/travel_lob.dbf' SIZE 100M
    AUTOEXTEND ON NEXT 10M;

-- 2. Создание папки
CREATE OR REPLACE DIRECTORY TRAVEL_DOCS_DIR AS '/tmp/travel_docs';

-- 3. Создание пользователя
CREATE USER lob_user IDENTIFIED BY lob123;

GRANT CONNECT, RESOURCE, CREATE SESSION TO lob_user;
GRANT CREATE TABLE TO lob_user;
GRANT CREATE SEQUENCE TO lob_user;
GRANT EXECUTE ON DBMS_LOB TO lob_user;
GRANT READ, WRITE ON DIRECTORY TRAVEL_DOCS_DIR TO lob_user;

-- 4. Квота на табличное пространство
ALTER USER lob_user QUOTA UNLIMITED ON travel_lob_ts;
ALTER USER lob_user DEFAULT TABLESPACE travel_lob_ts;

-- 5. Создание таблицы
DROP TABLE LOB_USER.TOUR_LOB;

CREATE TABLE LOB_USER.TOUR_LOB
(
    ID          NUMBER PRIMARY KEY,
    TOUR_NAME   VARCHAR2(200),
    FOTO        BLOB DEFAULT EMPTY_BLOB(),
    DOC         BFILE,
    TEXT_DOC    CLOB,
    TEXT_FILE   BFILE
);

-- 6. Добавление записей
INSERT INTO LOB_USER.TOUR_LOB (id, tour_name, foto, doc, text_file)
VALUES (1, 'Тур в Турцию', EMPTY_BLOB(), 
        BFILENAME('TRAVEL_DOCS_DIR', 'turkey_tour.docx'),
        BFILENAME('TRAVEL_DOCS_DIR', 'turkey_description.txt'));

INSERT INTO LOB_USER.TOUR_LOB (id, tour_name, foto, doc, text_file)
VALUES (2, 'Тур в Египет', EMPTY_BLOB(), 
        BFILENAME('TRAVEL_DOCS_DIR', 'egypt_tour.pdf'),
        BFILENAME('TRAVEL_DOCS_DIR', 'egypt_description.txt'));

INSERT INTO LOB_USER.TOUR_LOB (id, tour_name, foto, doc, text_file)
VALUES (3, 'Тур в Италию', EMPTY_BLOB(), 
        BFILENAME('TRAVEL_DOCS_DIR', 'italy_tour.docx'),
        BFILENAME('TRAVEL_DOCS_DIR', 'italy_description.txt'));

COMMIT;

-- Проверка
SELECT id, tour_name FROM LOB_USER.TOUR_LOB;

-- 7. Загрузка фото
DECLARE
    v_bfile BFILE;
    v_blob BLOB;
    v_dest_offset INTEGER := 1;
    v_src_offset INTEGER := 1;
    v_length NUMBER;
BEGIN
    -- Фото Турции
    v_bfile := BFILENAME('TRAVEL_DOCS_DIR', 'turkey_photo.jpg');
    IF DBMS_LOB.FILEEXISTS(v_bfile) = 1 THEN
        SELECT foto INTO v_blob FROM LOB_USER.TOUR_LOB WHERE id = 1 FOR UPDATE;
        v_length := DBMS_LOB.GETLENGTH(v_bfile);
        DBMS_LOB.FILEOPEN(v_bfile, DBMS_LOB.FILE_READONLY);
        DBMS_LOB.LOADFROMFILE(v_blob, v_bfile, v_length, v_dest_offset, v_src_offset);
        DBMS_LOB.FILECLOSE(v_bfile);
        UPDATE LOB_USER.TOUR_LOB SET foto = v_blob WHERE id = 1;
        DBMS_OUTPUT.PUT_LINE('Фото Турции загружено! Размер: ' || v_length || ' байт');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Файл turkey_photo.jpg не найден');
    END IF;
    
    -- Фото Египта
    v_bfile := BFILENAME('TRAVEL_DOCS_DIR', 'egypt_photo.jpg');
    IF DBMS_LOB.FILEEXISTS(v_bfile) = 1 THEN
        SELECT foto INTO v_blob FROM LOB_USER.TOUR_LOB WHERE id = 2 FOR UPDATE;
        v_length := DBMS_LOB.GETLENGTH(v_bfile);
        DBMS_LOB.FILEOPEN(v_bfile, DBMS_LOB.FILE_READONLY);
        DBMS_LOB.LOADFROMFILE(v_blob, v_bfile, v_length, v_dest_offset, v_src_offset);
        DBMS_LOB.FILECLOSE(v_bfile);
        UPDATE LOB_USER.TOUR_LOB SET foto = v_blob WHERE id = 2;
        DBMS_OUTPUT.PUT_LINE('Фото Египта загружено! Размер: ' || v_length || ' байт');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Файл egypt_photo.jpg не найден');
    END IF;
    
    -- Фото Италии
    v_bfile := BFILENAME('TRAVEL_DOCS_DIR', 'italy_photo.jpg');
    IF DBMS_LOB.FILEEXISTS(v_bfile) = 1 THEN
        SELECT foto INTO v_blob FROM LOB_USER.TOUR_LOB WHERE id = 3 FOR UPDATE;
        v_length := DBMS_LOB.GETLENGTH(v_bfile);
        DBMS_LOB.FILEOPEN(v_bfile, DBMS_LOB.FILE_READONLY);
        DBMS_LOB.LOADFROMFILE(v_blob, v_bfile, v_length, v_dest_offset, v_src_offset);
        DBMS_LOB.FILECLOSE(v_bfile);
        UPDATE LOB_USER.TOUR_LOB SET foto = v_blob WHERE id = 3;
        DBMS_OUTPUT.PUT_LINE('Фото Италии загружено! Размер: ' || v_length || ' байт');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Файл italy_photo.jpg не найден');
    END IF;
    
    COMMIT;
END;
/

-- 8. Загрузка текстовых документов из TXT файлов
DECLARE
    v_bfile BFILE;
    v_clob CLOB;
    v_dest_offset NUMBER := 1;
    v_src_offset NUMBER := 1;
    v_lang_context NUMBER := DBMS_LOB.DEFAULT_LANG_CTX;
    v_warning NUMBER;
    v_amount NUMBER;
BEGIN
    -- Для Турции
    v_bfile := BFILENAME('TRAVEL_DOCS_DIR', 'turkey_description.txt');
    IF DBMS_LOB.FILEEXISTS(v_bfile) = 1 THEN
        DBMS_LOB.CREATETEMPORARY(v_clob, TRUE);
        DBMS_LOB.FILEOPEN(v_bfile, DBMS_LOB.FILE_READONLY);
        v_amount := DBMS_LOB.GETLENGTH(v_bfile);
        
        v_dest_offset := 1;
        v_src_offset := 1;
        v_warning := 0;
        
        DBMS_LOB.LOADCLOBFROMFILE(
            dest_lob     => v_clob,
            src_bfile    => v_bfile,
            amount       => v_amount,
            dest_offset  => v_dest_offset,
            src_offset   => v_src_offset,
            bfile_csid   => DBMS_LOB.DEFAULT_CSID,
            lang_context => v_lang_context,
            warning      => v_warning
        );
        
        DBMS_LOB.FILECLOSE(v_bfile);
        
        UPDATE LOB_USER.TOUR_LOB 
        SET TEXT_DOC = v_clob 
        WHERE id = 1;
        
        DBMS_OUTPUT.PUT_LINE('Текст загружен для Турции: ' || v_amount || ' байт');
        
        DBMS_LOB.FREETEMPORARY(v_clob);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Файл turkey_description.txt не найден');
    END IF;    
    
    -- Для Египта
    v_bfile := BFILENAME('TRAVEL_DOCS_DIR', 'egypt_description.txt');
    IF DBMS_LOB.FILEEXISTS(v_bfile) = 1 THEN
        DBMS_LOB.CREATETEMPORARY(v_clob, TRUE);
        DBMS_LOB.FILEOPEN(v_bfile, DBMS_LOB.FILE_READONLY);
        v_amount := DBMS_LOB.GETLENGTH(v_bfile);
        v_dest_offset := 1;
        v_src_offset := 1;
        v_warning := 0;
        DBMS_LOB.LOADCLOBFROMFILE(
            dest_lob     => v_clob,
            src_bfile    => v_bfile,
            amount       => v_amount,
            dest_offset  => v_dest_offset,
            src_offset   => v_src_offset,
            bfile_csid   => DBMS_LOB.DEFAULT_CSID,
            lang_context => v_lang_context,
            warning      => v_warning
        );
        DBMS_LOB.FILECLOSE(v_bfile);
        UPDATE LOB_USER.TOUR_LOB 
        SET TEXT_DOC = v_clob 
        WHERE id = 2;
        DBMS_OUTPUT.PUT_LINE('Текст загружен для Египта: ' || v_amount || ' байт');
        DBMS_LOB.FREETEMPORARY(v_clob);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Файл egypt_description.txt не найден');
    END IF;
    
    -- Для Италии
    v_bfile := BFILENAME('TRAVEL_DOCS_DIR', 'italy_description.txt');
    IF DBMS_LOB.FILEEXISTS(v_bfile) = 1 THEN
        DBMS_LOB.CREATETEMPORARY(v_clob, TRUE);
        DBMS_LOB.FILEOPEN(v_bfile, DBMS_LOB.FILE_READONLY);
        v_amount := DBMS_LOB.GETLENGTH(v_bfile);
        v_dest_offset := 1;
        v_src_offset := 1;
        v_warning := 0;
        DBMS_LOB.LOADCLOBFROMFILE(
            dest_lob     => v_clob,
            src_bfile    => v_bfile,
            amount       => v_amount,
            dest_offset  => v_dest_offset,
            src_offset   => v_src_offset,
            bfile_csid   => DBMS_LOB.DEFAULT_CSID,
            lang_context => v_lang_context,
            warning      => v_warning
        );
        
        DBMS_LOB.FILECLOSE(v_bfile);
        UPDATE LOB_USER.TOUR_LOB SET TEXT_DOC = v_clob WHERE id = 3;
        DBMS_OUTPUT.PUT_LINE('Текст загружен для Италии: ' || v_amount || ' байт');
        DBMS_LOB.FREETEMPORARY(v_clob);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Файл italy_description.txt не найден');
    END IF;
    
    COMMIT;
END;
/




-- 9. Проверка
SET SERVEROUTPUT ON;

SELECT * FROM LOB_USER.TOUR_LOB;



-- Проверка фото
SELECT 
    id, 
    tour_name,
    CASE 
        WHEN foto IS NOT NULL AND DBMS_LOB.GETLENGTH(foto) > 0 
            THEN 'Фото загружено (' || DBMS_LOB.GETLENGTH(foto) || ' байт)'
        ELSE 'Фото отсутствует'
    END AS статус_фото
FROM LOB_USER.TOUR_LOB;

-- Проверка текстовых документов
SELECT 
    id,
    tour_name,
    CASE
        WHEN TEXT_DOC IS NOT NULL 
            THEN 'Текст загружен (' || DBMS_LOB.GETLENGTH(TEXT_DOC) || ' байт)'
        ELSE 'Текст отсутствует'
    END AS статус_текста,
    DBMS_LOB.SUBSTR(TEXT_DOC, 200, 1) AS текст_превью
FROM LOB_USER.TOUR_LOB;

SELECT * FROM LOB_USER.TOUR_LOB;







SET SERVEROUTPUT ON;

DECLARE
    v_bfile BFILE;
    v_exists NUMBER;
BEGIN
    v_bfile := BFILENAME('TRAVEL_DOCS_DIR', 'turkey_description.txt');
    v_exists := DBMS_LOB.FILEEXISTS(v_bfile);
    DBMS_OUTPUT.PUT_LINE('turkey_description.txt: ' || v_exists);
    
    v_bfile := BFILENAME('TRAVEL_DOCS_DIR', 'egypt_description.txt');
    v_exists := DBMS_LOB.FILEEXISTS(v_bfile);
    DBMS_OUTPUT.PUT_LINE('egypt_description.txt: ' || v_exists);
    
    v_bfile := BFILENAME('TRAVEL_DOCS_DIR', 'italy_description.txt');
    v_exists := DBMS_LOB.FILEEXISTS(v_bfile);
    DBMS_OUTPUT.PUT_LINE('italy_description.txt: ' || v_exists);
END;
/


