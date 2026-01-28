#pragma once
#include <objbase.h>


// {90AB5FD3-15E6-499E-8A87-EFC3D90540BC}
static const GUID CLSID_CA =
{ 0x90ab5fd3, 0x15e6, 0x499e, { 0x8a, 0x87, 0xef, 0xc3, 0xd9, 0x5, 0x40, 0xbc } };



extern HMODULE hRnaCA;

static LPCWSTR FNAME = L"RMV.OS14.HTCOM";
static LPCWSTR VINDX = L"RMV.OS14.1";
static LPCWSTR PRGID = L"RMV.OS14";

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