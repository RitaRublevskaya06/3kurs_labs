-- Дадим права RMV
GRANT CREATE SESSION TO RMV;
GRANT UNLIMITED TABLESPACE TO RMV;
GRANT CREATE TABLE TO RMV;
GRANT CREATE SEQUENCE TO RMV;
GRANT CREATE PROCEDURE TO RMV;
GRANT CREATE VIEW TO RMV;
GRANT RESOURCE TO RMV;

--- УДАЛЕНИЕ
DROP SEQUENCE seq_booking;
DROP TABLE Booking_Staging;
DROP FUNCTION GET_CLIENTS_AND_TOURS_BY_DATE;


----Задание 5
CREATE OR REPLACE FUNCTION GET_CLIENTS_AND_TOURS_BY_DATE (
    p_StartDate IN DATE,
    p_EndDate IN DATE
)
RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT 
            c.user_id AS ClientID,
            u.last_name || ' ' || u.first_name AS ClientName,
            b.booking_number AS BookingNumber,
            t.title AS TourName,
            TO_CHAR(t.departure_date, 'YYYY-MM-DD') AS TourDepartureDate,
            TO_CHAR(b.booking_date, 'YYYY-MM-DD') AS BookingDate,
            b.persons_count AS PersonsCount,
            b.total_price AS TotalPrice,
            os.name AS OrderStatus
        FROM Client c
        INNER JOIN "User" u ON c.user_id = u.id
        INNER JOIN Booking b ON c.user_id = b.client_id
        INNER JOIN Tour t ON b.tour_id = t.id
        INNER JOIN OrderStatus os ON b.status_id = os.id
        WHERE b.booking_date BETWEEN p_StartDate AND p_EndDate
        ORDER BY b.booking_date DESC;
    
    RETURN v_cursor;
END GET_CLIENTS_AND_TOURS_BY_DATE;
/

CREATE SEQUENCE seq_booking START WITH 100 INCREMENT BY 1;

CREATE TABLE Booking_Staging (
    booking_number VARCHAR2(50),
    client_id NUMBER,
    tour_id NUMBER,
    booking_date DATE,
    persons_count NUMBER,
    total_price NUMBER(10,2),
    status_name VARCHAR2(50)
);

----ПРОВЕРКА
SET SERVEROUTPUT ON;

DECLARE
    cur SYS_REFCURSOR;
    v_ClientID NUMBER;
    v_ClientName VARCHAR2(200);
    v_BookingNumber VARCHAR2(50);
    v_TourName VARCHAR2(255);
    v_TourDepartureDate VARCHAR2(10);
    v_BookingDate VARCHAR2(10);
    v_PersonsCount NUMBER;
    v_TotalPrice NUMBER;
    v_OrderStatus VARCHAR2(50);
BEGIN
    cur := GET_CLIENTS_AND_TOURS_BY_DATE(
        TO_DATE('2024-01-01', 'YYYY-MM-DD'),
        TO_DATE('2024-12-31', 'YYYY-MM-DD')
    );
    
    DBMS_OUTPUT.PUT_LINE('ClientName | BookingNumber | TourName');
    DBMS_OUTPUT.PUT_LINE('----------------------------------------');
    
    LOOP
        FETCH cur INTO v_ClientID, v_ClientName, v_BookingNumber, v_TourName, 
                        v_TourDepartureDate, v_BookingDate, v_PersonsCount, 
                        v_TotalPrice, v_OrderStatus;
        EXIT WHEN cur%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE(v_ClientName || ' | ' || v_BookingNumber || ' | ' || v_TourName);
    END LOOP;
    CLOSE cur;
END;
/



-----Задание 8

