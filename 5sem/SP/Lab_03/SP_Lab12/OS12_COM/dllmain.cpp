// dllmain.cpp : Defines the entry point for the DLL application.
#include "pch.h"
#include "Registry.h"
#include <fstream>

//HMODULE hRnaCA;
HMODULE hRnaCA = nullptr;
LONG Seq = 0;
std::fstream LogCOM;

ULONG g_Components = 0;
ULONG g_ServerLocks = 0;


BOOL APIENTRY DllMain(HMODULE hModule,
    DWORD  ul_reason_for_call,
    LPVOID lpReserved
)
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
        hRnaCA = hModule;
        LogCOM.open("D:\\Univer\\3_kurs\\5_sem\\SP\\Lab_03\\SP_Lab12\\x64\\Debug\\log.txt", std::ios_base::out);
        //LogCOM.open("log.txt", std::ios_base::out);
        break;
    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
    case DLL_PROCESS_DETACH:
        break;
    }
    return TRUE;
}

