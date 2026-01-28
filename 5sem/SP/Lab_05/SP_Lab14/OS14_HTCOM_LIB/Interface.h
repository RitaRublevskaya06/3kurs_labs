#pragma once
#include <objbase.h>
#include "HT.h"

// {94E41566-EB67-4A29-BFB5-E5C31BC203CF}
static const GUID IID_IHTManipulator =
{ 0x94e41566, 0xeb67, 0x4a29, { 0xbf, 0xb5, 0xe5, 0xc3, 0x1b, 0xc2, 0x3, 0xcf } };

interface IHTManipulator : IUnknown
{
	STDMETHOD(Create(HTHANDLE * *handle, int capacity, int secSnapshotInterval, int maxKeyLength, int maxPayloadLength, const wchar_t* HTUsersGroup, const wchar_t* fileName)) = 0;
	STDMETHOD(Open(HTHANDLE** handle, const wchar_t* fileName, bool isMapFile = false)) = 0;
	STDMETHOD(Open(HTHANDLE** handle, const wchar_t* HTUser, const wchar_t* HTPassword, const wchar_t* fileName, bool isMapFile = false)) = 0;
	STDMETHOD(Snap(BOOL& rc, HTHANDLE* htHandle)) = 0;
	STDMETHOD(Close(BOOL& rc,const HTHANDLE* htHandle)) = 0;
};


// {4F3A51B0-0DCE-46B5-AD69-657CEC1B92AF}
static const GUID IID_IHTDataManipulator =
{ 0x4f3a51b0, 0xdce, 0x46b5, { 0xad, 0x69, 0x65, 0x7c, 0xec, 0x1b, 0x92, 0xaf } };


interface IHTDataManipulator : IUnknown
{
	STDMETHOD(Get(Element * *resultElement, HTHANDLE * htHandle, const Element * element)) = 0;
	STDMETHOD(Insert(BOOL& rc, HTHANDLE* htHandle, const Element* element)) = 0;
	STDMETHOD(Update(BOOL& rc, HTHANDLE* htHandle, const Element* oldElement, const void* newPayload, int newPayloadLength)) = 0;
	STDMETHOD(Delete(BOOL& rc, HTHANDLE* htHandle, const Element* element)) = 0;
};

// {2469A0BB-B711-478D-8270-AED2A83A3D9D}
static const GUID IID_IElement =
{ 0x2469a0bb, 0xb711, 0x478d, { 0x82, 0x70, 0xae, 0xd2, 0xa8, 0x3a, 0x3d, 0x9d } };

interface IElement : IUnknown
{
	STDMETHOD(CreateElementGet(Element * *element, const void* key, int keyLength)) = 0;
	STDMETHOD(CreateElementInsert(Element** element, const void* key, int keyLength, const void* payload, int payloadLength)) = 0;
	STDMETHOD(CreateElementUpdate(Element** element, const Element* oldElement, const void* newPayload, int newPayloadLength)) = 0;
};

// {0E393DD4-97AC-459F-B91E-8776EAC3006B}
static const GUID IID_IHTUtil =
{ 0xe393dd4, 0x97ac, 0x459f, { 0xb9, 0x1e, 0x87, 0x76, 0xea, 0xc3, 0x0, 0x6b } };

interface IHTUtil : IUnknown
{
	STDMETHOD(getLastError(const char** error, const HTHANDLE * htHandle)) = 0;
	STDMETHOD(print(const Element* element)) = 0;
};