SELECT 
    c.user_id AS ClientID,
    u.last_name || ' ' || u.first_name AS ClientName,
    b.booking_number AS BookingNumber,
    t.title AS TourName,
    TO_CHAR(t.departure_date, 'YYYY-MM-DD') AS TourDepartureDate,
    TO_CHAR(b.booking_date, 'YYYY-MM-DD') AS BookingDate,
    b.persons_count AS PersonsCount,
    b.total_price AS TotalPrice,
    os.name AS OrderStatus
FROM Client c
INNER JOIN "User" u ON c.user_id = u.id
INNER JOIN Booking b ON c.user_id = b.client_id
INNER JOIN Tour t ON b.tour_id = t.id
INNER JOIN OrderStatus os ON b.status_id = os.id
WHERE b.booking_date BETWEEN TO_DATE('2024-01-01', 'YYYY-MM-DD') AND TO_DATE('2024-12-31', 'YYYY-MM-DD')
ORDER BY b.booking_date DESC;


SELECT * FROM Booking_Staging;
SELECT COUNT(*) FROM Booking_Staging;
SELECT table_name FROM user_tables ORDER BY table_name;



SELECT booking_number, persons_count, total_price, status_name 
FROM Booking_Staging;

UPDATE Booking_Staging 
SET status_name = TRIM(REPLACE(REPLACE(status_name, CHR(13), ''), CHR(10), ''));
COMMIT;

SELECT status_name, LENGTH(status_name) FROM Booking_Staging;

BEGIN
    FOR rec IN (SELECT * FROM Booking_Staging) LOOP
        INSERT INTO Booking (
            id, booking_number, client_id, tour_id, booking_date,
            status_id, persons_count, total_price
        )
        SELECT 
            seq_booking.NEXTVAL,
            rec.booking_number,
            rec.client_id,
            rec.tour_id,
            rec.booking_date,
            (SELECT id FROM ORDERSTATUS WHERE name = rec.status_name),
            rec.persons_count,
            rec.total_price
        FROM DUAL
        WHERE NOT EXISTS (
            SELECT 1 FROM Booking 
            WHERE booking_number = rec.booking_number
        );
    END LOOP;
    COMMIT;
END;
/

SELECT booking_number, persons_count, total_price, status_id 
FROM Booking 
WHERE booking_number LIKE 'BK-2025%';

DELETE FROM Booking WHERE booking_number LIKE 'BK-2025%';
TRUNCATE TABLE Booking_Staging;



















UPDATE Booking_Staging SET status_name = UPPER(status_name);
COMMIT;


SELECT DISTINCT status_name FROM Booking_Staging;


SELECT id, name FROM ORDERSTATUS;


SELECT status_name, UPPER(status_name), LENGTH(status_name) 
FROM Booking_Staging;

UPDATE Booking_Staging SET status_name = TRIM(UPPER(status_name));
COMMIT;

SELECT DISTINCT status_name, LENGTH(status_name) FROM Booking_Staging;

UPDATE Booking_Staging 
SET status_name = TRIM(UPPER(status_name));
COMMIT;

-- Проверка
SELECT status_name, LENGTH(status_name) FROM Booking_Staging;

SELECT 
    bs.status_name,
    LOWER(bs.status_name) AS lower_status,
    (SELECT id FROM ORDERSTATUS WHERE name = LOWER(bs.status_name)) AS found_id
FROM Booking_Staging bs;


UPDATE ORDERSTATUS SET name = UPPER(name);
COMMIT;

SELECT id, name FROM ORDERSTATUS;
SELECT 
    status_name,
    DUMP(status_name) AS dump_value,
    LENGTH(status_name) AS len
FROM Booking_Staging 
WHERE ROWNUM = 1;

SELECT 
    name,
    DUMP(name) AS dump_value,
    LENGTH(name) AS len
FROM ORDERSTATUS 
WHERE name = 'PENDING';


UPDATE Booking_Staging 
SET status_name = TRIM(REPLACE(REPLACE(status_name, CHR(13), ''), CHR(10), ''));
COMMIT;

SELECT status_name, LENGTH(status_name) FROM Booking_Staging;