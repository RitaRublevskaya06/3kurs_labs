#pragma once
#include <objbase.h>


// {9F93B756-134E-4301-822C-63BED0DA5AC1}
static const GUID CLSID_CA =
{ 0x9f93b756, 0x134e, 0x4301, { 0x82, 0x2c, 0x63, 0xbe, 0xd0, 0xda, 0x5a, 0xc1 } };

extern HMODULE hRnaCA;

static LPCWSTR FNAME = L"RNA.OS13.HTCOM";
static LPCWSTR VINDX = L"RNA.OS13.1";
static LPCWSTR PRGID = L"RNA.OS13";

STDAPI DllInstall(BOOL b, PCWSTR s);
STDAPI DllRegisterServer();
STDAPI DllUnregisterServer();


HRESULT RegisterServer(HMODULE hModule,            // DLL module handle
	const CLSID& clsid,         // Class ID
	const WCHAR* szFriendlyName, // Friendly Name
	const WCHAR* szVerIndProgID, // Programmatic
	const WCHAR* szProgID);     //   IDs

HRESULT UnregisterServer(const CLSID& clsid,
	const WCHAR* szVerIndProgID,
	const WCHAR* szProgID);