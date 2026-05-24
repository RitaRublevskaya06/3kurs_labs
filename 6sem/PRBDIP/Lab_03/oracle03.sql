----- 1. Добавление иерархического столбца
ALTER TABLE TourType ADD (PARENT_ID NUMBER);

ALTER TABLE TourType ADD CONSTRAINT fk_tourtype_parent 
    FOREIGN KEY (PARENT_ID) REFERENCES TourType(id);

CREATE INDEX IX_TourType_Parent ON TourType(PARENT_ID);


---- 2. Процедура отображения подчиненных узлов
CREATE OR REPLACE PROCEDURE sp_GetSubordinateNodes_Oracle(
    p_node_id IN TourType.id%TYPE
) AS
    v_level NUMBER := 1;
    v_name TourType.name%TYPE;
    v_id TourType.id%TYPE;
    v_seasonality TourType.seasonality%TYPE;
    v_activity_level TourType.activity_level%TYPE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== Информация об узле ===');
    
    FOR node_rec IN (
        SELECT id, name, description, seasonality, activity_level
        FROM TourType
        WHERE id = p_node_id
    ) LOOP
        DBMS_OUTPUT.PUT_LINE('ID: ' || node_rec.id);
        DBMS_OUTPUT.PUT_LINE('Название: ' || node_rec.name);
        DBMS_OUTPUT.PUT_LINE('Описание: ' || node_rec.description);
        DBMS_OUTPUT.PUT_LINE('Сезонность: ' || node_rec.seasonality);
        DBMS_OUTPUT.PUT_LINE('Уровень активности: ' || node_rec.activity_level);
        DBMS_OUTPUT.PUT_LINE('');
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('=== Подчиненные узлы с уровнями иерархии ===');
    
    FOR sub_rec IN (
        SELECT 
            id,
            name,
            description,
            seasonality,
            activity_level,
            LEVEL AS hierarchy_level,
            LPAD(' ', (LEVEL - 1) * 2, ' ') || name AS tree_view
        FROM TourType
        START WITH id = p_node_id
        CONNECT BY PRIOR id = parent_id
        AND LEVEL > 1  -- Исключаем сам корневой узел
    ) LOOP
        DBMS_OUTPUT.PUT_LINE('Уровень ' || sub_rec.hierarchy_level || ': ' || sub_rec.name);
        DBMS_OUTPUT.PUT_LINE('  ID: ' || sub_rec.id);
        DBMS_OUTPUT.PUT_LINE('  Сезонность: ' || NVL(sub_rec.seasonality, 'не указано'));
        DBMS_OUTPUT.PUT_LINE('  Активность: ' || NVL(sub_rec.activity_level, 'не указано'));
        DBMS_OUTPUT.PUT_LINE('  ---');
    END LOOP;
    
    DBMS_OUTPUT.PUT_LINE('=====================================');
END sp_GetSubordinateNodes_Oracle;
/



---- 3. Процедура добавления подчиненного узла
CREATE OR REPLACE PROCEDURE sp_AddChildNode_Oracle(
    p_parent_id IN TourType.id%TYPE,
    p_name IN TourType.name%TYPE,
    p_description IN TourType.description%TYPE DEFAULT NULL,
    p_seasonality IN TourType.seasonality%TYPE DEFAULT NULL,
    p_activity_level IN TourType.activity_level%TYPE DEFAULT NULL
) AS
    v_parent_seasonality TourType.seasonality%TYPE;
    v_parent_activity_level TourType.activity_level%TYPE;
    v_new_id TourType.id%TYPE;
BEGIN
    SELECT seasonality, activity_level
    INTO v_parent_seasonality, v_parent_activity_level
    FROM TourType
    WHERE id = p_parent_id;
    
    SELECT seq_tourtype.NEXTVAL INTO v_new_id FROM DUAL;
    
    INSERT INTO TourType (
        id, 
        name, 
        description, 
        seasonality, 
        activity_level, 
        parent_id
    ) VALUES (
        v_new_id,
        p_name,
        p_description,
        NVL(p_seasonality, v_parent_seasonality),
        NVL(p_activity_level, v_parent_activity_level),
        p_parent_id
    );
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Узел "' || p_name || '" успешно добавлен');
    DBMS_OUTPUT.PUT_LINE('   ID: ' || v_new_id);
    DBMS_OUTPUT.PUT_LINE('   Родитель: ' || p_parent_id);
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Ошибка: Родительский узел с ID ' || p_parent_id || ' не найден');
        ROLLBACK;
    WHEN DUP_VAL_ON_INDEX THEN
        DBMS_OUTPUT.PUT_LINE('Ошибка: Узел с таким именем уже существует');
        ROLLBACK;
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Ошибка: ' || SQLERRM);
        ROLLBACK;
END sp_AddChildNode_Oracle;
/

