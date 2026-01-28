-- Задание № 1
DECLARE
    faculty_rec faculty%ROWTYPE;
BEGIN
    SELECT * INTO faculty_rec FROM faculty WHERE faculty = 'ТОВ';
    DBMS_OUTPUT.PUT_LINE(RTRIM(faculty_rec.faculty) || ': ' || faculty_rec.faculty_name);
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('error = ' || SQLERRM);
END;
/


-- Задание № 2
DECLARE
    faculty_rec faculty%ROWTYPE;
BEGIN
    SELECT * INTO faculty_rec FROM faculty;
    DBMS_OUTPUT.PUT_LINE(RTRIM(faculty_rec.faculty) || ': ' || faculty_rec.faculty_name);
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('error = ' || SQLERRM || SQLCODE);
END;
/

-- Задание № 3
DECLARE
    faculty_rec faculty%ROWTYPE;
BEGIN
    SELECT * INTO faculty_rec FROM faculty;
    DBMS_OUTPUT.PUT_LINE(faculty_rec.faculty || ': ' || faculty_rec.faculty_name);
EXCEPTION
    WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('error TOO_MANY_ROWS: ' || SQLERRM || SQLCODE);
END;
/


-- Задание № 4
DECLARE
    faculty_rec faculty%ROWTYPE;
BEGIN
    SELECT * INTO faculty_rec FROM faculty WHERE faculty = 'XXX';
    DBMS_OUTPUT.PUT_LINE(RTRIM(faculty_rec.faculty) || ': ' || faculty_rec.faculty_name);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('error NO_DATA_FOUND: ' || SQLERRM || '-' || SQLCODE);
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLERRM);
END;
/

DECLARE
    faculty_rec faculty%ROWTYPE;
BEGIN
    SELECT * INTO faculty_rec FROM faculty WHERE faculty = 'ИЭФ';
    DBMS_OUTPUT.PUT_LINE(RTRIM(faculty_rec.faculty) || ': ' || faculty_rec.faculty_name);

    IF SQL%FOUND THEN
        DBMS_OUTPUT.PUT_LINE('%FOUND:     TRUE');
    ELSE
        DBMS_OUTPUT.PUT_LINE('%FOUND:     FALSE');
    END IF;

    IF SQL%ISOPEN THEN
        DBMS_OUTPUT.PUT_LINE('$ISOPEN:    TRUE');
    ELSE
        DBMS_OUTPUT.PUT_LINE('$ISOPEN:    FALSE');
    END IF;

    IF SQL%NOTFOUND THEN
        DBMS_OUTPUT.PUT_LINE('%NOTFOUND:  TRUE');
    ELSE
        DBMS_OUTPUT.PUT_LINE('%NOTFOUND:  FALSE');
    END IF;

    DBMS_OUTPUT.PUT_LINE('%ROWCOUNT:  ' || SQL%ROWCOUNT);
END;
/


-- Задание № 5
BEGIN
    UPDATE auditorium
    SET auditorium          = '206-3',
        auditorium_name     = '206-3',
        auditorium_capacity = 90,
        auditorium_type     = 'ЛК'
    WHERE auditorium = '206-1';
    --COMMIT;
    --ROLLBACK;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLCODE || ' ' || SQLERRM);
END;
/

SELECT * FROM auditorium WHERE auditorium LIKE '206%';


-- Задание № 6
BEGIN
    UPDATE auditorium
    SET auditorium_capacity = 'qwerty'
--    WHERE auditorium = '206-3';
    WHERE auditorium = '206-1';
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLCODE || ' ' || SQLERRM);
END;
/

SELECT * FROM auditorium WHERE auditorium LIKE '206%';

-- Задание № 7
BEGIN
    INSERT INTO auditorium VALUES ('206-4', '206-4', 90, 'ЛК');
    COMMIT;
    INSERT INTO auditorium VALUES ('206-6', '206-6', 90, 'ЛК');
    ROLLBACK;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLCODE || ' ' || SQLERRM);
END;
/

SELECT * FROM auditorium WHERE auditorium LIKE '206%';

-- Задание № 8
BEGIN
    INSERT INTO auditorium VALUES ('206-4', '206-4', 'qwer', 'KR');
    --INSERT INTO auditorium VALUES ('206-4', '206-4', '100', 'KR');
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLCODE || ' ' || SQLERRM);
END;
/


-- Задание № 9
SELECT * FROM auditorium WHERE auditorium LIKE '206%';

BEGIN
    DELETE FROM auditorium WHERE auditorium = '206-4';
    COMMIT;
    DELETE FROM auditorium WHERE auditorium LIKE '206%';
    ROLLBACK;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLCODE || ' ' || SQLERRM);
END;
/


-- Задание № 10
BEGIN
    DELETE FROM auditorium_type WHERE auditorium_type = 'XXXX';
    IF (SQL%ROWCOUNT = 0) THEN
        RAISE NO_DATA_FOUND;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLCODE || ' ' || SQLERRM);
END;
/

SELECT * FROM auditorium_type;


