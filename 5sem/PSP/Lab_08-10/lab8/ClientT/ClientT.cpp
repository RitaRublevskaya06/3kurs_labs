#include "stdafx.h"
#include <winsock2.h>
#include <ws2tcpip.h>
#include <iostream>
#include <string>
#include <thread>
#include <atomic>
#include <windows.h>
#include <limits>
#pragma comment(lib, "ws2_32.lib")

#define RECONNECT_DELAY_MS 3000

using namespace std;

static std::atomic<bool> g_shutdownRequested(false);
static std::atomic<SOCKET> g_clientSocket(INVALID_SOCKET);

BOOL WINAPI ConsoleHandler(DWORD signal)
{
    if (signal == CTRL_C_EVENT ||
        signal == CTRL_CLOSE_EVENT ||
        signal == CTRL_BREAK_EVENT)
    {
        cout << "\n[!] Received shutdown signal. Sending close to server..." << endl;
        g_shutdownRequested = true;

        SOCKET socket = g_clientSocket.load();
        if (socket != INVALID_SOCKET) {
            const char* closeMsg = "close";
            send(socket, closeMsg, strlen(closeMsg) + 1, 0);

            Sleep(300);
        }

        return TRUE;
    }
    return FALSE;
}

char* get_message(int msg)
{
    switch (msg)
    {
    case 1: return (char*)"Echo";
    case 2: return (char*)"Time";
    case 3: return (char*)"Random";
    case 4: return (char*)"close";
    default: return (char*)"close";
    }
}

void cleanup(SOCKET& socket)
{
    if (socket != INVALID_SOCKET) {
        if (!g_shutdownRequested) {
            const char* closeMsg = "close";
            send(socket, closeMsg, strlen(closeMsg) + 1, 0);
            Sleep(300);
        }

        closesocket(socket);
        socket = INVALID_SOCKET;
        g_clientSocket.store(INVALID_SOCKET);
    }
}

bool sendCloseMessage(SOCKET& socket)
{
    if (socket == INVALID_SOCKET) {
        return false;
    }

    const char* closeMsg = "close";
    int bytesSent = send(socket, closeMsg, strlen(closeMsg) + 1, 0);

    Sleep(300);

    return (bytesSent != SOCKET_ERROR);
}

void connectToServer(SOCKET& cC, addrinfo* result)
{
    bool isConnected = false;

    while (!isConnected && !g_shutdownRequested) {
        for (addrinfo* ptr = result; ptr != NULL; ptr = ptr->ai_next) {
            if (g_shutdownRequested) break;

            cC = socket(ptr->ai_family, ptr->ai_socktype, ptr->ai_protocol);
            if (cC == INVALID_SOCKET) {
                cerr << "Socket creation failed: " << WSAGetLastError() << endl;
                continue;
            }

            if (connect(cC, ptr->ai_addr, (int)ptr->ai_addrlen) == SOCKET_ERROR) {
                cerr << "Connection failed: " << WSAGetLastError() << endl;
                closesocket(cC);
                cC = INVALID_SOCKET;
                continue;
            }

            cout << "Successfully connected to server." << endl;
            isConnected = true;
            g_clientSocket.store(cC);
            break;
        }

        if (!isConnected && !g_shutdownRequested) {
            cerr << "Retrying connection in " << RECONNECT_DELAY_MS / 1000 << " seconds..." << endl;

            for (int i = 0; i < RECONNECT_DELAY_MS / 100 && !g_shutdownRequested; i++) {
                Sleep(100);
            }
        }
    }
}

