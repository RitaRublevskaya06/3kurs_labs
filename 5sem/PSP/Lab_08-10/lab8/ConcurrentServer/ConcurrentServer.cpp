#include "stdafx.h"
#include "Winsock2.h"
#include "Errors.h"
#include <string>
#include <list>
#include <time.h>
#include <iostream>

#define AS_SQ 10
using namespace std;

SOCKET sS;
int serverPort;
int timeOutDisconnect = 30;
int timeOutBetwenRequest = 40;
char dllName[50];
char namedPipeName[10];

volatile long connectionCount = 0;
volatile long sayNoCount = 0;
volatile long successConnections = 0;
volatile long currentActiveConnections = 0;
volatile long timeOutCount = 0;

int timerMinutes = 3;  

HANDLE hAcceptServer, hConsolePipe, hGarbageCleaner, hDispatchServer, hResponseServer;
HANDLE hClientConnectedEvent = CreateEvent(NULL,
	FALSE,
	FALSE,
	L"ClientConnected");

DWORD WINAPI AcceptServer(LPVOID pPrm);
DWORD WINAPI ConsolePipe(LPVOID pPrm);
DWORD WINAPI GarbageCleaner(LPVOID pPrm);
DWORD WINAPI DispatchServer(LPVOID pPrm);
DWORD WINAPI ResponseServer(LPVOID pPrm);

CRITICAL_SECTION scListContact;

enum TalkersCommand
{
	START, STOP, EXIT, STATISTICS, WAIT, SHUTDOWN, GETCOMMAND, LOAD_LIB, UNLOAD_LIB
};
volatile TalkersCommand  previousCommand = GETCOMMAND;

#pragma region Contact
struct Contact
{
	enum TE
	{
		EMPTY,
		ACCEPT,
		CONTACT
	}    type;
	enum ST 
	{
		WORK,
		ABORT,
		TIMEOUT,
		FINISH
	}   sthread;

	SOCKET      s; 
	SOCKADDR_IN prms; 
	int         lprms; 
	HANDLE      hthread;
	HANDLE      htimer; 
	HANDLE		serverHThtead;

	char msg[50];
	char srvname[15];

	Contact(TE t = EMPTY, const char* namesrv = "")
	{
		ZeroMemory(&prms, sizeof(SOCKADDR_IN));
		lprms = sizeof(SOCKADDR_IN);
		type = t;
		strcpy(srvname, namesrv);
		msg[0] = 0x00;
		htimer = NULL;
	};

	void SetST(ST sth, const char* m = "")
	{
		sthread = sth;
		strcpy(msg, m);
	}
};
typedef list<Contact> ListContact;
#pragma endregion

ListContact contacts;

bool  GetRequestFromClient(char* name, short port, SOCKADDR_IN* from, int* flen);

bool AcceptCycle(int sq)
{
	bool rc = false;
	Contact c(Contact::ACCEPT, "EchoServer");
	while (sq-- > 0 && !rc)
	{
		if ((c.s = accept(sS, (sockaddr*)&c.prms, &c.lprms)) == INVALID_SOCKET)
		{
			if (WSAGetLastError() != WSAEWOULDBLOCK)
				throw  SetErrorMsgText("accept:", WSAGetLastError());
		}
		else
		{
			rc = true;
			EnterCriticalSection(&scListContact);
			contacts.push_front(c);
			LeaveCriticalSection(&scListContact);
			printf_s("Client %s:%d connected\n", inet_ntoa(c.prms.sin_addr), htons(c.prms.sin_port));

			char welcomeMsg[100];
			sprintf(welcomeMsg, "Welcome! You are connected to server %s:%d",
				inet_ntoa(c.prms.sin_addr), htons(c.prms.sin_port));
			send(c.s, welcomeMsg, strlen(welcomeMsg) + 1, NULL);

			InterlockedIncrement(&connectionCount);
		}
	}
	return rc;
};

