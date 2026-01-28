#define _WINSOCK_DEPRECATED_NO_WARNINGS

#include <iostream>
#include <clocale>
#include <ctime>
#include <string>

#include "ErrorMsgtext.h"
#include "Winsock2.h"
#pragma comment(lib, "WS2_32.lib")

using namespace std;

int main()
{
    setlocale(LC_ALL, "rus");
    WSADATA wsaData;
    SOCKET cC;

    try
    {
        if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0)
            throw SetErrorMsgText("Startup: ", WSAGetLastError());

        if ((cC = socket(AF_INET, SOCK_DGRAM, NULL)) == INVALID_SOCKET)
            throw SetErrorMsgText("socket: ", WSAGetLastError());

        SOCKADDR_IN serv;
        serv.sin_family = AF_INET;
        serv.sin_port = htons(2000);

        string serverIP;
        cout << "Введите IP-адрес сервера: ";
        cin >> serverIP;
        serv.sin_addr.s_addr = inet_addr(serverIP.c_str());

        if (serv.sin_addr.s_addr == INADDR_NONE)
        {
            throw "Неверный IP-адрес!";
        }

        SOCKADDR_IN from;
        int lfrom = sizeof(from);
        char ibuf[1024];
        int messageCount;

        cout << "=== ДЕМОНСТРАЦИЯ БЕЗ ПОТЕРЬ ПАКЕТОВ ===" << endl;
        cout << "Введите количество сообщений: ";
        cin >> messageCount;

        clock_t start = clock();

        for (int i = 1; i <= messageCount; i++)
        {
            string obuf = "Сообщение_" + to_string(i);

            if (sendto(cC, obuf.c_str(), obuf.length() + 1, NULL,
                (SOCKADDR*)&serv, sizeof(serv)) == SOCKET_ERROR)
            {
                throw SetErrorMsgText("sendto: ", WSAGetLastError());
            }

            cout << "Отправлено: " << obuf << endl;

            memset(ibuf, 0, sizeof(ibuf));
            int lb = recvfrom(cC, ibuf, sizeof(ibuf), NULL, (SOCKADDR*)&from, &lfrom);

            if (lb == SOCKET_ERROR)
            {
                throw SetErrorMsgText("recvfrom: ", WSAGetLastError());
            }

            cout << "Получено от сервера: " << ibuf << endl;

            cout << "Ожидание 1 секунду..." << endl;
            Sleep(1000);
            cout << "----------------------------------------" << endl;
        }

        clock_t end = clock();

        cout << "\n=== РЕЗУЛЬТАТЫ ===" << endl;
        cout << "Всего отправлено: " << messageCount << " сообщений" << endl;
        cout << "Всего получено ответов: " << messageCount << " ответов" << endl;
        cout << "Время обмена: " << (static_cast<double>(end - start) / CLOCKS_PER_SEC) << " секунд" << endl;
        cout << "Процент успешной доставки: 100%" << endl;

        if (closesocket(cC) == SOCKET_ERROR)
            throw SetErrorMsgText("closesocket: ", WSAGetLastError());
        if (WSACleanup() == SOCKET_ERROR)
            throw SetErrorMsgText("Cleanup: ", WSAGetLastError());
    }
    catch (string errorMsgText)
    {
        cout << endl << errorMsgText;
    }
    catch (const char* msg)
    {
        cout << endl << msg;
    }

    system("pause");
    return 0;
}