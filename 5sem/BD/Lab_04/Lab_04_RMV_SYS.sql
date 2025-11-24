-- КАК RMV_SYS
-- Задание 11

SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') AS время_перед_переключением FROM DUAL;

ALTER SESSION SET CONTAINER = CDB$ROOT;

SHOW CON_NAME;

ALTER SYSTEM SWITCH LOGFILE;

SELECT group#, sequence#, status, first_change#
FROM v$log 
ORDER BY group#;

SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') AS время_переключения FROM DUAL;


-- Задание 12
ALTER DATABASE ADD LOGFILE GROUP 3 (
    '/opt/oracle/oradata/XE/REDO03_1.LOG',
    '/opt/oracle/oradata/XE/REDO03_2.LOG',
    '/opt/oracle/oradata/XE/REDO03_3.LOG'
) SIZE 50M REUSE;

SELECT group#, sequence#, status, bytes/1024/1024 as size_mb, members
FROM v$log 
ORDER BY group#;

SELECT group#, member, type, is_recovery_dest_file
FROM v$logfile 
ORDER BY group#, member;

ALTER SYSTEM SWITCH LOGFILE;

SELECT 
    group#,
    sequence#,
    status,
    first_change#,
    next_change#,
    (next_change# - first_change#) as scn_range
FROM v$log
ORDER BY group#;


-- Задание 13
SELECT group#, status FROM v$log WHERE group# = 3;

ALTER SYSTEM CHECKPOINT;
ALTER SYSTEM SWITCH LOGFILE;

ALTER DATABASE DROP LOGFILE GROUP 3;

SELECT group# FROM v$log WHERE group# = 3;
SELECT group# FROM v$logfile WHERE group# = 3;


-- Задание 16-18 (в cmd)



-- Задание 22
CREATE PFILE='/opt/oracle/oradata/XE/RMV_PFILE.ora' FROM SPFILE;

-- Задание 26
ALTER SESSION SET CONTAINER = XEPDB1;
SHOW CON_NAME;

DROP TABLESPACE TS_RMV INCLUDING CONTENTS AND DATAFILES CASCADE CONSTRAINTS;

DROP USER RMV_LAB04 CASCADE;
DROP USER RMVCORE CASCADE;
ALTER USER RMVCORE ACCOUNT LOCK;

SELECT tablespace_name FROM dba_tablespaces WHERE tablespace_name LIKE 'RMV%';
SELECT username FROM dba_users WHERE username LIKE 'RMV%';
SELECT file_name FROM dba_data_files WHERE file_name LIKE '%RMV%';

PURGE RECYCLEBIN;
