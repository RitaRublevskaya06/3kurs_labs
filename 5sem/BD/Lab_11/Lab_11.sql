-- Задание 1
DECLARE
    PROCEDURE GET_TEACHERS(PCODE TEACHER.PULPIT%TYPE) IS
        CURSOR c_teachers IS 
            SELECT TEACHER, TEACHER_NAME, PULPIT
            FROM TEACHER
            WHERE PULPIT = PCODE;
    BEGIN
        DBMS_OUTPUT.PUT_LINE('Преподаватели кафедры ' || PCODE || ':');
        DBMS_OUTPUT.PUT_LINE('--------------------------------');
        
        FOR teacher_rec IN c_teachers LOOP
            DBMS_OUTPUT.PUT_LINE(
                teacher_rec.TEACHER || ' | ' || 
                teacher_rec.TEACHER_NAME || ' | ' || 
                teacher_rec.PULPIT
            );
        END LOOP;
                
        DBMS_OUTPUT.PUT_LINE('--------------------------------');
    END GET_TEACHERS;

BEGIN
    GET_TEACHERS('ИСиТ');
END;
/

-- Задание 2
DECLARE
    FUNCTION GET_NUM_TEACHERS(PCODE TEACHER.PULPIT%TYPE) RETURN NUMBER IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count 
        FROM TEACHER 
        WHERE PULPIT = PCODE;
        
        RETURN v_count;
    END GET_NUM_TEACHERS;

BEGIN
    DBMS_OUTPUT.PUT_LINE('Количество преподавателей на кафедре ИСиТ: ' || 
                        GET_NUM_TEACHERS('ИСиТ'));
END;
/

-- Задание 3
CREATE OR REPLACE PROCEDURE GET_TEACHERS_BY_FACULTY(FCODE FACULTY.FACULTY%TYPE) IS
BEGIN
    DBMS_OUTPUT.PUT_LINE('Преподаватели факультета ' || FCODE || ':');
    DBMS_OUTPUT.PUT_LINE('--------------------------------');
    
    FOR teacher_rec IN (
        SELECT T.TEACHER, T.TEACHER_NAME, T.PULPIT
        FROM TEACHER T
        INNER JOIN PULPIT P ON P.PULPIT = T.PULPIT
        WHERE P.FACULTY = FCODE
        ORDER BY T.TEACHER_NAME
    ) LOOP
        DBMS_OUTPUT.PUT_LINE(
            teacher_rec.TEACHER || ' | ' || 
            teacher_rec.TEACHER_NAME || ' | ' || 
            teacher_rec.PULPIT
        );
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('--------------------------------');
END GET_TEACHERS_BY_FACULTY;
/

CREATE OR REPLACE PROCEDURE GET_SUBJECTS(PCODE SUBJECT.PULPIT%TYPE) IS
BEGIN
    DBMS_OUTPUT.PUT_LINE('Дисциплины кафедры ' || PCODE || ':');
    DBMS_OUTPUT.PUT_LINE('--------------------------------');
    
    FOR subject_rec IN (
        SELECT SUBJECT, SUBJECT_NAME, PULPIT
        FROM SUBJECT
        WHERE PULPIT = PCODE
        ORDER BY SUBJECT_NAME
    ) LOOP
        DBMS_OUTPUT.PUT_LINE(
            subject_rec.SUBJECT || ' | ' || 
            subject_rec.SUBJECT_NAME || ' | ' || 
            subject_rec.PULPIT
        );
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('--------------------------------');
END GET_SUBJECTS;
/

BEGIN
    GET_TEACHERS_BY_FACULTY('ИДиП');
    GET_SUBJECTS('ИСиТ');
END;
/

-- Задание 4
CREATE OR REPLACE FUNCTION GET_NUM_TEACHERS_BY_FACULTY(FCODE FACULTY.FACULTY%TYPE) 
RETURN NUMBER IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM TEACHER T
    WHERE T.PULPIT IN (
        SELECT PULPIT 
        FROM PULPIT 
        WHERE FACULTY = FCODE
    );
    
    RETURN v_count;
END GET_NUM_TEACHERS_BY_FACULTY;
/

CREATE OR REPLACE FUNCTION GET_NUM_SUBJECTS(PCODE SUBJECT.PULPIT%TYPE) 
RETURN NUMBER IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM SUBJECT
    WHERE PULPIT = PCODE;
    
    RETURN v_count;
END GET_NUM_SUBJECTS;
/

