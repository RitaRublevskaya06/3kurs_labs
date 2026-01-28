#pragma once
#include <objbase.h>
#include "HT.h"

// {95B65B20-2067-4FEA-93A1-B7344A5EBF94}
static const GUID IID_IHTManipulator =
{ 0x95b65b20, 0x2067, 0x4fea, { 0x93, 0xa1, 0xb7, 0x34, 0x4a, 0x5e, 0xbf, 0x94 } };


interface IHTManipulator : IUnknown
{
	STDMETHOD(Create(HTHANDLE * *handle, int capacity, int secSnapshotInterval, int maxKeyLength, int maxPayloadLength, const wchar_t* fileName)) = 0;
	STDMETHOD(Open(HTHANDLE** handle, const wchar_t* fileName, bool isMapFile = false)) = 0;
	STDMETHOD(Snap(BOOL& rc, HTHANDLE* htHandle)) = 0;
	STDMETHOD(Close(BOOL& rc,const HTHANDLE* htHandle)) = 0;
};


// {D642D305-A637-4A3D-8874-5E9567D2E93C}
static const GUID IID_IHTDataManipulator =
{ 0xd642d305, 0xa637, 0x4a3d, { 0x88, 0x74, 0x5e, 0x95, 0x67, 0xd2, 0xe9, 0x3c } };


interface IHTDataManipulator : IUnknown
{
	STDMETHOD(Get(Element * *resultElement, HTHANDLE * htHandle, const Element * element)) = 0;
	STDMETHOD(Insert(BOOL& rc, HTHANDLE* htHandle, const Element* element)) = 0;
	STDMETHOD(Update(BOOL& rc, HTHANDLE* htHandle, const Element* oldElement, const void* newPayload, int newPayloadLength)) = 0;
	STDMETHOD(Delete(BOOL& rc, HTHANDLE* htHandle, const Element* element)) = 0;
};

// {838684D3-B74D-48D6-A599-EA2278D8D5EA}
static const GUID IID_IElement =
{ 0x838684d3, 0xb74d, 0x48d6, { 0xa5, 0x99, 0xea, 0x22, 0x78, 0xd8, 0xd5, 0xea } };

interface IElement : IUnknown
{
	STDMETHOD(CreateElementGet(Element * *element, const void* key, int keyLength)) = 0;
	STDMETHOD(CreateElementInsert(Element** element, const void* key, int keyLength, const void* payload, int payloadLength)) = 0;
	STDMETHOD(CreateElementUpdate(Element** element, const Element* oldElement, const void* newPayload, int newPayloadLength)) = 0;
};

// {E527B5B8-FFC0-45A5-A119-A980B56BBBC7}
static const GUID IID_IHTUtil =
{ 0xe527b5b8, 0xffc0, 0x45a5, { 0xa1, 0x19, 0xa9, 0x80, 0xb5, 0x6b, 0xbb, 0xc7 } };


interface IHTUtil : IUnknown
{
	STDMETHOD(getLastError(const char** error, const HTHANDLE * htHandle)) = 0;
	STDMETHOD(print(const Element* element)) = 0;
};

