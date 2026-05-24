----- 1. Добавление иерархического столбца
USE TravelAgency;
GO

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_TourType_Node' AND object_id = OBJECT_ID('TourType'))
BEGIN
    DROP INDEX IX_TourType_Node ON TourType;
    PRINT 'Index IX_TourType_Node dropped';
END
GO

IF EXISTS (SELECT * FROM sys.columns WHERE name = 'Node' AND object_id = OBJECT_ID('TourType'))
BEGIN
    ALTER TABLE TourType DROP COLUMN Node;
    PRINT 'Column Node dropped';
END
GO

ALTER TABLE TourType
    ADD Node HIERARCHYID NULL;
PRINT 'Column Node added';
GO

UPDATE TourType 
SET Node = '/' + CAST(id AS VARCHAR(10)) + '/'
WHERE Node IS NULL;
PRINT 'Nodes initialized';
GO

IF EXISTS (SELECT 1 FROM TourType WHERE Node IS NULL)
BEGIN
    PRINT 'ERROR: Still have NULL values';
END
ELSE
BEGIN
    PRINT 'All nodes have values';
END
GO

CREATE UNIQUE INDEX IX_TourType_Node ON TourType(Node);
PRINT 'Index created';
GO



---- 2. Процедура отображения подчиненных узлов
CREATE OR ALTER PROCEDURE sp_GetSubordinateNodes
    @NodeValue HIERARCHYID
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        @NodeValue.ToString() AS NodePath,
        @NodeValue.GetLevel() AS NodeLevel,
        tt.id,
        tt.name,
        tt.description,
        tt.seasonality,
        tt.activity_level
    FROM TourType tt
    WHERE tt.Node = @NodeValue;
    
    WITH RecursiveSubtypes AS (
        SELECT 
            tt.Node,
            tt.id,
            tt.name,
            tt.description,
            tt.seasonality,
            tt.activity_level,
            1 AS HierarchyLevel
        FROM TourType tt
        WHERE tt.Node.GetAncestor(1) = @NodeValue
        UNION ALL
        SELECT 
            tt.Node,
            tt.id,
            tt.name,
            tt.description,
            tt.seasonality,
            tt.activity_level,
            rs.HierarchyLevel + 1 AS HierarchyLevel
        FROM TourType tt
        INNER JOIN RecursiveSubtypes rs ON tt.Node.GetAncestor(1) = rs.Node
    )
    SELECT 
        Node.ToString() AS NodePath,
        HierarchyLevel,
        id,
        name,
        description,
        seasonality,
        activity_level
    FROM RecursiveSubtypes
    ORDER BY NodePath;
END;
GO



---- 3. Процедура добавления подчиненного узла
CREATE OR ALTER PROCEDURE sp_AddChildNode
    @ParentNode HIERARCHYID,
    @Name NVARCHAR(100),
    @Description NVARCHAR(MAX) = NULL,
    @Seasonality NVARCHAR(20) = NULL,
    @ActivityLevel NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @LastChild HIERARCHYID;
    DECLARE @NewNode HIERARCHYID;
    DECLARE @ParentSeasonality NVARCHAR(20);
    DECLARE @ParentActivityLevel NVARCHAR(20);
    
    BEGIN TRANSACTION;
    BEGIN TRY
        SELECT 
            @ParentSeasonality = seasonality,
            @ParentActivityLevel = activity_level
        FROM TourType
        WHERE Node = @ParentNode;
        
        IF @ParentSeasonality IS NULL
        BEGIN
            RAISERROR('Parent node not found', 16, 1);
            ROLLBACK;
            RETURN;
        END;
        
        -- Находим последнего потомка
        SELECT @LastChild = MAX(Node)
        FROM TourType
        WHERE Node.GetAncestor(1) = @ParentNode;
        
        SET @NewNode = @ParentNode.GetDescendant(@LastChild, NULL);
        
        INSERT INTO TourType (name, description, seasonality, activity_level, Node)
        VALUES (
            @Name, 
            @Description, 
            COALESCE(@Seasonality, @ParentSeasonality), 
            COALESCE(@ActivityLevel, @ParentActivityLevel),
            @NewNode
        );
        
        COMMIT;
        
        SELECT 'Node added successfully' AS Status, @NewNode.ToString() AS NewNodePath;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END;
GO


