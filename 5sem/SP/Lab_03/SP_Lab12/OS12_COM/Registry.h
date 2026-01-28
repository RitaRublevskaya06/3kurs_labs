#pragma once
#include <objbase.h>

// {C74B7509-B36C-446D-A247-DB1BD7E01FCE}
static const GUID CLSID_CA =
{ 0xc74b7509, 0xb36c, 0x446d, { 0xa2, 0x47, 0xdb, 0x1b, 0xd7, 0xe0, 0x1f, 0xce } };

extern HMODULE hRnaCA;
extern ULONG g_Components;
extern ULONG g_ServerLocks;

static LPCWSTR FNAME = L"RMV.OS12.COM";
static LPCWSTR VINDX = L"RMV.OS12.1";
static LPCWSTR PRGID = L"RMV.OS12";

STDAPI DllInstall(BOOL b, PCWSTR s);
STDAPI DllRegisterServer();
STDAPI DllUnregisterServer();
STDAPI DllGetClassObject(REFCLSID rclsid, REFIID riid, LPVOID* ppv);
STDAPI DllCanUnloadNow(void);



HRESULT RegisterServer(HMODULE hModule,            // DLL module handle
	const CLSID& clsid,         // Class ID
	const WCHAR* szFriendlyName, // Friendly Name
	const WCHAR* szVerIndProgID, // Programmatic
	const WCHAR* szProgID);     //   IDs

HRESULT UnregisterServer(const CLSID& clsid,
	const WCHAR* szVerIndProgID,
	const WCHAR* szProgID);