void openSocket()
{
	SOCKADDR_IN serv;
	u_long nonblk = 1;

	if ((sS = socket(AF_INET, SOCK_STREAM, NULL)) == INVALID_SOCKET) {
		throw SetErrorMsgText("socket:", WSAGetLastError());
	}

	int opt = 1;
	if (setsockopt(sS, SOL_SOCKET, SO_REUSEADDR, (char*)&opt, sizeof(opt)) == SOCKET_ERROR) {
		closesocket(sS);
		throw SetErrorMsgText("setsockopt (SO_REUSEADDR):", WSAGetLastError());
	}

	serv.sin_family = AF_INET;
	serv.sin_port = htons(serverPort);
	serv.sin_addr.s_addr = INADDR_ANY;

	if (bind(sS, (LPSOCKADDR)&serv, sizeof(serv)) == SOCKET_ERROR) {
		closesocket(sS);
		throw SetErrorMsgText("bind:", WSAGetLastError());
	}

	if (listen(sS, SOMAXCONN) == SOCKET_ERROR) {
		closesocket(sS);
		throw SetErrorMsgText("listen:", WSAGetLastError());
	}

	if (ioctlsocket(sS, FIONBIO, &nonblk) == SOCKET_ERROR) {
		closesocket(sS);
		throw SetErrorMsgText("ioctlsocket (FIONBIO):", WSAGetLastError());
	}
}

void closeSocket()
{
	if (closesocket(sS) == SOCKET_ERROR)
		throw  SetErrorMsgText("closesocket:", WSAGetLastError());
}

void CommandsCycle(TalkersCommand& cmd)
{
	int  sq = 0;
	while (cmd != EXIT)
	{
		switch (cmd)
		{
		case START: cmd = GETCOMMAND;
			if (previousCommand != START)
			{
				sq = AS_SQ;
				puts("Start command");
				openSocket();
				previousCommand = START;
			}
			else puts("start already in use");
			break;
		case STOP:  cmd = GETCOMMAND;
			if (previousCommand != STOP)
			{
				sq = 0;
				puts("Stop command");
				closeSocket();
				previousCommand = STOP;
			}
			else puts("stop already in use");

			break;
		case WAIT:  cmd = GETCOMMAND;
			sq = 0;
			puts("Wait command\n" \
				"socket closed for waiting other clients");
			closeSocket();
			while (contacts.size() != 0) {
				printf("size of contacts %d\n", contacts.size());
				SleepEx(3000, TRUE);
			}
			cmd = START;
			previousCommand = WAIT;
			puts("socket is open");

			break;
		case SHUTDOWN:
			sq = 0;
			puts("SHUTDOWN command\n" \
				"........shutting down...........");
			closeSocket();
			while (contacts.size() != 0) {
				printf("size of contacts %d\n", contacts.size());
				SleepEx(3000, TRUE);
			}
			printf("size of contacts %d\n", contacts.size());
			cmd = EXIT;
			break;
		case GETCOMMAND:  cmd = GETCOMMAND;

			break;
		};
		if (cmd != STOP)
		{

			if (AcceptCycle(sq))
			{
				cmd = GETCOMMAND;
				SetEvent(hClientConnectedEvent);
			}
			else SleepEx(0, TRUE);
		}
	};
};

DWORD WINAPI AcceptServer(LPVOID pPrm)
{
	DWORD rc = 0;
	WSADATA wsaData;
	try
	{
		if (WSAStartup(MAKEWORD(2, 0), &wsaData) != 0)
			throw  SetErrorMsgText("Startup:", WSAGetLastError());

		CommandsCycle(*((TalkersCommand*)pPrm));

		if (WSACleanup() == SOCKET_ERROR)
			throw SetErrorMsgText("Cleanup:", WSAGetLastError());
	}
	catch (string errorMsgText)
	{
		printf("\n%s\n", errorMsgText.c_str());
	}
	puts("shutdown acceptServer");
	ExitThread(rc);
}