int _tmain(int argc, char* argv[])
{
    SOCKET cC = INVALID_SOCKET;
    WSADATA wsaData;
    setlocale(0, "rus");

    if (!SetConsoleCtrlHandler(ConsoleHandler, TRUE)) {
        cerr << "Warning: Could not set console control handler" << endl;
    }

    const string PORT = "2000";
    string serverAddress = "10.231.46.219";

    try
    {
        if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0)
            throw string("Startup failed: ") + to_string(WSAGetLastError());

        addrinfo hints = { 0 }, * result = NULL;

        hints.ai_family = AF_INET;
        hints.ai_socktype = SOCK_STREAM;

        int iResult = getaddrinfo(
            (PCSTR)serverAddress.c_str(),
            (PCSTR)PORT.c_str(),
            &hints,
            &result
        );
        if (iResult != 0)
            throw string("getaddrinfo failed: ") + to_string(iResult);

        connectToServer(cC, result);
        freeaddrinfo(result);
        result = NULL;

        if (g_shutdownRequested) {
            throw string("Shutdown requested during connection");
        }

        bool shouldExit = false;
        bool normalClose = false;

        while (!shouldExit && !g_shutdownRequested)
        {
            char message[1024] = { 0 };
            int libuf = 0, lobuf = 0;

            cout << "\nChoose:\n";
            cout << "1 - Echo\n2 - Time\n3 - Random\n4 - close socket\n";

            int service;

            if (g_shutdownRequested) break;

            cin >> service;

            if (cin.fail()) {
                cin.clear();
                cin.ignore(10000, '\n');
                if (g_shutdownRequested) break;
                continue;
            }

            cin.ignore(10000, '\n');

            if (g_shutdownRequested) break;

            string outMessage(get_message(service));

            if ((lobuf = send(cC, outMessage.c_str(), outMessage.length() + 1, 0)) == SOCKET_ERROR)
                throw string("send failed: ") + to_string(WSAGetLastError());

            cout << "Sent: " << outMessage << endl;

            if (service == 4)
            {
                normalClose = true;
                shouldExit = true;
                continue;
            }

            if (service < 1 || service > 4)
            {
                cout << "Invalid service selected. Closing connection." << endl;
                sendCloseMessage(cC);
                shouldExit = true;
                continue;
            }

            if (service == 1)
            {
                cout << "Starting Echo service (200 to 0)..." << endl;

                for (int j = 200; j >= 0 && !g_shutdownRequested; --j)
                {
                    if (g_shutdownRequested) {
                        cout << "\n[!] Shutdown requested. Sending close..." << endl;
                        sendCloseMessage(cC);
                        shouldExit = true;
                        break;
                    }

                    std::this_thread::sleep_for(std::chrono::seconds(1));
                    outMessage = to_string(j);

                    if ((lobuf = send(cC, outMessage.c_str(), outMessage.length() + 1, 0)) == SOCKET_ERROR)
                        throw string("send failed: ") + to_string(WSAGetLastError());

                    cout << "Sent: " << outMessage << endl;

                    memset(message, 0, sizeof(message));

                    if ((libuf = recv(cC, message, sizeof(message) - 1, 0)) <= 0) {
                        cout << "Connection lost" << endl;
                        shouldExit = true;
                        break;
                    }

                    if (strcmp(message, "TimeOUT") == 0 || strstr(message, "TimeOUT") != NULL)
                    {
                        cout << "Server: Service stopped by 3-minute timeout" << endl;
                        shouldExit = true;
                        break;
                    }

                    cout << "Received: ";
                    for (int k = 0; k < libuf && message[k] != '\0'; k++) {
                        cout << message[k];
                    }
                    cout << endl;
                }
            }
            else if (service == 2 || service == 3)
            {
                memset(message, 0, sizeof(message));
                if ((libuf = recv(cC, message, sizeof(message) - 1, 0)) <= 0) {
                    cout << "Connection lost or server closed" << endl;
                    shouldExit = true;
                    continue;
                }

                if (strcmp(message, "TimeOUT") == 0 || strstr(message, "TimeOUT") != NULL)
                {
                    cout << "Server: Service stopped by 3-minute timeout" << endl;
                    shouldExit = true;
                    continue;
                }

                cout << "Received: " << string(message, libuf) << endl;
            }
        }

        if (g_shutdownRequested && !normalClose && cC != INVALID_SOCKET) {
            cout << "\nSending close message to server before exit..." << endl;
            sendCloseMessage(cC);
        }
        else if (!normalClose && cC != INVALID_SOCKET) {
            cout << "Sending close message to server..." << endl;
            sendCloseMessage(cC);
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(500));

        cleanup(cC);
        WSACleanup();

        cout << "\nConnection closed gracefully." << endl;
    }
    catch (const string& errorMsgText)
    {
        cerr << "Error: " << errorMsgText << endl;

        if (cC != INVALID_SOCKET) {
            sendCloseMessage(cC);
            std::this_thread::sleep_for(std::chrono::milliseconds(500));
        }

        cleanup(cC);
        WSACleanup();
    }

    SetConsoleCtrlHandler(ConsoleHandler, FALSE);

    cout << "\nPress any key to exit...";
    system("pause > nul");
    return 0;
}