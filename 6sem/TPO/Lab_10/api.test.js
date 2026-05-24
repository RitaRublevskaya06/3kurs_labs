const axios = require('axios');

const API_URL = 'https://jsonplaceholder.typicode.com';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('Лабораторная работа 10: Тестирование API', () => {
  
  describe('1. Модульное тестирование методов API', () => {
    
    describe('GET /posts - позитивные тесты', () => {
      test('должен вернуть список постов с кодом 200', async () => {
        const response = await axios.get(`${API_URL}/posts`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
      });

      test('должен вернуть конкретный пост по ID', async () => {
        const response = await axios.get(`${API_URL}/posts/1`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('id', 1);
        expect(response.data).toHaveProperty('title');
        expect(response.data).toHaveProperty('body');
      });

      test('должен фильтровать посты по userId', async () => {
        const response = await axios.get(`${API_URL}/posts?userId=1`);
        expect(response.status).toBe(200);
        expect(response.data.every(post => post.userId === 1)).toBe(true);
      });
    });

    describe('GET /posts - негативные тесты', () => {
      test('должен вернуть 404 для несуществующего поста', async () => {
        try {
          await axios.get(`${API_URL}/posts/99999`);
        } catch (error) {
          expect(error.response.status).toBe(404);
        }
      });
    });
  });

  describe('2. Интеграционное тестирование CRUD для /posts', () => {
    
    let createdPostId;

    // CREATE - создание поста
    test('CREATE: должен создать новый пост и вернуть 201', async () => {
      const newPost = {
        title: 'Тестовый пост',
        body: 'Содержимое тестового поста для лабораторной работы',
        userId: 1
      };

      const response = await axios.post(`${API_URL}/posts`, newPost, {
        headers: { 'Content-Type': 'application/json' }
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.title).toBe(newPost.title);
      expect(response.data.body).toBe(newPost.body);
      
      createdPostId = response.data.id;
      console.log(`Создан пост с ID: ${createdPostId}`);
    });

    // READ - чтение существующего поста
    test('READ: должен получить существующий пост по ID=1', async () => {
      const response = await axios.get(`${API_URL}/posts/1`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', 1);
      expect(response.data).toHaveProperty('title');
    });

    // UPDATE - обновление существующего поста
    test('UPDATE: должен обновить данные существующего поста', async () => {
      const updatedData = {
        title: 'Обновленный заголовок',
        body: 'Обновленное содержимое поста',
        userId: 1
      };

      const response = await axios.put(`${API_URL}/posts/1`, updatedData);
      expect(response.status).toBe(200);
      expect(response.data.title).toBe(updatedData.title);
      expect(response.data.body).toBe(updatedData.body);
    });

    // DELETE - удаление поста
    test('DELETE: должен удалить пост', async () => {
      const response = await axios.delete(`${API_URL}/posts/1`);
      expect(response.status).toBe(200);
    });
  });

  describe('3. Тестирование обработки ошибок', () => {
    
    test('пустое тело запроса должно вернуть ошибку', async () => {
      try {
        await axios.post(`${API_URL}/posts`, null);
      } catch (error) {
        expect([400, 500]).toContain(error.response?.status);
      }
    });

    test('несуществующая конечная точка', async () => {
      try {
        await axios.get(`${API_URL}/invalid-endpoint-12345`);
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('4. Тестирование валидации входных данных', () => {
    
    test('слишком длинная строка в поле - API должен обработать запрос', async () => {
      const longString = 'A'.repeat(10000);
      const postData = {
        title: longString,
        body: 'Normal body',
        userId: 1
      };

      const response = await axios.post(`${API_URL}/posts`, postData);
      expect(response.status).toBe(201);
    });

    test('отсутствие обязательного поля userId - проверяем что API обрабатывает запрос', async () => {
      const incompleteData = {
        title: 'Missing userId field',
        body: 'Some body'
      };

      try {
        const response = await axios.post(`${API_URL}/posts`, incompleteData);
        expect(response.status).toBe(201);
      } catch (error) {
        expect([400, 422]).toContain(error.response?.status);
      }
    });
  });

  describe('5. Тестирование пагинации', () => {
    
    test('пагинация с параметрами _page и _limit', async () => {
      const page = 2;
      const limit = 5;
      const response = await axios.get(`${API_URL}/posts?_page=${page}&_limit=${limit}`);
      
      expect(response.status).toBe(200);
      expect(response.data.length).toBeLessThanOrEqual(limit);
      console.log(`Получено ${response.data.length} записей из ${limit} запрошенных`);
    });

    test('страница за пределами диапазона должна вернуть пустой массив', async () => {
      const response = await axios.get(`${API_URL}/posts?_page=999&_limit=10`);
      expect(response.status).toBe(200);
      expect(response.data.length).toBe(0);
    });

    test('пагинация с параметрами start и end', async () => {
      const response = await axios.get(`${API_URL}/posts?_start=5&_end=10`);
      expect(response.status).toBe(200);
      expect(response.data.length).toBe(5);
    });
  });

  describe('6. Тестирование API пользователей /users', () => {
    
    test('CREATE: создать нового пользователя', async () => {
      const testUser = {
        name: 'Тестовый Пользователь',
        username: 'testuser',
        email: 'test@example.com',
        phone: '123-456-7890'
      };
      const response = await axios.post(`${API_URL}/users`, testUser);
      expect(response.status).toBe(201);
      expect(response.data).toMatchObject(testUser);
    });

    test('READ: получить список пользователей', async () => {
      const response = await axios.get(`${API_URL}/users`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      console.log(`Получено ${response.data.length} пользователей`);
    });

    test('READ: получить пользователя по ID', async () => {
      const response = await axios.get(`${API_URL}/users/1`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', 1);
      expect(response.data).toHaveProperty('name');
      expect(response.data).toHaveProperty('email');
    });

    test('UPDATE: обновить email пользователя', async () => {
      const newEmail = 'updated@example.com';
      const response = await axios.patch(`${API_URL}/users/1`, { email: newEmail });
      expect(response.status).toBe(200);
      expect(response.data.email).toBe(newEmail);
    });
  });

  describe('7. Дополнительные тесты комментариев /comments', () => {
    
    test('получить комментарии к посту', async () => {
      const postId = 1;
      const response = await axios.get(`${API_URL}/comments?postId=${postId}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.every(comment => comment.postId === postId)).toBe(true);
      console.log(`Получено ${response.data.length} комментариев к посту ${postId}`);
    });

    test('создать новый комментарий', async () => {
      const newComment = {
        name: 'Тестовый комментарий',
        email: 'commenter@example.com',
        body: 'Содержимое комментария',
        postId: 1
      };

      const response = await axios.post(`${API_URL}/comments`, newComment);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.body).toBe(newComment.body);
      console.log(`Создан комментарий с ID: ${response.data.id}`);
    });

    test('получить комментарий по ID', async () => {
      const response = await axios.get(`${API_URL}/comments/1`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', 1);
      expect(response.data).toHaveProperty('name');
    });
  });

  describe('8. Тестирование заголовков запросов', () => {
    
    test('запрос с кастомными заголовками', async () => {
      const response = await axios.get(`${API_URL}/posts/1`, {
        headers: {
          'Accept': 'application/json',
          'X-Custom-Header': 'test-value'
        }
      });
      expect(response.status).toBe(200);
    });

    test('запрос с неправильным Content-Type', async () => {
      try {
        const response = await axios.post(`${API_URL}/posts`, 
          { title: 'Test' },
          { headers: { 'Content-Type': 'text/plain' } }
        );
        expect([200, 201, 400, 415]).toContain(response.status);
      } catch (error) {
        expect([400, 415]).toContain(error.response?.status);
      }
    });
  });
});

afterAll(() => {
  console.log('\nВсе тесты API завершены!');
  console.log('Отчет: http://jsonplaceholder.typicode.com - тестовое API');
  console.log('Примечание: API не сохраняет реально созданные данные, только симулирует ответы');
});