---- 4. Процедура перемещения подчиненных узлов
CREATE OR REPLACE PROCEDURE sp_MoveSubordinateNodes_Oracle(
    p_old_parent_id IN TourType.id%TYPE,
    p_new_parent_id IN TourType.id%TYPE
) AS
    v_new_parent_seasonality TourType.seasonality%TYPE;
    v_new_parent_activity_level TourType.activity_level%TYPE;
    v_move_count NUMBER;
BEGIN
    SELECT seasonality, activity_level
    INTO v_new_parent_seasonality, v_new_parent_activity_level
    FROM TourType
    WHERE id = p_new_parent_id;
    
    SELECT COUNT(*) INTO v_move_count
    FROM TourType
    WHERE parent_id = p_old_parent_id;
    
    IF v_move_count = 0 THEN
        DBMS_OUTPUT.PUT_LINE(' У узла ' || p_old_parent_id || ' нет подчиненных узлов для перемещения');
        RETURN;
    END IF;
    
    UPDATE TourType
    SET seasonality = v_new_parent_seasonality,
        activity_level = v_new_parent_activity_level
    WHERE parent_id = p_old_parent_id;
    
    UPDATE TourType
    SET parent_id = p_new_parent_id
    WHERE parent_id = p_old_parent_id;
    
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('Перемещено узлов: ' || v_move_count);
    DBMS_OUTPUT.PUT_LINE('   Из родителя: ' || p_old_parent_id);
    DBMS_OUTPUT.PUT_LINE('   В родителя: ' || p_new_parent_id);
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Ошибка: Новый родительский узел с ID ' || p_new_parent_id || ' не найден');
        ROLLBACK;
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Ошибка: ' || SQLERRM);
        ROLLBACK;
END sp_MoveSubordinateNodes_Oracle;
/



---- 5. Инициализация корневых узлов
UPDATE TourType SET parent_id = NULL;
COMMIT;

SELECT id, name, parent_id FROM TourType ORDER BY id;


---- 6. Добавление подчиненных узлов
SET SERVEROUTPUT ON;

BEGIN
    sp_AddChildNode_Oracle(1, 'Семейный пляжный отдых', 'Отдых с детьми', 'summer', 'low');
    sp_AddChildNode_Oracle(1, 'Молодежный пляжный отдых', 'Активный отдых с развлечениями', 'summer', 'high');
    sp_AddChildNode_Oracle(1, 'VIP пляжный отдых', 'Элитный отдых', 'summer', 'medium');
END;
/

BEGIN
    sp_AddChildNode_Oracle(2, 'Культурно-исторический', 'Музеи, памятники архитектуры', 'all', 'medium');
    sp_AddChildNode_Oracle(2, 'Гастрономический тур', 'Дегустации, рестораны', 'all', 'low');
END;
/

BEGIN
    sp_AddChildNode_Oracle(4, 'Семейный горнолыжный', 'Склоны для начинающих', 'winter', 'low');
    sp_AddChildNode_Oracle(4, 'Экстремальный горнолыжный', 'Сложные трассы', 'winter', 'high');
END;
/



---- 7. Тестирование процедур
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== Тест 1: Пляжный тур (id=1) ===');
    sp_GetSubordinateNodes_Oracle(1);
END;
/

BEGIN
    DBMS_OUTPUT.PUT_LINE('=== Тест 2: Экскурсионный тур (id=2) ===');
    sp_GetSubordinateNodes_Oracle(2);
END;
/

BEGIN
    DBMS_OUTPUT.PUT_LINE('=== Тест 3: Перемещение ===');
    FOR rec IN (SELECT id, name FROM TourType WHERE name LIKE '%Семейный%') LOOP
        DBMS_OUTPUT.PUT_LINE('Найден узел: ' || rec.name || ' (ID=' || rec.id || ')');
    END LOOP;
    
    sp_MoveSubordinateNodes_Oracle(1, 2);  
END;
/


---- 8. Просмотр всей иерархии
SELECT 
    LPAD(' ', (LEVEL - 1) * 2, ' ') || name AS tree,
    id,
    parent_id,
    LEVEL AS lvl,
    seasonality,
    activity_level,
    SYS_CONNECT_BY_PATH(name, ' -> ') AS path
FROM TourType
START WITH parent_id IS NULL
CONNECT BY PRIOR id = parent_id
ORDER SIBLINGS BY name;


-- 9. Вернем узлы на правильные места (исправляем иерархию)
-- Перемещаем Семейный пляжный отдых обратно к Пляжному (id=1)
UPDATE TourType SET parent_id = 1 WHERE name = 'Семейный пляжный отдых';

-- Перемещаем Молодежный пляжный отдых обратно к Пляжному (id=1)
UPDATE TourType SET parent_id = 1 WHERE name = 'Молодежный пляжный отдых';

-- Перемещаем VIP пляжный отдых обратно к Пляжному (id=1)
UPDATE TourType SET parent_id = 1 WHERE name = 'VIP пляжный отдых';

COMMIT;

