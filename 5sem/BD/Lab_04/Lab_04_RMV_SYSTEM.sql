-- КАК RMV_Lab04_SYSTEM
-- Задние 1
SELECT * FROM DBA_DATA_FILES;
SELECT * FROM DBA_TEMP_FILES;


-- Задание 2
DROP TABLESPACE RMV_QDATA INCLUDING CONTENTS AND DATAFILES CASCADE CONSTRAINTS;

CREATE TABLESPACE RMV_QDATA
  DATAFILE '/opt/oracle/oradata/XE/rmv_qdata01.dbf'
  SIZE 10M
  AUTOEXTEND ON
  OFFLINE;

ALTER TABLESPACE RMV_QDATA ONLINE;

ALTER USER RMV_LAB04 QUOTA 2M ON RMV_QDATA;

SELECT tablespace_name, status, contents FROM dba_tablespaces WHERE tablespace_name = 'RMV_QDATA';


-- Задание 8
SELECT tablespace_name, status, contents 
FROM dba_tablespaces 
WHERE tablespace_name = 'RMV_QDATA';

SELECT file_name, tablespace_name, bytes/1024/1024 as size_mb, status
FROM dba_data_files 
WHERE tablespace_name = 'RMV_QDATA';

SELECT s.username, s.program, u.default_tablespace, u.temporary_tablespace
FROM v$session s
JOIN dba_users u ON s.username = u.username
WHERE u.default_tablespace = 'RMV_QDATA' OR u.temporary_tablespace = 'RMV_QDATA';

DROP TABLESPACE RMV_QDATA INCLUDING CONTENTS AND DATAFILES;

SELECT tablespace_name FROM dba_tablespaces WHERE tablespace_name = 'RMV_QDATA';

SELECT file_name FROM dba_data_files WHERE tablespace_name = 'RMV_QDATA';


-- Задание 9
SELECT 
    group#,
    sequence#,
    members,
    bytes/1024/1024 as size_mb,
    status,
    archived,
    first_change#,
    next_change#
FROM v$log
ORDER BY group#;


-- Задание 10
SELECT 
    group#,
    member,
    type,
    is_recovery_dest_file,
    con_id
FROM v$logfile
ORDER BY group#, member;

SELECT 
    group#,
    sequence#,
    status,
    first_time
FROM v$log
WHERE status = 'CURRENT';



-- Задание 14
SELECT 
    dbid, 
    name, 
    log_mode,
    platform_name
FROM v$database;

SELECT 
    instance_name, 
    archiver, 
    active_state,
    status
FROM v$instance;


-- Задание 15
SELECT 
    sequence#,
    name,
    first_change#,
    next_change#,
    completion_time
FROM v$archived_log
ORDER BY sequence# DESC
FETCH FIRST 10 ROWS ONLY;


-- Задание 19
SELECT 
    name,
    status,
    is_recovery_dest_file,
    con_id
FROM v$controlfile
ORDER BY name;


-- Задание 20
SELECT 
    type,
    record_size,
    records_total,
    records_used
FROM v$controlfile_record_section
ORDER BY type;


-- Задание 21
SELECT name, value FROM v$parameter WHERE name = 'spfile';


-- Задание 23
SHOW PARAMETER remote_login_passwordfile;

SELECT username, sysdba, sysoper, sysasm 
FROM v$pwfile_users;


-- Задание 24
SELECT 
    name,
    value,
    con_id
FROM v$diag_info
ORDER BY name;


-- Задание 25
SELECT value || '/log.xml' AS log_xml_path
FROM v$diag_info 
WHERE name = 'Diag Alert';


-- Задание  26
SELECT tablespace_name FROM dba_tablespaces WHERE tablespace_name LIKE 'RMV%';

SELECT username FROM dba_users WHERE username LIKE 'RMV%';

SELECT file_name FROM dba_data_files WHERE file_name LIKE '%RMV%';