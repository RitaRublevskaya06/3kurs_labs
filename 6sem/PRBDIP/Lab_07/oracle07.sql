------ Задание 1
WITH sales_2025 AS (
    SELECT 
        m.user_id AS manager_id,
        u.first_name || ' ' || u.last_name AS manager_name,
        EXTRACT(MONTH FROM b.booking_date) AS month_num,
        COALESCE(SUM(b.total_price), 0) AS sales_amount
    FROM Manager m
    INNER JOIN "User" u ON m.user_id = u.id
    INNER JOIN Booking b ON b.manager_id = m.user_id
    INNER JOIN OrderStatus os ON b.status_id = os.id
    WHERE os.name IN ('completed', 'paid')
      AND EXTRACT(YEAR FROM b.booking_date) = 2025
    GROUP BY m.user_id, u.first_name, u.last_name, EXTRACT(MONTH FROM b.booking_date)
),
all_months_filled AS (
    SELECT manager_id, manager_name, month_num, sales_amount
    FROM sales_2025
    UNION ALL
    SELECT DISTINCT m.user_id, u.first_name || ' ' || u.last_name, months.m, 0
    FROM Manager m
    INNER JOIN "User" u ON m.user_id = u.id
    CROSS JOIN (SELECT LEVEL AS m FROM DUAL CONNECT BY LEVEL <= 12) months
    WHERE NOT EXISTS (
        SELECT 1 FROM sales_2025 s WHERE s.manager_id = m.user_id AND s.month_num = months.m
    )
),
monthly_totals AS (
    SELECT month_num, SUM(sales_amount) AS total_sales
    FROM all_months_filled
    GROUP BY month_num
),
salary_2025 AS (
    SELECT 
        a.manager_id,
        a.manager_name,
        a.month_num,
        a.sales_amount,
        ROUND(CASE WHEN m.total_sales > 0 THEN a.sales_amount * 100 / m.total_sales ELSE 0 END, 2) AS sales_percent,
        50000 AS base_salary,
        500 AS bonus_coefficient,
        ROUND(50000 + (CASE WHEN m.total_sales > 0 THEN a.sales_amount * 100 / m.total_sales ELSE 0 END * 500), 2) AS salary_2025
    FROM all_months_filled a
    INNER JOIN monthly_totals m ON a.month_num = m.month_num
)
SELECT 
    manager_id,
    manager_name,
    month_num,
    sales_amount_2025,
    percent_2025,
    salary_2025,
    forecast_2026
FROM salary_2025
MODEL
    PARTITION BY (manager_id, manager_name)
    
    DIMENSION BY (month_num)
    
    MEASURES (
        sales_amount AS sales_amount_2025,
        sales_percent AS percent_2025,
        salary_2025 AS salary_2025,
        0 AS forecast_2026
    )
    
    RULES AUTOMATIC ORDER (
        forecast_2026[1] = ROUND(salary_2025[1] * 1.05, 2),
        forecast_2026[month_num BETWEEN 2 AND 12] = 
            ROUND(forecast_2026[CV()-1] * 1.005, 2)
    )
ORDER BY manager_name, month_num;




----- Задание 2
WITH tour_price_history AS (
    SELECT 
        tt.id AS tour_type_id,
        tt.name AS tour_type_name,
        t.id AS tour_id,
        t.title AS tour_title,
        t.base_price,
        t.created_at AS price_date
    FROM Tour t
    INNER JOIN TourType tt ON t.tour_type_id = tt.id
    WHERE t.is_active = 1
     -- AND t.id BETWEEN 7 AND 10
           AND t.created_at IS NOT NULL
    ORDER BY tt.id, t.created_at
)
SELECT 
    tour_type_name AS "Вид тура",
    first_up_price AS "Первая цена (рост)",
    down_price AS "Цена падения",
    last_up_price AS "Конечная цена (рост)",
    ROUND((last_up_price - first_up_price) / first_up_price * 100, 2) AS "Общий рост (%)"
FROM tour_price_history
MATCH_RECOGNIZE (
    PARTITION BY tour_type_id, tour_type_name
    ORDER BY price_date
    MEASURES
        FIRST(UP.base_price) AS first_up_price,
        FIRST(DOWN.base_price) AS down_price,
        LAST(UP.base_price) AS last_up_price
    PATTERN (UP DOWN UP)
    DEFINE
        UP AS base_price > PREV(base_price),
        DOWN AS base_price < PREV(base_price)
)
ORDER BY "Вид тура";






















