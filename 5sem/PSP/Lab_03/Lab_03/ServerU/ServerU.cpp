#define _WINSOCK_DEPRECATED_NO_WARNINGS

#include <iostream>
#include <clocale>
#include <ctime>
#include <string>

#include "ErrorMsgText.h"
#include "Winsock2.h"
#pragma comment(lib, "WS2_32.lib")

using namespace std;

int main()
{
    setlocale(LC_ALL, "rus");

    WSADATA wsaData;
    SOCKET sS;
    SOCKADDR_IN serv;

    serv.sin_family = AF_INET;
    serv.sin_port = htons(2000);
    serv.sin_addr.s_addr = INADDR_ANY;

    try
    {
        if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0)
            throw SetErrorMsgText("Startup: ", WSAGetLastError());

        if ((sS = socket(AF_INET, SOCK_DGRAM, NULL)) == INVALID_SOCKET)
            throw SetErrorMsgText("socket: ", WSAGetLastError());

        if (bind(sS, (LPSOCKADDR)&serv, sizeof(serv)) == SOCKET_ERROR)
            throw SetErrorMsgText("bind: ", WSAGetLastError());

        SOCKADDR_IN clientInfo;
        int lc = sizeof(clientInfo), lb = 0;
        char ibuf[1024];
        int packetCounter = 0;

        cout << "=== СЕРВЕР БЕЗ ПОТЕРЬ ПАКЕТОВ ===" << endl;
        cout << "Сервер запущен. Ожидание сообщений..." << endl << endl;

        while (true)
        {
            lb = recvfrom(sS, ibuf, sizeof(ibuf), NULL, (sockaddr*)&clientInfo, &lc);

            if (lb == SOCKET_ERROR)
            {
                throw SetErrorMsgText("recvfrom: ", WSAGetLastError());
            }

            packetCounter++;
            cout << "Получен пакет #" << packetCounter << ": " << ibuf << endl;

            cout << "Обработка пакета..." << endl;

            string obuf = "Ответ: " + string(ibuf);
            if (sendto(sS, obuf.c_str(), obuf.length() + 1, NULL,
                (sockaddr*)&clientInfo, lc) == SOCKET_ERROR)
            {
                throw SetErrorMsgText("sendto: ", WSAGetLastError());
            }

            cout << "Отправлен ответ" << endl << endl;
        }

        if (closesocket(sS) == SOCKET_ERROR)
            throw SetErrorMsgText("closesocket: ", WSAGetLastError());
        if (WSACleanup() == SOCKET_ERROR)
            throw SetErrorMsgText("Cleanup: ", WSAGetLastError());
    }
    catch (string errorMsgText)
    {
        cout << endl << errorMsgText;
    }

    system("pause");
    return 0;
}