-- как RMV_Lab04
-- Задание 2

CREATE TABLE RMV_T1 (
    x INT PRIMARY KEY,
    s VARCHAR2(50)
) TABLESPACE RMV_QDATA;

INSERT INTO RMV_T1 VALUES (1, 'Первая строка');
INSERT INTO RMV_T1 VALUES (2, 'Вторая строка');
INSERT INTO RMV_T1 VALUES (3, 'Третья строка');

COMMIT;

SELECT * FROM RMV_T1;


-- Задание 3
SELECT SEGMENT_NAME, SEGMENT_TYPE, TABLESPACE_NAME, BYTES, BLOCKS, EXTENTS
FROM USER_SEGMENTS
WHERE TABLESPACE_NAME = 'RMV_QDATA';


-- Задание 4
DROP TABLE RMV_T1;

SELECT * FROM RMV_T1;

SELECT * FROM USER_SEGMENTS WHERE TABLESPACE_NAME = 'RMV_QDATA';

SELECT object_name, original_name, type, ts_name, droptime 
FROM USER_RECYCLEBIN;


-- Задание 5
FLASHBACK TABLE RMV_T1 TO BEFORE DROP;

SELECT * FROM RMV_T1;


-- Задание 6
BEGIN
  FOR i IN 4..10003 LOOP
    INSERT INTO RMV_T1 VALUES (i, 'Строка номер ' || i);
  END LOOP;
  COMMIT;
END;
/

SELECT COUNT(*) FROM RMV_T1;


-- Задание 7
SELECT segment_name, tablespace_name, bytes, blocks, extents
FROM user_segments 
WHERE segment_name = 'RMV_T1';

