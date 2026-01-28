//#define _CRT_SECURE_NO_WARNINGS
#include "pch.h"
#include "Windows.h"
#include <objbase.h>
#include <assert.h>
#include "Registry.h"
#include "SEQLOG.h"

#include "CFactory.h"
#include "CA.h"


BOOL setKeyAndValue(const WCHAR* szKey,         // smw:const char* szKey
	const WCHAR* szSubkey,                      // smw:const char* szSubkey,
	const WCHAR* szValue);                      // smw: const char* szValue


void CLSIDtochar(const CLSID& clsid,            // Convert a CLSID into a char string.
	WCHAR* szCLSID,                             // smw:char* szCLSID,
	int length);

LONG recursiveDeleteKey(HKEY hKeyParent, const WCHAR* szKeyChild); // Delete szKeyChild and all of its descendents.

const int CLSID_STRING_SIZE = 39;


HRESULT RegisterServer(HMODULE hModule, const CLSID& clsid, const WCHAR* szFriendlyName,
	const WCHAR* szVerIndProgID, const WCHAR* szProgID)
{
	WCHAR szModule[512];
	DWORD dwResult = GetModuleFileName(hModule, szModule, sizeof(szModule) / sizeof(WCHAR));


	if (dwResult == 0) {
		return E_FAIL;
	}

	WCHAR szCLSID[CLSID_STRING_SIZE];
	CLSIDtochar(clsid, szCLSID, sizeof(szCLSID));


	WCHAR szKey[264];
	wcscpy_s(szKey, L"CLSID\\");
	wcscat_s(szKey, szCLSID);

	BOOL bSuccess = TRUE;
	
	if (!setKeyAndValue(szKey, NULL, szFriendlyName)) return E_FAIL;
	if (!setKeyAndValue(szKey, L"InprocServer32", szModule)) return E_FAIL;
	if (!setKeyAndValue(szKey, L"ProgID", szProgID)) return E_FAIL;
	if (!setKeyAndValue(szKey, L"VersionIndependentProgID", szVerIndProgID)) return E_FAIL;
	if (!setKeyAndValue(szVerIndProgID, NULL, szFriendlyName)) return E_FAIL;
	if (!setKeyAndValue(szVerIndProgID, L"CLSID", szCLSID)) return E_FAIL;
	if (!setKeyAndValue(szVerIndProgID, L"CurVer", szProgID)) return E_FAIL;
	if (!setKeyAndValue(szProgID, NULL, szFriendlyName)) return E_FAIL;
	if (!setKeyAndValue(szProgID, L"CLSID", szCLSID)) return E_FAIL;

	return S_OK;
}

HRESULT UnregisterServer(const CLSID& clsid,
	const WCHAR* szVerIndProgID,
	const WCHAR* szProgID)

{
	WCHAR szCLSID[CLSID_STRING_SIZE];
	CLSIDtochar(clsid, szCLSID, sizeof(szCLSID));

	WCHAR szKey[264];     //smw szKey[64]
	wcscpy_s(szKey, L"CLSID\\");
	wcscat_s(szKey, szCLSID);

	LONG lResult = recursiveDeleteKey(HKEY_CLASSES_ROOT, szKey);
	assert((lResult == ERROR_SUCCESS) || (lResult == ERROR_FILE_NOT_FOUND)); // Subkey may not exist.
	lResult = recursiveDeleteKey(HKEY_CLASSES_ROOT, szVerIndProgID);
	assert((lResult == ERROR_SUCCESS) || (lResult == ERROR_FILE_NOT_FOUND)); // Subkey may not exist.
	lResult = recursiveDeleteKey(HKEY_CLASSES_ROOT, szProgID);
	assert((lResult == ERROR_SUCCESS) || (lResult == ERROR_FILE_NOT_FOUND)); // Subkey may not exist.

	return S_OK;
}



