#include "stdafx.h"

#define NAME L"\\\\.\\mailslot\\Box"

int main()
{
    setlocale(LC_ALL, "rus");
    cout << "Mailslot Server" << endl;

    HANDLE hM;
    DWORD rb;
    char rbuf[300];
    DWORD time_waiting = 180000;
    bool flag = true;
    clock_t start, end;

    try
    {
        if ((hM = CreateMailslot(NAME,
            300,
            MAILSLOT_WAIT_FOREVER,
            NULL)) == INVALID_HANDLE_VALUE)
            throw SetErrorMsgText("CreateMailslotError", WSAGetLastError());

        while (true)
        {

            if (ReadFile(hM,
                rbuf,
                sizeof(rbuf),
                &rb,
                NULL))
            {
                cout << rbuf << endl;
                if (flag)
                {
                    start = clock();
                    flag = false;
                }
            }
            else
                throw SetErrorMsgText("ReadFileError", WSAGetLastError());

            if (strcmp(rbuf, "STOP") == 0)
            {
                end = clock();
                cout << "\nВремя обмена: " << ((double)(end - start) / CLK_TCK) << " секунд" << endl;
                flag = true;
            }
        }

        CloseHandle(hM);
    }
    catch (string error)
    {
        cout << endl << error << endl;
    }
}