-- Задание № 11
DECLARE
    CURSOR curs_teachers IS SELECT TEACHER, TEACHER_NAME, PULPIT FROM TEACHER;
    m_teacher      TEACHER.TEACHER%TYPE;
    m_teacher_name TEACHER.TEACHER_NAME%TYPE;
    m_pulpit       TEACHER.PULPIT%TYPE;
BEGIN
    OPEN curs_teachers;
    LOOP
        FETCH curs_teachers INTO m_teacher, m_teacher_name, m_pulpit;
        EXIT WHEN curs_teachers%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE(' ' || curs_teachers%ROWCOUNT || ' '
            || m_teacher || ' '
            || m_teacher_name || ' '
            || m_pulpit);
    END LOOP;
    CLOSE curs_teachers;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLERRM);
END;
/


-- Задание № 12
DECLARE
    CURSOR curs_subject IS
        SELECT subject, subject_name, pulpit FROM subject;
    rec_subject subject%ROWTYPE;
BEGIN
    OPEN curs_subject;
    DBMS_OUTPUT.PUT_LINE('ROWCOUNT = ' || curs_subject%ROWCOUNT);
    FETCH curs_subject INTO rec_subject;
    WHILE (curs_subject%FOUND) LOOP
        DBMS_OUTPUT.PUT_LINE(' ' || curs_subject%ROWCOUNT || ' '
            || rec_subject.subject || ' '
            || rec_subject.subject_name || ' '
            || rec_subject.pulpit);
        FETCH curs_subject INTO rec_subject;
    END LOOP;
    DBMS_OUTPUT.PUT_LINE('ROWCOUNT = ' || curs_subject%ROWCOUNT);
    CLOSE curs_subject;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLERRM);
END;
/


-- Задание № 13
DECLARE
    CURSOR curs_pulpit IS
        SELECT pulpit.pulpit, teacher.teacher_name
        FROM pulpit
        JOIN teacher ON pulpit.pulpit = teacher.pulpit;
    rec_pulpit curs_pulpit%ROWTYPE;
BEGIN
    FOR rec_pulpit IN curs_pulpit LOOP
        DBMS_OUTPUT.PUT_LINE(' ' || curs_pulpit%ROWCOUNT || ' '
            || rec_pulpit.pulpit || ' '
            || rec_pulpit.teacher_name);
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLERRM);
END;
/


-- Задание № 14
DECLARE
    CURSOR curs (capacity auditorium.auditorium_capacity%TYPE, capacity1 auditorium.auditorium_capacity%TYPE) IS
        SELECT auditorium, auditorium_capacity, auditorium_type
        FROM auditorium
        WHERE auditorium_capacity >= capacity AND auditorium_capacity <= capacity1;
    record curs%ROWTYPE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('capacity < 20 :');
    FOR aum IN curs(0, 20) LOOP
        DBMS_OUTPUT.PUT_LINE(aum.auditorium || ' ');
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('21 < capacity < 30 :');
    OPEN curs(21, 30);
    FETCH curs INTO record;
    WHILE curs%FOUND LOOP
        DBMS_OUTPUT.PUT_LINE(record.auditorium || ' ');
        FETCH curs INTO record;
    END LOOP;
    CLOSE curs;

    DBMS_OUTPUT.PUT_LINE('31 < capacity < 60 :');
    FOR aum IN curs(31, 60) LOOP
        DBMS_OUTPUT.PUT_LINE(aum.auditorium || ' ');
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('61 < capacity < 80 :');
    OPEN curs(61, 80);
    FETCH curs INTO record;
    LOOP
        DBMS_OUTPUT.PUT_LINE(record.auditorium || ' ');
        FETCH curs INTO record;
        EXIT WHEN curs%NOTFOUND;
    END LOOP;
    CLOSE curs;

    DBMS_OUTPUT.PUT_LINE('81 < capacity:');
    FOR aum IN curs(81, 1000) LOOP
        DBMS_OUTPUT.PUT_LINE(aum.auditorium || ' ');
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLCODE || ' ' || SQLERRM);
END;
/


-- Задание № 15
DECLARE
    TYPE auditorium_ref IS REF CURSOR RETURN auditorium%ROWTYPE;
    xcurs     auditorium_ref;
    xcurs_row xcurs%ROWTYPE;
BEGIN
    OPEN xcurs FOR SELECT * FROM auditorium;
    FETCH xcurs INTO xcurs_row;
    LOOP
        EXIT WHEN xcurs%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE(' ' || xcurs_row.auditorium || ' ' || xcurs_row.auditorium_capacity);
        FETCH xcurs INTO xcurs_row;
    END LOOP;
    CLOSE xcurs;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLERRM);
END;
/


-- Задание № 16
DECLARE
    CURSOR curs_aut IS
        SELECT auditorium_type,
               CURSOR (SELECT auditorium FROM auditorium aum WHERE aut.auditorium_type = aum.auditorium_type)
        FROM auditorium_type aut;
    curs_aum SYS_REFCURSOR;
    aut      auditorium_type.auditorium_type%TYPE;
    txt      VARCHAR2(1000);
    aum      auditorium.auditorium%TYPE;
