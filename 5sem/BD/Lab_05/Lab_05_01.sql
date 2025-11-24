---- Задание 1
select sum(value) total_sga_in_bytes from v$sga;

---- Задание 2
select name pool_name, value size_in_bytes from v$sga;

---- Задание 3 
select component, granule_size from v$sga_dynamic_components;

---- Задание 4
select current_size from v$sga_dynamic_free_memory;

---- Задание 5
select name, value from v$parameter 
where name in ('sga_target', 'sga_max_size');

---- Задание 6
select component, min_size, max_size, current_size from v$sga_dynamic_components
where component in ('KEEP buffer cache', 'RECYCLE buffer cache', 'DEFAULT buffer cache');

---- Задание 7
create table keep_pool_table (num number) storage (buffer_pool keep);
insert into keep_pool_table values (1);
insert into keep_pool_table values (2);
insert into keep_pool_table values (3);
commit;

select segment_name, segment_type, tablespace_name, buffer_pool
from user_segments where segment_name like 'KEEP%';

---- Задание 8
create table default_cache_table (num number) storage (buffer_pool default);
insert into default_cache_table values (4);
insert into default_cache_table values (5);
commit;

select segment_name, segment_type, tablespace_name, buffer_pool
from user_segments where segment_name like 'DEFAULT_CACHE%';

---- Задание 9
show parameter log_buffer;

---- Задание 10
select pool, name, bytes from v$sgastat where pool = 'large pool' and name = 'free memory';

---- Задание 11
select sid, status, server, logon_time, program, osuser, machine, username, state
from v$session
where status = 'ACTIVE';

---- Задание 12
select sid, process, name, description, program
from v$session s join v$bgprocess using (paddr)
where s.status = 'ACTIVE';

---- Задание 13
select * from v$process;

---- Задание 14
select count(*) from v$process where pname like 'DBW%';

---- Задание 15
select name, network_name, pdb from v$services;

---- Задание 16
show parameter dispatchers;

