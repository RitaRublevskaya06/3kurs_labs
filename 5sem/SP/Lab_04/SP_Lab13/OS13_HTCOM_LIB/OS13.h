#pragma once
#include "pch.h"
#include "HT.h"
#define OS13HANDEL void*
#define IERR(s)    std::cout<<"error "<<s<<std::endl

// {9F93B756-134E-4301-822C-63BED0DA5AC1}
static const GUID CLSID_CA =
{ 0x9f93b756, 0x134e, 0x4301, { 0x82, 0x2c, 0x63, 0xbe, 0xd0, 0xda, 0x5a, 0xc1 } };

namespace OS13
{
	OS13HANDEL Init();
	namespace Manipulator
	{
		HTHANDLE* Create(OS13HANDEL h, int capacity, int secSnapshotInterval, int maxKeyLength, int maxPayloadLength, const wchar_t* fileName);
		HTHANDLE* Open(OS13HANDEL h, const wchar_t* fileName, bool isMapFile = false);
		BOOL Snap(OS13HANDEL h, HTHANDLE* htHandle);
		BOOL Close(OS13HANDEL h, const HTHANDLE* htHandle);
	}
	namespace DataManipulator
	{
		Element* Get(OS13HANDEL h, HTHANDLE* htHandle, const Element* element);
		BOOL Insert(OS13HANDEL h, HTHANDLE* htHandle, const Element* element);
		BOOL Update(OS13HANDEL h, HTHANDLE* htHandle, const Element* oldElement, const void* newPayload, int newPayloadLength);
		BOOL Delete(OS13HANDEL h, HTHANDLE* htHandle, const Element* element);
	}
	namespace HTElement
	{
		Element* CreateElementGet(OS13HANDEL h, const void* key, int keyLength);
		Element* CreateElementInsert(OS13HANDEL h, const void* key, int keyLength, const void* payload, int payloadLength);
		Element* CreateElementUpdate(OS13HANDEL h, const Element* oldElement, const void* newPayload, int newPayloadLength);
	}
	namespace Utils
	{
		const char* getLastError(OS13HANDEL h, const HTHANDLE* htHandle);
		void print(OS13HANDEL h, const Element* element);
	}
	void Dispose(OS13HANDEL h);
}

