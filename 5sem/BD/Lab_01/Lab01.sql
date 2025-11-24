
create table RMV_t (
    x number(3) primary key,
    s varchar2(50)
);

select * from RMV_t;

--11
insert into RMV_t (x, s) values (1, 'Мария');
insert into RMV_t (x, s) values (2, 'Анна');
insert into RMV_t (x, s) values (3, 'Иван');
commit;

--12
update RMV_t set s = 'Мария Петрова' where x = 1;
update RMV_t set s = 'Анна Иванова' where x = 2;
commit;

--13
select * from RMV_t where x > 1;

select count(*) as total_rows from RMV_t;
select max(x) as max_value from RMV_t;

--14
delete from RMV_t where x = 3;
commit;

--15
create table RMV_t1 (
    y number(3) primary key,
    description varchar2(50),
    x_id number(3),
    foreign key (x_id) references RMV_t(x)
);

insert into RMV_t1 (y, description, x_id) values (10, 'Запись для Марии', 1);
insert into RMV_t1 (y, description, x_id) values (20, 'Запись для Анны', 2);
insert into RMV_t1 (y, description, x_id) values (30, 'Резервная запись', 1);
commit;

--16
-- INNER JOIN
select t.x, t.s, t1.y, t1.description 
from RMV_t t
inner join RMV_t1 t1 on t.x = t1.x_id;

-- LEFT JOIN
select t.x, t.s, t1.y, t1.description 
from RMV_t t
left join RMV_t1 t1 on t.x = t1.x_id;

-- RIGHT JOIN
select t.x, t.s, t1.y, t1.description 
from RMV_t t
right join RMV_t1 t1 on t.x = t1.x_id;

--18
drop table RMV_t1;
drop table RMV_t;