BEGIN
    OPEN curs_aut;
    FETCH curs_aut INTO aut, curs_aum;
    WHILE (curs_aut%FOUND) LOOP
        txt := RTRIM(aut) || ': ';

        LOOP
            FETCH curs_aum INTO aum;
            EXIT WHEN curs_aum%NOTFOUND;
            txt := txt || RTRIM(aum) || '; ';
        END LOOP;

        DBMS_OUTPUT.PUT_LINE(txt);
        FETCH curs_aut INTO aut, curs_aum;
    END LOOP;
    CLOSE curs_aut;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLERRM);
END;
/


-- Задание № 17
SELECT * FROM auditorium ORDER BY auditorium;

DECLARE
    CURSOR curs_auditorium (capacity auditorium.auditorium%TYPE, capac auditorium.auditorium%TYPE) IS
        SELECT auditorium, auditorium_capacity
        FROM auditorium
        WHERE auditorium_capacity >= capacity AND AUDITORIUM_CAPACITY <= capac
        FOR UPDATE;
    aum auditorium.auditorium%TYPE;
    cty auditorium.auditorium_capacity%TYPE;
BEGIN
    OPEN curs_auditorium(40, 80);
    FETCH curs_auditorium INTO aum, cty;

    WHILE (curs_auditorium%FOUND) LOOP
        cty := cty * 0.9;
        UPDATE auditorium
        SET auditorium_capacity = cty
        WHERE CURRENT OF curs_auditorium;
        DBMS_OUTPUT.PUT_LINE(' ' || aum || ' ' || cty);
        FETCH curs_auditorium INTO aum, cty;
    END LOOP;

    CLOSE curs_auditorium;
    --COMMIT;
    ROLLBACK;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLERRM);
END;
/


-- Задание № 18
SELECT * FROM auditorium ORDER BY auditorium;

DECLARE
    CURSOR curs_auditorium (minCapacity auditorium.auditorium%TYPE, maxCapacity auditorium.auditorium%TYPE) IS
        SELECT auditorium, auditorium_capacity
        FROM auditorium
        WHERE auditorium_capacity >= minCapacity AND AUDITORIUM_CAPACITY <= maxCapacity
        FOR UPDATE;
    aum auditorium.auditorium%TYPE;
    cty auditorium.auditorium_capacity%TYPE;
BEGIN
    OPEN curs_auditorium(0, 20);
    FETCH curs_auditorium INTO aum, cty;

    WHILE (curs_auditorium%FOUND) LOOP
        DELETE FROM auditorium WHERE CURRENT OF curs_auditorium;
        FETCH curs_auditorium INTO aum, cty;
    END LOOP;
    CLOSE curs_auditorium;

    FOR pp IN curs_auditorium(0, 120) LOOP
        DBMS_OUTPUT.PUT_LINE(' ' || pp.auditorium || ' ' || pp.auditorium_capacity);
    END LOOP;
    --COMMIT;
    ROLLBACK;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLERRM);
END;
/


-- Задание № 19
DECLARE
    CURSOR cur (capacity auditorium.AUDITORIUM_CAPACITY%TYPE) IS
        SELECT auditorium, auditorium_capacity, rowid
        FROM auditorium
        WHERE auditorium_capacity >= capacity FOR UPDATE;
BEGIN
    FOR xxx IN cur(80) LOOP
        IF xxx.auditorium_capacity >= 90 THEN
            DELETE FROM auditorium WHERE rowid = xxx.rowid AND xxx.auditorium_capacity >= 90;
        ELSIF xxx.auditorium_capacity >= 40 THEN
            UPDATE auditorium
            SET auditorium_capacity = auditorium_capacity + 3
            WHERE rowid = xxx.rowid;
        END IF;
    END LOOP;
    FOR yyy IN cur(80) LOOP
        DBMS_OUTPUT.PUT_LINE(yyy.auditorium || ' ' || yyy.auditorium_capacity);
    END LOOP;
    --COMMIT;
    --ROLLBACK;
END;
/


-- Задание № 20
DECLARE
    CURSOR curs_teachers IS SELECT TEACHER, TEACHER_NAME, PULPIT FROM teacher;
    m_teacher      teacher.teacher%TYPE;
    m_teacher_name teacher.teacher_name%TYPE;
    m_pulpit       teacher.pulpit%TYPE;
BEGIN
    OPEN curs_teachers;
    LOOP
        FETCH curs_teachers INTO m_teacher, m_teacher_name, m_pulpit;
        EXIT WHEN curs_teachers%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE(' ' || curs_teachers%ROWCOUNT || ' ' || m_teacher || ' ' || m_teacher_name || ' ' || m_pulpit);
        IF (MOD(curs_teachers%ROWCOUNT, 3) = 0) THEN
            DBMS_OUTPUT.PUT_LINE('-----------------------');
        END IF;
    END LOOP;
    CLOSE curs_teachers;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(SQLCODE || ' ' || SQLERRM);
END;
/

