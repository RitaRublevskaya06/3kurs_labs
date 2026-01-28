#include "stdafx.h"

//#define PIPE_NAME L"\\\\.\\pipe\\Tube"

//#define PIPE_NAME L"\\\\192.168.1.100\\pipe\\Tube"
#define PIPE_NAME L"\\\\172.20.10.3\\pipe\\Tube"

int main()
{
    setlocale(LC_ALL, "Rus");
    cout << "ClientNP" << endl;

    HANDLE hPipe;
    DWORD ps;

    try
    {
        if ((hPipe = CreateFile(
            PIPE_NAME,
            GENERIC_READ | GENERIC_WRITE,
            FILE_SHARE_READ | FILE_SHARE_WRITE,
            NULL,
            OPEN_EXISTING,
            NULL,
            NULL)) == INVALID_HANDLE_VALUE)
            throw SetPipeError("createfile:", GetLastError());

        int message_amount = 100;
        char obuf[50];
        for (int i = 1; i <= message_amount; i++)
        {
            string buf = "Hello from ClientNP " + to_string(i);
            if (!WriteFile(hPipe, buf.c_str(), sizeof(buf), &ps, NULL))
                throw SetPipeError("WriteFile: ", GetLastError());

            if (ReadFile(hPipe, obuf, sizeof(obuf), &ps, NULL))
                cout << obuf << endl;
            else
                throw SetPipeError("ReadFile: ", GetLastError());
        }

        CloseHandle(hPipe);
    }
    catch (string ErrorPipeText)
    {
        cout << endl << ErrorPipeText;
    }

}