TalkersCommand set_param(char* param)
{
	if (!strcmp(param, "start")) return START;
	if (!strcmp(param, "stop")) return STOP;
	if (!strcmp(param, "exit")) return EXIT;
	if (!strcmp(param, "wait")) return WAIT;
	if (!strcmp(param, "shutdown")) return SHUTDOWN;
	if (!strcmp(param, "statistics")) return STATISTICS;
	if (!strcmp(param, "getcommand")) return GETCOMMAND;
	if (strstr(param, "UNLOAD_LIB")) return UNLOAD_LIB;
	if (strstr(param, "LOAD_LIB")) return LOAD_LIB;
}
typedef void* (*FUNCTION)(char*, LPVOID);
FUNCTION ts;

volatile bool is_load_library = false;
std::list<HMODULE> list_of_dlls;
std::list<FUNCTION> list_of_functions;

HMODULE st;
SOCKET sSUDP;

DWORD WINAPI ConsolePipe(LPVOID pPrm)
{
	DWORD rc = 0;
	char rbuf[100];
	DWORD dwRead, dwWrite;
	HANDLE hPipe;
	try
	{
		char namedPipeConnectionString[50];
		sprintf(namedPipeConnectionString, "\\\\.\\pipe\\%s", namedPipeName);
		if ((hPipe = CreateNamedPipeA(namedPipeConnectionString,
			PIPE_ACCESS_DUPLEX,
			PIPE_TYPE_MESSAGE | PIPE_WAIT,
			1, NULL, NULL,
			INFINITE, NULL)) == INVALID_HANDLE_VALUE)
			throw SetPipeError("create:", GetLastError());
		if (!ConnectNamedPipe(hPipe, NULL))
			throw SetPipeError("connect:", GetLastError());
		TalkersCommand& param = *((TalkersCommand*)pPrm);

		while (param != EXIT)
		{
			puts("Connecting to Named Pipe Client ...");
			ConnectNamedPipe(hPipe, NULL);
			while (ReadFile(hPipe, rbuf, sizeof(rbuf), &dwRead, NULL))
			{
				printf("main client message:  %s\n", rbuf);
				param = set_param(rbuf);
				if (param == LOAD_LIB)
				{
					is_load_library = true;
					EnterCriticalSection(&scListContact);
					list_of_dlls.push_front(LoadLibraryA(strstr(rbuf, "Win")));
					list_of_functions.push_front((FUNCTION)GetProcAddress(list_of_dlls.front(), "SSS"));
					LeaveCriticalSection(&scListContact);
				}
				else if (param == UNLOAD_LIB)
				{
					is_load_library = false;
					EnterCriticalSection(&scListContact);
					list_of_dlls.pop_front();
					list_of_functions.pop_front();
					LeaveCriticalSection(&scListContact);
				}
				if (param == STATISTICS)
				{
					char sendStastistics[200];
					sprintf(sendStastistics, "\nStatistics\n"\
						"count of connectings :    %d\n" \
						"count of denides:        %d\n" \
						"success end:             %d\n" \
						"count of active connections : %d\n" \
						"", connectionCount, sayNoCount, successConnections, contacts.size());
					WriteFile(hPipe, sendStastistics, sizeof(sendStastistics), &dwWrite, NULL);
				}

				if (param != STATISTICS)
					WriteFile(hPipe, rbuf, strlen(rbuf) + 1, &dwWrite, NULL);
				if (param == EXIT || param == SHUTDOWN)
				{
					break;
				}
			}
			DisconnectNamedPipe(hPipe);
			if (param == EXIT || param == SHUTDOWN)
			{
				break;
			}
		}
	}
	catch (string ErrorPipeText)
	{
		printf("\n%s\n", ErrorPipeText.c_str());
		return -1;
	}
	CloseHandle(hPipe);
	puts("shutdown ConsolePipe");
	ExitThread(rc);
}