void CLSIDtochar(const CLSID& clsid,      // Convert a CLSID to a char string.   
	WCHAR* szCLSID,          // smw:char* szCLSID,
	int length)
{
	assert(length >= CLSID_STRING_SIZE);

	LPOLESTR wszCLSID = NULL;
	HRESULT hr = StringFromCLSID(clsid, &wszCLSID);
	assert(SUCCEEDED(hr));
	wcscpy_s(szCLSID, CLSID_STRING_SIZE, wszCLSID);
	CoTaskMemFree(wszCLSID);

}


LONG recursiveDeleteKey(HKEY hKeyParent,           // Parent of key to delete
	const WCHAR* lpszKeyChild)  // Key to delete
{

	HKEY hKeyChild;
	LONG lRes = RegOpenKeyEx(hKeyParent, lpszKeyChild, 0,
		KEY_ALL_ACCESS, &hKeyChild);
	if (lRes != ERROR_SUCCESS)
	{
		return lRes;
	}

	FILETIME time;
	WCHAR szBuffer[256];
	DWORD dwSize = 256;
	while (RegEnumKeyEx(hKeyChild, 0, szBuffer, &dwSize, NULL,
		NULL, NULL, &time) == S_OK)
	{
		lRes = recursiveDeleteKey(hKeyChild, szBuffer);
		if (lRes != ERROR_SUCCESS)
		{
			RegCloseKey(hKeyChild);
			return lRes;
		}
		dwSize = 256;
	}

	RegCloseKey(hKeyChild);
	return RegDeleteKey(hKeyParent, lpszKeyChild);
}


BOOL setKeyAndValue(const WCHAR* szKey, const WCHAR* szSubkey, const WCHAR* szValue)
{
	HKEY hKey;
	WCHAR szKeyBuf[1024];

	wcscpy_s(szKeyBuf, szKey);

	if (szSubkey != NULL)
	{
		wcscat_s(szKeyBuf, L"\\");
		wcscat_s(szKeyBuf, szSubkey);
	}

	
	long lResult = RegCreateKeyEx(HKEY_CLASSES_ROOT,
		szKeyBuf,
		0, NULL, REG_OPTION_NON_VOLATILE,
		KEY_ALL_ACCESS, NULL,
		&hKey, NULL);

	if (lResult != ERROR_SUCCESS)
	{
		return FALSE;
	}

	if (szValue != NULL)
	{
		lResult = RegSetValueEx(hKey, NULL, 0, REG_SZ,
			(BYTE*)szValue,
			2 * wcslen(szValue) + 1);

		if (lResult != ERROR_SUCCESS)
		{
			RegCloseKey(hKey);
			return FALSE;
		}
	}

	RegCloseKey(hKey);

	return TRUE;
}

STDAPI DllInstall(BOOL b, PCWSTR s)
{
	SEQ;
	LOG("DllInstall ", (b) ? "install" : "uninstall");
	return S_OK;
}
STDAPI DllRegisterServer()
{

	SEQ;
	HRESULT rc = RegisterServer(hRnaCA, CLSID_CA, FNAME, VINDX, PRGID);

	LOG("DllRegisterServer rc = ", rc);
	return rc;
}
STDAPI DllUnregisterServer()
{
	SEQ;
	HRESULT rc = UnregisterServer(CLSID_CA, VINDX, PRGID);
	LOG("DllUnRegisterServer rc = ", rc);
	return S_OK;
}
STDAPI DllGetClassObject(REFCLSID rclsid, REFIID riid, LPVOID* ppv)
{
	SEQ;
	LOG("DllGetClassObject", "");

	if (rclsid != CLSID_CA)
	{
		*ppv = NULL;
		return CLASS_E_CLASSNOTAVAILABLE;
	}

	CFactory* pFactory = new CFactory();
	if (pFactory == NULL)
		return E_OUTOFMEMORY;

	HRESULT rc = pFactory->QueryInterface(riid, ppv);
	pFactory->Release();

	LOG("DllGetClassObject rc = ", rc);
	return rc;
}

STDAPI DllCanUnloadNow(void)
{
	SEQ;
	HRESULT rc = (g_Components == 0 && g_ServerLocks == 0) ? S_OK : S_FALSE;
	LOG("DllCanUnloadNow rc = ", rc);
	return rc;
}