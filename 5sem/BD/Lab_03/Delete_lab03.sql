-- Очистка старых объектов если они есть
ALTER SESSION SET CONTAINER = CDB$ROOT;

-- Удалить PDB если существует
DROP PLUGGABLE DATABASE RMV_PDB INCLUDING DATAFILES;

-- Удалить общего пользователя если существует
DROP USER C##RMV CASCADE;



-- Переключиться в PDB RMV_PDB
ALTER SESSION SET CONTAINER = RMV_PDB;

-- Проверить текущий контейнер
SELECT SYS_CONTEXT('USERENV', 'CON_NAME') AS current_container FROM dual;

-- УДАЛЕНИЕ ОБЪЕКТОВ в обратном порядке создания:

-- 1. Удалить пользователя (если существует)
DROP USER U1_RMV_PDB CASCADE;

-- 2. Удалить профиль (если существует)
DROP PROFILE PF_PDB_RMVCORE CASCADE;

-- 3. Отозвать привилегии и удалить роль (если существует)
DROP ROLE RL_PDB_RMVCORE;

-- 4. Удалить временное табличное пространство (если существует)
DROP TABLESPACE TS_PDB_RMV_TEMP INCLUDING CONTENTS AND DATAFILES;

-- 5. Удалить постоянное табличное пространство (если существует)
DROP TABLESPACE TS_PDB_RMV INCLUDING CONTENTS AND DATAFILES;

-- 6. Проверить, что все удалено
SELECT tablespace_name FROM dba_tablespaces WHERE tablespace_name LIKE 'TS_PDB%';
SELECT role FROM dba_roles WHERE role = 'RL_PDB_RMVCORE';
SELECT profile FROM dba_profiles WHERE profile = 'PF_PDB_RMVCORE';
SELECT username FROM dba_users WHERE username = 'U1_RMV_PDB';



ALTER SESSION SET CONTAINER = RMV_PDB;

-- Попробовать удалить старые табличные пространства
DROP TABLESPACE TS_PDB_RMV INCLUDING CONTENTS AND DATAFILES;
DROP TABLESPACE TS_PDB_RMV_TEMP INCLUDING CONTENTS AND DATAFILES;

ALTER SESSION SET CONTAINER = RMV_PDB;

-- 1. Удалить роль (если существует)
DROP ROLE RL_PDB_RMVCORE;

-- 2. Удалить профиль (если существует)
DROP PROFILE PF_PDB_RMVCORE CASCADE;

-- 3. Проверить, что удалено
SELECT role FROM dba_roles WHERE role = 'RL_PDB_RMVCORE';
SELECT profile FROM dba_profiles WHERE profile = 'PF_PDB_RMVCORE';