BEGIN
    DBMS_OUTPUT.PUT_LINE('Количество преподавателей на факультете ИДиП: ' || 
                        GET_NUM_TEACHERS_BY_FACULTY('ИДиП'));
    
    DBMS_OUTPUT.PUT_LINE('Количество дисциплин на кафедре ИСиТ: ' || 
                        GET_NUM_SUBJECTS('ИСиТ'));
END;
/

-- Задание 5
CREATE OR REPLACE PACKAGE TEACHERS_PKG AS
    PROCEDURE GET_TEACHERS(FCODE FACULTY.FACULTY%TYPE);
    
    PROCEDURE GET_SUBJECTS(PCODE SUBJECT.PULPIT%TYPE);
    
    FUNCTION GET_NUM_TEACHERS(FCODE FACULTY.FACULTY%TYPE) RETURN NUMBER;
    
    FUNCTION GET_NUM_SUBJECTS(PCODE SUBJECT.PULPIT%TYPE) RETURN NUMBER;
END TEACHERS_PKG;
/

CREATE OR REPLACE PACKAGE BODY TEACHERS_PKG AS
    
    PROCEDURE GET_TEACHERS(FCODE FACULTY.FACULTY%TYPE) IS
    BEGIN
        DBMS_OUTPUT.PUT_LINE('=== Пакет TEACHERS_PKG ===');
        DBMS_OUTPUT.PUT_LINE('Преподаватели факультета ' || FCODE || ':');
        DBMS_OUTPUT.PUT_LINE('--------------------------------');
        
        FOR teacher_rec IN (
            SELECT T.TEACHER, T.TEACHER_NAME, T.PULPIT
            FROM TEACHER T
            INNER JOIN PULPIT P ON P.PULPIT = T.PULPIT
            WHERE P.FACULTY = FCODE
            ORDER BY T.TEACHER_NAME
        ) LOOP
            DBMS_OUTPUT.PUT_LINE(
                teacher_rec.TEACHER || ' | ' || 
                teacher_rec.TEACHER_NAME || ' | ' || 
                teacher_rec.PULPIT
            );
        END LOOP;
        
        DBMS_OUTPUT.PUT_LINE('--------------------------------');
    END GET_TEACHERS;
    
    PROCEDURE GET_SUBJECTS(PCODE SUBJECT.PULPIT%TYPE) IS
    BEGIN
        DBMS_OUTPUT.PUT_LINE('=== Пакет TEACHERS_PKG ===');
        DBMS_OUTPUT.PUT_LINE('Дисциплины кафедры ' || PCODE || ':');
        DBMS_OUTPUT.PUT_LINE('--------------------------------');
        
        FOR subject_rec IN (
            SELECT SUBJECT, SUBJECT_NAME, PULPIT
            FROM SUBJECT
            WHERE PULPIT = PCODE
            ORDER BY SUBJECT_NAME
        ) LOOP
            DBMS_OUTPUT.PUT_LINE(
                subject_rec.SUBJECT || ' | ' || 
                subject_rec.SUBJECT_NAME || ' | ' || 
                subject_rec.PULPIT
            );
        END LOOP;
        
        DBMS_OUTPUT.PUT_LINE('--------------------------------');
    END GET_SUBJECTS;
    
    FUNCTION GET_NUM_TEACHERS(FCODE FACULTY.FACULTY%TYPE) RETURN NUMBER IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM TEACHER T
        WHERE T.PULPIT IN (
            SELECT PULPIT 
            FROM PULPIT 
            WHERE FACULTY = FCODE
        );
        
        RETURN v_count;
    END GET_NUM_TEACHERS;
    
    FUNCTION GET_NUM_SUBJECTS(PCODE SUBJECT.PULPIT%TYPE) RETURN NUMBER IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM SUBJECT
        WHERE PULPIT = PCODE;
        
        RETURN v_count;
    END GET_NUM_SUBJECTS;
    
END TEACHERS_PKG;
/

-- Задание 6
BEGIN
    DBMS_OUTPUT.PUT_LINE('1. Количество преподавателей на факультете ИДиП: ' || 
                        TEACHERS_PKG.GET_NUM_TEACHERS('ИДиП'));
    
    DBMS_OUTPUT.PUT_LINE('2. Количество дисциплин на кафедре ИСиТ: ' || 
                        TEACHERS_PKG.GET_NUM_SUBJECTS('ИСиТ'));
    
    DBMS_OUTPUT.PUT_LINE(chr(10) || '3. Список преподавателей факультета ИДиП:');
    TEACHERS_PKG.GET_TEACHERS('ИДиП');
    
    DBMS_OUTPUT.PUT_LINE('4. Список дисциплин кафедры ИСиТ:');
    TEACHERS_PKG.GET_SUBJECTS('ИСиТ');
END;
/

