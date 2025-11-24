-- Задание 7
SELECT USER FROM dual;

CREATE TABLE RMV_table (
  x NUMBER(2), 
  y VARCHAR2(5)
);

INSERT INTO RMV_table VALUES (1, 'first');
INSERT INTO RMV_table VALUES (3, 'third');
INSERT INTO RMV_table VALUES (5, 'fifth');

COMMIT;

SELECT * FROM RMV_table;