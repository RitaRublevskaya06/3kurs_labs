using Newtonsoft.Json;
using System.Collections.Concurrent;

namespace BSTU.Results.Collection
{
    public class ResultsCollectionService : IDisposable
    {
        // Потокобезопасная словарь для хранения данных в памяти
        private readonly ConcurrentDictionary<int, string> _results = new ConcurrentDictionary<int, string>();
        private readonly string _filePath;
        private readonly object _fileLock = new object();
        private int _nextId = 1;

        public ResultsCollectionService()
        {
            // Определяем путь к файлу данных в специальной папке приложения
            var appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            var appFolder = Path.Combine(appDataPath, "ASPA0010_1");
            Directory.CreateDirectory(appFolder);
            _filePath = Path.Combine(appFolder, "results.json");

            LoadFromFile();
        }

        // Метод для загрузки данных из файла
        private void LoadFromFile()
        {
            lock (_fileLock)
            {
                if (File.Exists(_filePath))
                {
                    var jsonData = File.ReadAllText(_filePath);
                    var data = JsonConvert.DeserializeObject<Dictionary<int, string>>(jsonData) ?? new Dictionary<int, string>();
                    _results.Clear();
                    foreach (var item in data)
                    {
                        _results[item.Key] = item.Value;
                    }
                    _nextId = _results.Keys.DefaultIfEmpty(0).Max() + 1;
                }
            }
        }

        // Метод для сохранения данных в файл
        private void SaveToFile()
        {
            lock (_fileLock)
            {
                var jsonData = JsonConvert.SerializeObject(_results, Formatting.Indented);
                File.WriteAllText(_filePath, jsonData);
            }
        }

        // Получить все элементы
        public Dictionary<int, string> GetAll()
        {
            return _results.ToDictionary(pair => pair.Key, pair => pair.Value);
        }

        // Получить элемент по ключу
        public string? Get(int key)
        {
            _results.TryGetValue(key, out string? value);
            return value;
        }

        // Добавить новый элемент
        public int Add(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new ArgumentException("Value cannot be null or empty.", nameof(value));
            }

            int newId = _nextId++;
            _results[newId] = value;
            SaveToFile();
            return newId;
        }

        // Обновить существующий элемент
        public bool Update(int key, string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new ArgumentException("Value cannot be null or empty.", nameof(value));
            }

            if (_results.ContainsKey(key))
            {
                _results[key] = value;
                SaveToFile();
                return true;
            }
            return false;
        }

        // Удалить элемент по ключу
        public bool Delete(int key)
        {
            bool isRemoved = _results.TryRemove(key, out _);
            if (isRemoved)
            {
                SaveToFile(); 
            }
            return isRemoved;
        }

        public void Dispose()
        {
           
        }
    }
}