DWORD WINAPI GarbageCleaner(LPVOID pPrm)
{
	DWORD rc = 0;
	while (*((TalkersCommand*)pPrm) != EXIT)
	{
		int listSize = 0;
		int howMuchClean = 0;
		if (contacts.size() != 0)
		{
			LARGE_INTEGER liDueTime;

			liDueTime.QuadPart = -((LONGLONG)timerMinutes * 60 * 10000000LL);


			for (auto i = contacts.begin(); i != contacts.end(); )
			{
				EnterCriticalSection(&scListContact);
				if (i->type == i->EMPTY)
				{
					if (i->sthread == i->FINISH)
						InterlockedIncrement(&successConnections);
					if (i->sthread == i->ABORT || i->sthread == i->TIMEOUT)
						InterlockedIncrement(&sayNoCount);
					
					if (i->s != INVALID_SOCKET) {
						char goodbyeMsg[100];
						sprintf(goodbyeMsg, "Server: You have been disconnected. Reason: %s",
							(i->sthread == i->FINISH) ? "normal" :
							(i->sthread == i->TIMEOUT) ? "timeout" : "error");
						send(i->s, goodbyeMsg, strlen(goodbyeMsg) + 1, NULL);
					}

					i = contacts.erase(i);
					howMuchClean++;
				}
				else
				{
					++i;
				}
				LeaveCriticalSection(&scListContact);
			}
		}
		SleepEx(1000, TRUE);
	}
	puts("shutdown garbageCleaner");
	ExitThread(rc);
}

void CALLBACK ASWTimer(LPVOID Prm, DWORD, DWORD)
{
	printf("\n--- ASWTimer: 3-minute timeout reached ---\n");
	Contact* contact = (Contact*)(Prm);

	printf("Service: %s, Client: %s:%d\n",
		contact->srvname,
		inet_ntoa(contact->prms.sin_addr),
		htons(contact->prms.sin_port));

	if (contact->s != INVALID_SOCKET) {
		int sendResult = send(contact->s, "TimeOUT", strlen("TimeOUT") + 1, NULL);
		if (sendResult == SOCKET_ERROR) {
			printf("Failed to send TimeOUT to client %s, socket error: %d\n",
				contact->srvname, WSAGetLastError());
		}
		else {
			printf("Sent TimeOUT to client %s (3-minute timeout)\n", contact->srvname);
		}
	}

	if (contact->serverHThtead != NULL) {
		printf("Terminating service thread for %s\n", contact->srvname);
		TerminateThread(contact->serverHThtead, 0);
	}

	EnterCriticalSection(&scListContact);

	if (contact->htimer != NULL) {
		CancelWaitableTimer(contact->htimer);
		CloseHandle(contact->htimer);
		contact->htimer = NULL;
		printf("Timer cancelled and handle closed\n");
	}

	contact->type = contact->EMPTY;
	contact->sthread = contact->TIMEOUT;
	LeaveCriticalSection(&scListContact);

	printf("--- ASWTimer completed ---\n\n");
}

