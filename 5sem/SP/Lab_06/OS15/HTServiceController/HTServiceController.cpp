#include <windows.h>
#include <iostream>
#include <string>

// Определение пользовательских команд (должно совпадать с определением в сервисе!)
#define SERVICE_CONTROL_OPEN 128
#define SERVICE_CONTROL_CLOSE 129

// Переименуем main в другой функции, чтобы избежать конфликта
int controller_main(int argc, char* argv[])
{
    if (argc != 2) {
        std::cout << "Usage: HTServiceController <open|close>" << std::endl;
        return 1;
    }

    // Имя сервиса (должно совпадать с именем в сервисе)
    const wchar_t* serviceName = L"OS15_HTService";

    // Открываем Service Control Manager
    SC_HANDLE schSCManager = OpenSCManager(NULL, NULL, SC_MANAGER_CONNECT);
    if (!schSCManager) {
        std::cout << "Failed to open Service Control Manager. Error: " << GetLastError() << std::endl;
        return 1;
    }

    // Открываем сервис с правами на отправку команд
    SC_HANDLE schService = OpenService(schSCManager, serviceName,
        SERVICE_START | SERVICE_STOP | SERVICE_USER_DEFINED_CONTROL);
    if (!schService) {
        std::cout << "Failed to open service. Error: " << GetLastError() << std::endl;
        CloseServiceHandle(schSCManager);
        return 1;
    }

    SERVICE_STATUS serviceStatus;

    // Сначала проверяем, запущен ли сервис
    if (!QueryServiceStatus(schService, &serviceStatus)) {
        std::cout << "Failed to query service status. Error: " << GetLastError() << std::endl;
    }
    else if (serviceStatus.dwCurrentState != SERVICE_RUNNING) {
        std::cout << "Service is not running. Current state: " << serviceStatus.dwCurrentState << std::endl;
        std::cout << "Please start the service first: net start OS15_HTService" << std::endl;
        CloseServiceHandle(schService);
        CloseServiceHandle(schSCManager);
        return 1;
    }

    std::string command = argv[1];

    if (command == "open") {
        // Отправить команду OPEN
        if (ControlService(schService, SERVICE_CONTROL_OPEN, &serviceStatus)) {
            std::cout << "Open command sent successfully!" << std::endl;
        }
        else {
            std::cout << "Failed to send open command. Error: " << GetLastError() << std::endl;
        }
    }
    else if (command == "close") {
        // Отправить команду CLOSE  
        if (ControlService(schService, SERVICE_CONTROL_CLOSE, &serviceStatus)) {
            std::cout << "Close command sent successfully!" << std::endl;
        }
        else {
            std::cout << "Failed to send close command. Error: " << GetLastError() << std::endl;
        }
    }
    else {
        std::cout << "Unknown command. Use 'open' or 'close'." << std::endl;
    }

    CloseServiceHandle(schService);
    CloseServiceHandle(schSCManager);

    return 0;
}

// Объединяющая функция main
int main(int argc, char* argv[])
{
    // Проверяем, нужно ли запустить контроллер или сервис
    // Например, если есть аргументы командной строки - запускаем контроллер
    if (argc > 1)
    {
        return controller_main(argc, argv);
    }
    else
    {
        // Иначе запускаем сервис (но это не будет работать как сервис)
        // Сервис должен запускаться через Service Control Manager
        std::cout << "This is a Windows Service. It should be installed and started via:" << std::endl;
        std::cout << "  sc create OS15_HTService binPath= \"path\\to\\OS15_HTService.exe\"" << std::endl;
        std::cout << "  net start OS15_HTService" << std::endl;
        std::cout << std::endl;
        std::cout << "To control the service, use:" << std::endl;
        std::cout << "  OS15_HTService.exe open   - to open HT storage" << std::endl;
        std::cout << "  OS15_HTService.exe close  - to close HT storage" << std::endl;
        return 0;
    }
}