---- 4. Процедура перемещения подчиненных узлов
CREATE OR ALTER PROCEDURE sp_MoveSubordinateNodes
    @OldParentNode HIERARCHYID,
    @NewParentNode HIERARCHYID
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @NodeToMove HIERARCHYID;
    DECLARE @NewLocation HIERARCHYID;
    DECLARE @ParentSeasonality NVARCHAR(20);
    DECLARE @ParentActivityLevel NVARCHAR(20);
    
    DECLARE move_cursor CURSOR FOR
        SELECT Node
        FROM TourType
        WHERE Node.GetAncestor(1) = @OldParentNode;
    
    BEGIN TRANSACTION;
    BEGIN TRY
        SELECT 
            @ParentSeasonality = seasonality,
            @ParentActivityLevel = activity_level
        FROM TourType
        WHERE Node = @NewParentNode;
        
        IF @ParentSeasonality IS NULL
        BEGIN
            RAISERROR('New parent node not found', 16, 1);
            ROLLBACK;
            RETURN;
        END;
        
        OPEN move_cursor;
        FETCH NEXT FROM move_cursor INTO @NodeToMove;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            SELECT @NewLocation = @NewParentNode.GetDescendant(MAX(Node), NULL)
            FROM TourType
            WHERE Node.GetAncestor(1) = @NewParentNode;
            
            UPDATE TourType
            SET Node = Node.GetReparentedValue(@NodeToMove, @NewLocation),
                seasonality = @ParentSeasonality,
                activity_level = @ParentActivityLevel
            WHERE Node.IsDescendantOf(@NodeToMove) = 1;
            
            FETCH NEXT FROM move_cursor INTO @NodeToMove;
        END;
        
        CLOSE move_cursor;
        DEALLOCATE move_cursor;
        
        COMMIT;
        SELECT 'Nodes moved successfully' AS Status;
    END TRY
    BEGIN CATCH
        IF CURSOR_STATUS('global', 'move_cursor') >= 0
        BEGIN
            CLOSE move_cursor;
            DEALLOCATE move_cursor;
        END;
        ROLLBACK;
        THROW;
    END CATCH;
END;
GO



---- 5. Инициализация корневых узлов
UPDATE TourType SET Node = '/' + CAST(id AS VARCHAR(10)) + '/' WHERE Node IS NULL;
GO

SELECT id, name, Node.ToString() AS NodePath, Node.GetLevel() AS Level
FROM TourType
ORDER BY Node;
GO

---- 6. Добавление подчиненных узлов
-- Добавляем подтипы для Пляжного тура (id=1)
EXEC sp_AddChildNode '/1/', N'Семейный пляжный отдых', N'Отдых с детьми', 'summer', 'low';
EXEC sp_AddChildNode '/1/', N'Молодежный пляжный отдых', N'Активный отдых с развлечениями', 'summer', 'high';
EXEC sp_AddChildNode '/1/', N'VIP пляжный отдых', N'Элитный отдых', 'summer', 'medium';

-- Добавляем подтипы для Экскурсионного тура (id=2)
EXEC sp_AddChildNode '/2/', N'Культурно-исторический', N'Музеи, памятники архитектуры', 'all', 'medium';
EXEC sp_AddChildNode '/2/', N'Гастрономический тур', N'Дегустации, рестораны', 'all', 'low';

-- Добавляем подтипы для Горнолыжного тура (id=4)
EXEC sp_AddChildNode '/4/', N'Семейный горнолыжный', N'Склоны для начинающих', 'winter', 'low';
EXEC sp_AddChildNode '/4/', N'Экстремальный горнолыжный', N'Сложные трассы', 'winter', 'high';
GO



---- 7. Тестирование процедур
-- Тест процедуры отображения подчиненных узлов
PRINT '=== Все подчиненные узлы для Пляжного тура ===';
EXEC sp_GetSubordinateNodes '/1/';

PRINT '=== Все подчиненные узлы для Экскурсионного тура ===';
EXEC sp_GetSubordinateNodes '/2/';

-- Тест перемещения узлов
PRINT '=== Перемещение подузлов ===';
EXEC sp_MoveSubordinateNodes '/1/1/', '/2/1/';

PRINT '=== Проверка после перемещения ===';
EXEC sp_GetSubordinateNodes '/2/1/';
GO











