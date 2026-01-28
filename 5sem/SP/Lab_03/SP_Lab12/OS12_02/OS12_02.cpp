#include <objbase.h>
#include <iostream>
#include <iomanip>
#include "../OS12_COM/Interface.h"

// {C74B7509-B36C-446D-A247-DB1BD7E01FCE}
static const GUID CLSID_CA =
{ 0xc74b7509, 0xb36c, 0x446d, { 0xa2, 0x47, 0xdb, 0x1b, 0xd7, 0xe0, 0x1f, 0xce } };


#define IERR(s)    std::cout<<"error "<<s<<std::endl
#define IRES(s,r)  std::cout<<s<<r<<std::endl

IAdder* pIAdder = nullptr;
IMultiplier* pMultiplier = nullptr;

int main()
{
	IUnknown* pIUnknown = NULL;
	HRESULT hr = CoInitialize(NULL);
	if (FAILED(hr))
	{
		std::cout << "CoInitialize failed: 0x" << std::hex << hr << std::endl;
		return -1;
	}
	HRESULT hr0 = CoCreateInstance(CLSID_CA, NULL, CLSCTX_INPROC_SERVER, IID_IUnknown, (void**)&pIUnknown);
	if (SUCCEEDED(hr0))
	{
		std::cout << "CoCreateInstance succeeded" << std::endl;
		if (SUCCEEDED(pIUnknown->QueryInterface(IID_IAdder, (void**)&pIAdder)))
		{
			{
				double z = 0.0;
				if (!SUCCEEDED(pIAdder->Add(2.0, 3.0, z)))  IERR("IAdder::Add");
				else IRES("IAdder::Add = ", z);
			}
			{
				double z = 0.0;
				if (!SUCCEEDED(pIAdder->Sub(2.0, 3.0, z)))  IERR("IAdder::Sub");
				else IRES("IAdder::Sub = ", z);
			}
			if (SUCCEEDED(pIAdder->QueryInterface(IID_IMultiplier, (void**)&pMultiplier)))
			{
				{
					double z = 0.0;
					if (!SUCCEEDED(pMultiplier->Mul(2.0, 3.0, z))) IERR("IMultiplier::Mul");
					else IRES("Multiplier::Mul = ", z);
				}
				{
					double z = 0.0;
					if (!SUCCEEDED(pMultiplier->Div(2.0, 3.0, z))) IERR("IMultiplier::Div");
					else IRES("IMultiplier::Div = ", z);
				}
				if (SUCCEEDED(pMultiplier->QueryInterface(IID_IAdder, (void**)&pIAdder)))
				{
					double z = 0.0;
					if (!SUCCEEDED(pIAdder->Add(2.0, 3.0, z))) IERR("IAdder::Add");
					else IRES("IAdder::Add = ", z);
					pIAdder->Release();
				}
				else  IERR("IMultiplier->IAdder");
				pMultiplier->Release();
			}
			else IERR("IAdder->IMultiplier");
			pIAdder->Release();
		}
		else IERR("IAdder");
	}
	else
	{
		std::cout << "CoCreateInstance error: 0x" << std::hex << hr0 << std::endl;

		if (hr0 == REGDB_E_CLASSNOTREG)
			std::cout << "Class not registered" << std::endl;
		else if (hr0 == CLASS_E_CLASSNOTAVAILABLE)
			std::cout << "Class not available" << std::endl;
		else if (hr0 == E_NOINTERFACE)
			std::cout << "No interface" << std::endl;
		else if (hr0 == E_OUTOFMEMORY)
			std::cout << "Out of memory" << std::endl;
	}

	if (pIUnknown)
		pIUnknown->Release();

	CoUninitialize();
	return 0;
}