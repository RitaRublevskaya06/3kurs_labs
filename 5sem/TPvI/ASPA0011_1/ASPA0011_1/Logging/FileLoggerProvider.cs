using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;

namespace ASPA0011_1.Logging
{
    public class FileLoggerProvider : ILoggerProvider
    {
        private readonly ConcurrentDictionary<string, FileLogger> _loggers = new();
        private readonly string _logFilePath;

        public FileLoggerProvider()
        {
            var logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Logs");
            if (!Directory.Exists(logDirectory))
            {
                Directory.CreateDirectory(logDirectory);
            }
            _logFilePath = Path.Combine(logDirectory, $"aspa-{DateTime.Now:yyyyMMdd}.txt");
        }

        public ILogger CreateLogger(string categoryName)
        {
            return _loggers.GetOrAdd(categoryName, name => new FileLogger(name, _logFilePath));
        }

        public void Dispose()
        {
            _loggers.Clear();
            GC.SuppressFinalize(this);
        }
    }

    public class FileLogger : ILogger
    {
        private readonly string _name;
        private readonly string _filePath;
        private static readonly object _lock = new object();

        public FileLogger(string name, string filePath)
        {
            _name = name;
            _filePath = filePath;
        }

        public IDisposable? BeginScope<TState>(TState state) where TState : notnull
        {
            return null;
        }

        public bool IsEnabled(LogLevel logLevel)
        {
            return logLevel >= LogLevel.Trace;
        }

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            if (!IsEnabled(logLevel))
                return;

            var message = formatter(state, exception);
            if (string.IsNullOrEmpty(message) && exception == null)
                return;

            var logEntry = $"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} [{logLevel,-12}] {_name} - {message}";

            if (exception != null)
            {
                logEntry += $"{Environment.NewLine}{exception}";
            }

            lock (_lock)
            {
                File.AppendAllText(_filePath, logEntry + Environment.NewLine);
            }
        }
    }
}