DWORD WINAPI DispatchServer(LPVOID pPrm)
{
	DWORD rc = 0;
	TalkersCommand& command = *(TalkersCommand*)pPrm;
	while (command != EXIT)
	{
		if (command == STOP) continue;

		WaitForSingleObject(hClientConnectedEvent, INFINITE);
		ResetEvent(hClientConnectedEvent);

		while (true)
		{
			for (auto i = contacts.begin(); i != contacts.end(); i++)
			{
				if (i->type == i->ACCEPT)
				{
					char serviceType[10];
					if (recv(i->s, serviceType, sizeof(serviceType), NULL) < 1)
						continue;

					cout << "New command - " << serviceType << endl;

					strcpy(i->msg, serviceType);

					if (!strcmp(i->msg, "close"))
					{
						if ((send(i->s, "echo: close", strlen("echo: close") + 1, NULL)) == SOCKET_ERROR)
							throw  SetErrorMsgText("send:", WSAGetLastError());
						i->sthread = i->FINISH;
						i->type = i->EMPTY;
						continue;
					}
					if (strcmp(i->msg, "Echo") && strcmp(i->msg, "Time") && strcmp(i->msg, "Random"))
					{
						if ((send(i->s, "ErrorInquiry", strlen("ErrorInquiry") + 1, NULL)) == SOCKET_ERROR)
							throw  SetErrorMsgText("send:", WSAGetLastError());
						i->sthread = i->ABORT;
						i->type = i->EMPTY;
						if (closesocket(i->s) == SOCKET_ERROR)
							throw  SetErrorMsgText("closesocket:", WSAGetLastError());
					}
					else
					{
						i->type = i->CONTACT;
						i->hthread = hAcceptServer;
						i->serverHThtead = ts(serviceType, (LPVOID) & (*i));

						printf("Creating timer for service %s (client %s:%d)\n",
							serviceType,
							inet_ntoa(i->prms.sin_addr),
							htons(i->prms.sin_port));

						i->htimer = CreateWaitableTimer(NULL, TRUE, NULL);
						if (i->htimer == NULL) {
							DWORD error = GetLastError();
							printf("Failed to create timer for service %s, error: %lu\n",
								serviceType, error);
						}
						else {
							LARGE_INTEGER liDueTime;
						
							liDueTime.QuadPart = -((LONGLONG)timerMinutes * 60 * 10000000LL); 

							printf("Setting timer for %d seconds for service %s\n",
								timerMinutes * 60, serviceType);

							if (!SetWaitableTimer(i->htimer, &liDueTime, 0, ASWTimer, &(*i), FALSE)) {
								DWORD error = GetLastError();
								printf("Failed to set timer for service %s, error: %lu\n",
									serviceType, error);
								CloseHandle(i->htimer);
								i->htimer = NULL;
							}
							else {
								printf("Timer successfully set for service %s\n", serviceType);
							}
						}

						SleepEx(0, TRUE);
					}
				}
			}
			SleepEx(200, TRUE);
		}
	}
	puts("shutdown dispatchServer");
	ExitThread(rc);
}

bool PutAnswerToClient(char* name, sockaddr* to, int* lto)
{
	char msg[] = "You can connect to server ";
	if ((sendto(sSUDP, msg, sizeof(msg) + 1, NULL, to, *lto)) == SOCKET_ERROR)
		throw  SetErrorMsgText("sendto:", WSAGetLastError());
	return false;
}

bool GetRequestFromClient(char* name, short port, SOCKADDR_IN* from, int* flen)
{
	SOCKADDR_IN clnt;
	int lc = sizeof(clnt);
	ZeroMemory(&clnt, lc);
	char ibuf[500];
	int  lb = 0;
	int optval = 1;
	int TimeOut = 10;
	setsockopt(sSUDP, SOL_SOCKET, SO_BROADCAST, (char*)&optval, sizeof(int));
	setsockopt(sSUDP, SOL_SOCKET, SO_RCVTIMEO, (char*)&TimeOut, sizeof(TimeOut));
	while (true)
	{
		if ((lb = recvfrom(sSUDP, ibuf, sizeof(ibuf), NULL, (sockaddr*)&clnt, &lc)) == SOCKET_ERROR)
			return false;

		ibuf[lb] = '\0';
		cout << endl << ibuf << endl;
		if (!strcmp(name, ibuf))
		{
			*from = clnt;
			*flen = lc;
			return true;
		}
		puts("\nbad name");
	}
}

DWORD WINAPI ResponseServer(LPVOID pPrm)
{
	DWORD rc = 0;
	WSADATA wsaData;
	SOCKADDR_IN serv;

	if (WSAStartup(MAKEWORD(2, 0), &wsaData) != 0)
		throw  SetErrorMsgText("Startup:", WSAGetLastError());

	if ((sSUDP = socket(AF_INET, SOCK_DGRAM, NULL)) == INVALID_SOCKET)
		throw  SetErrorMsgText("socket:", WSAGetLastError());

	serv.sin_family = AF_INET;
	serv.sin_port = htons(serverPort);
	serv.sin_addr.s_addr = INADDR_ANY;

	if (bind(sSUDP, (LPSOCKADDR)&serv, sizeof(serv)) == SOCKET_ERROR)
		throw  SetErrorMsgText("bind:", WSAGetLastError());

	SOCKADDR_IN from;
	int lc = sizeof(from);
	ZeroMemory(&from, lc);
	int numberOfClients = 0;

	while (*(TalkersCommand*)pPrm != EXIT)
	{
		try
		{
			if (GetRequestFromClient((char*)"Hello", serverPort, &from, &lc))
			{
				printf("Connected Client: %d, port: %d, address: %s\n",
					++numberOfClients, htons(from.sin_port), inet_ntoa(from.sin_addr));
				PutAnswerToClient((char*)"Hello", (sockaddr*)&from, &lc);
			}
		}
		catch (string errorMsgText)
		{
			printf("\n%s", errorMsgText.c_str());
		}
	}

	if (closesocket(sSUDP) == SOCKET_ERROR)
		throw  SetErrorMsgText("closesocket:", WSAGetLastError());
	if (WSACleanup() == SOCKET_ERROR)
		throw  SetErrorMsgText("Cleanup:", WSAGetLastError());

	ExitThread(rc);
}

