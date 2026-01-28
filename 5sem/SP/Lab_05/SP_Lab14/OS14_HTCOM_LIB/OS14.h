#pragma once
#include "pch.h"
#include "HT.h"
#define OS14HANDEL void*
#define IERR(s)    std::cout<<"error "<<s<<std::endl

// {90AB5FD3-15E6-499E-8A87-EFC3D90540BC}
static const GUID CLSID_CA =
{ 0x90ab5fd3, 0x15e6, 0x499e, { 0x8a, 0x87, 0xef, 0xc3, 0xd9, 0x5, 0x40, 0xbc } };

namespace OS14
{
	OS14HANDEL Init();
	namespace Manipulator
	{
		HTHANDLE* Create(OS14HANDEL h, int capacity, int secSnapshotInterval, int maxKeyLength, int maxPayloadLength, const wchar_t* HTUsersGroup, const wchar_t* fileName);
		HTHANDLE* Open(OS14HANDEL h, const wchar_t* fileName, bool isMapFile = false);
		HTHANDLE* Open(OS14HANDEL h, const wchar_t* HTUser, const wchar_t* HTPassword, const wchar_t* fileName, bool isMapFile = false);
		BOOL Snap(OS14HANDEL h, HTHANDLE* htHandle);
		BOOL Close(OS14HANDEL h, const HTHANDLE* htHandle);
	}
	namespace DataManipulator
	{
		Element* Get(OS14HANDEL h, HTHANDLE* htHandle, const Element* element);
		BOOL Insert(OS14HANDEL h, HTHANDLE* htHandle, const Element* element);
		BOOL Update(OS14HANDEL h, HTHANDLE* htHandle, const Element* oldElement, const void* newPayload, int newPayloadLength);
		BOOL Delete(OS14HANDEL h, HTHANDLE* htHandle, const Element* element);
	}
	namespace HTElement
	{
		Element* CreateElementGet(OS14HANDEL h, const void* key, int keyLength);
		Element* CreateElementInsert(OS14HANDEL h, const void* key, int keyLength, const void* payload, int payloadLength);
		Element* CreateElementUpdate(OS14HANDEL h, const Element* oldElement, const void* newPayload, int newPayloadLength);
	}
	namespace Utils
	{
		const char* getLastError(OS14HANDEL h, const HTHANDLE* htHandle);
		void print(OS14HANDEL h, const Element* element);
	}
	void Dispose(OS14HANDEL h);
}

