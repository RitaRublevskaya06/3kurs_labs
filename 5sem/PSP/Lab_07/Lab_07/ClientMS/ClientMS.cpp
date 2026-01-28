#include "stdafx.h"

#define NAME L"\\\\.\\mailslot\\Box"

int main()
{
	setlocale(LC_ALL, "rus");
	cout << "Mailslot Client" << endl;

	HANDLE hM;
	DWORD wb;
	char obuf[50];
	try
	{
		if ((hM = CreateFile(NAME,
			GENERIC_WRITE,
			FILE_SHARE_READ,
			NULL,
			OPEN_EXISTING,
			NULL, NULL)) == INVALID_HANDLE_VALUE)
			throw SetErrorMsgText("CreateFileError", WSAGetLastError());

		for (int i = 0; i < 30; i++)
		{
			string obufstr = "Hello from Client " + to_string(i + 1);
			strcpy_s(obuf, obufstr.c_str());
			if (!WriteFile(hM,
				obuf,
				sizeof(obuf),
				&wb,
				NULL))
				throw SetErrorMsgText("ReadFileError", WSAGetLastError());
		}

		strcpy_s(obuf, "STOP");
		if (!WriteFile(hM, obuf, sizeof(obuf), &wb, NULL))
			throw SetErrorMsgText("ReadFileError", WSAGetLastError());
		CloseHandle(hM);
	}
	catch (string error)
	{
		cout << endl << error << endl;
	}
}
