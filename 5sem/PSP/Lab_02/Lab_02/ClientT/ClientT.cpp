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

    SOCKET sS;
    WSADATA wsaData;
    try
    {
        if (WSAStartup(MAKEWORD(2, 0), &wsaData) != 0)
            throw SetErrorMsgText("Startup:", WSAGetLastError());
        if ((sS = socket(AF_INET, SOCK_STREAM, NULL)) == INVALID_SOCKET)
            throw SetErrorMsgText("socket:", WSAGetLastError());

        SOCKADDR_IN serv;
        serv.sin_family = AF_INET;
        serv.sin_port = htons(2000);
        serv.sin_addr.s_addr = inet_addr("10.239.113.219");
        //serv.sin_addr.s_addr = inet_addr("127.0.0.1");

        if ((connect(sS, (sockaddr*)&serv, sizeof(serv))) == SOCKET_ERROR)
            throw SetErrorMsgText("connect:", WSAGetLastError());

        char ibuf[50];
        int libuf = 0, lobuf = 0;

        int message_amount;
        cout << "Введите количество сообщений: ";
        cin >> message_amount;

        const clock_t start = clock();

        for (int i = 1; i <= message_amount; i++)
        {
            string obuf = "Hello from Client " + to_string(i);

            if ((lobuf = send(sS, obuf.c_str(), obuf.length() + 1, NULL)) == SOCKET_ERROR)
                throw SetErrorMsgText("send: ", WSAGetLastError());

            if ((libuf = recv(sS, ibuf, sizeof(ibuf), NULL)) == SOCKET_ERROR)
                throw SetErrorMsgText("recv: ", WSAGetLastError());

            if (libuf == 0) break; 

            cout << "Получено от сервера: " << ibuf << endl;
        }

        string exit_msg = "";
        if ((lobuf = send(sS, exit_msg.c_str(), 1, NULL)) == SOCKET_ERROR)
            throw SetErrorMsgText("send: ", WSAGetLastError());

        const clock_t end = clock();

        cout << "Время обмена " << message_amount << " сообщениями: "
            << (static_cast<double>(end - start) / CLOCKS_PER_SEC) << " c\n";

        if (closesocket(sS) == SOCKET_ERROR)
            throw SetErrorMsgText("closesocket:", WSAGetLastError());
        if (WSACleanup() == SOCKET_ERROR)
            throw SetErrorMsgText("Cleanup:", WSAGetLastError());
    }
    catch (string errorMsgText)
    {
        cout << endl << errorMsgText;
    }

    cout << endl;
    system("pause");
    return 0;
}