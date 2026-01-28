#define _WINSOCK_DEPRECATED_NO_WARNINGS

#include <iostream>
#include <clocale>
#include <ctime>
#include <string>

#include "stdafx.h"
#include "Winsock2.h"                
#pragma comment(lib, "WS2_32.lib")   

using namespace std;

int main()
{
    setlocale(LC_ALL, "rus");

    SOCKET cC;
    WSADATA wsaData;
    try
    {
        if (WSAStartup(MAKEWORD(2, 0), &wsaData) != 0)
            throw SetErrorMsgText("Startup:", WSAGetLastError());
        if ((cC = socket(AF_INET, SOCK_STREAM, NULL)) == INVALID_SOCKET)
            throw SetErrorMsgText("socket:", WSAGetLastError());

        SOCKADDR_IN serv;
        serv.sin_family = AF_INET;
        serv.sin_port = htons(2000);
        serv.sin_addr.s_addr = INADDR_ANY;

        if (bind(cC, (LPSOCKADDR)&serv, sizeof(serv)) == SOCKET_ERROR)
            throw SetErrorMsgText("bind:", WSAGetLastError());

        if (listen(cC, SOMAXCONN) == SOCKET_ERROR)
            throw SetErrorMsgText("listen:", WSAGetLastError());

        cout << "Сервер запущен и ожидает подключений..." << endl;

        while (true)
        {
            SOCKET cS;
            SOCKADDR_IN clnt;
            memset(&clnt, 0, sizeof(clnt));
            int lclnt = sizeof(clnt);

            if ((cS = accept(cC, (sockaddr*)&clnt, &lclnt)) == INVALID_SOCKET)
                throw SetErrorMsgText("accept:", WSAGetLastError());

            cout << "\n---- Новый клиент подключился ----\n";
            cout << "IP адрес: " << inet_ntoa(clnt.sin_addr) << endl;
            cout << "Порт: " << ntohs(clnt.sin_port) << endl << endl;

            clock_t start, end;
            bool first_message = true;

            while (true)
            {
                char ibuf[50];
                int libuf = 0;

                if ((libuf = recv(cS, ibuf, sizeof(ibuf), NULL)) == SOCKET_ERROR)
                {
                    if (WSAGetLastError() == WSAECONNRESET)
                    {
                        cout << "Клиент отключился неожиданно" << endl;
                        break;
                    }
                    throw SetErrorMsgText("recv: ", WSAGetLastError());
                }

                if (libuf == 0 || strlen(ibuf) == 0)
                {
                    cout << "Клиент завершил соединение" << endl;
                    break;
                }

                if (first_message)
                {
                    start = clock();
                    first_message = false;
                }

                if (send(cS, ibuf, libuf, NULL) == SOCKET_ERROR)
                    throw SetErrorMsgText("send: ", WSAGetLastError());

                cout << "Получено и отправлено обратно: " << ibuf << endl;
            }

            end = clock();
            if (!first_message)
            {
                cout << "Время обмена с клиентом: "
                    << ((double)(end - start) / CLOCKS_PER_SEC) << " c\n";
            }

            cout << "\n---- Клиент отключен ----\n";
            cout << "Ожидание нового подключения...\n";

            if (closesocket(cS) == SOCKET_ERROR)
                throw SetErrorMsgText("closesocket:", WSAGetLastError());
        }
    }
    catch (string errorMsgText)
    {
        cout << endl << errorMsgText;
        if (closesocket(cC) == SOCKET_ERROR)
            cout << SetErrorMsgText("closesocket:", WSAGetLastError());
        if (WSACleanup() == SOCKET_ERROR)
            cout << SetErrorMsgText("Cleanup:", WSAGetLastError());
    }

    cout << endl;
    system("pause");
    return 0;
}