int main(int argc, char* argv[])
{

	serverPort = 2000;
	strcpy(dllName, "ServiceLibrary.dll");
	strcpy(namedPipeName, "Tube");
	timerMinutes = 3;

	if (argc >= 2) serverPort = atoi(argv[1]);
	if (argc >= 3) strcpy(dllName, argv[2]);
	if (argc >= 4) strcpy(namedPipeName, argv[3]);
	if (argc >= 5) timerMinutes = atoi(argv[4]);

	printf("Server Configuration:\n");
	printf("  Port: %d\n", serverPort);
	printf("  DLL: %s\n", dllName);
	printf("  Named Pipe: %s\n", namedPipeName);
	printf("  Timer: %d minutes\n", timerMinutes);

	st = LoadLibraryA(dllName);
	if (st == NULL) {
		printf("Failed to load DLL: %s, error: %lu\n", dllName, GetLastError());
		return 1;
	}

	ts = (HANDLE(*)(char*, LPVOID))GetProcAddress(st, "SSS");
	if (ts == NULL) {
		printf("Failed to get SSS function from DLL, error: %lu\n", GetLastError());
		FreeLibrary(st);
		return 1;
	}

	printf("DLL loaded successfully\n");

	volatile TalkersCommand  cmd = START;

	InitializeCriticalSection(&scListContact);

	hAcceptServer = CreateThread(NULL, NULL, AcceptServer, (LPVOID)&cmd, NULL, NULL);
	hConsolePipe = CreateThread(NULL, NULL, ConsolePipe, (LPVOID)&cmd, NULL, NULL);
	hGarbageCleaner = CreateThread(NULL, NULL, GarbageCleaner, (LPVOID)&cmd, NULL, NULL);
	hDispatchServer = CreateThread(NULL, NULL, DispatchServer, (LPVOID)&cmd, NULL, NULL);
	hResponseServer = CreateThread(NULL, NULL, ResponseServer, (LPVOID)&cmd, NULL, NULL);

	SetThreadPriority(hGarbageCleaner, THREAD_PRIORITY_BELOW_NORMAL);
	SetThreadPriority(hDispatchServer, THREAD_PRIORITY_NORMAL);
	SetThreadPriority(hConsolePipe, THREAD_PRIORITY_NORMAL);
	SetThreadPriority(hResponseServer, THREAD_PRIORITY_NORMAL);
	SetThreadPriority(hAcceptServer, THREAD_PRIORITY_HIGHEST);

	WaitForSingleObject(hAcceptServer, INFINITE);
	CloseHandle(hAcceptServer);

	TerminateThread(hConsolePipe, 0);
	CloseHandle(hConsolePipe);

	WaitForSingleObject(hGarbageCleaner, INFINITE);
	CloseHandle(hGarbageCleaner);

	TerminateThread(hDispatchServer, 0);
	puts("shutdown dispatchServer");

	TerminateThread(hResponseServer, 0);
	puts("shutdown responseServer");

	CloseHandle(hDispatchServer);
	CloseHandle(hResponseServer);

	DeleteCriticalSection(&scListContact);
	FreeLibrary(st);

	printf("Server shutdown complete\n");
	return 0;
}