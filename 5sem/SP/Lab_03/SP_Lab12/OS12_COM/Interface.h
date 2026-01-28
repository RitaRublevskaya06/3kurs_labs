#pragma once
#include <objbase.h>
 
// {C8392CA7-5112-4523-819F-0C6C3B9B3418}
static const GUID IID_IAdder =
{ 0xc8392ca7, 0x5112, 0x4523, { 0x81, 0x9f, 0xc, 0x6c, 0x3b, 0x9b, 0x34, 0x18 } };


interface IAdder : IUnknown
{
	STDMETHOD(Add(const double x, const double y, double& z)) = 0;
	STDMETHOD(Sub(const double x, const double y, double& z)) = 0;
};

// {2C93434A-FCE1-4892-B8E9-908AE148D302}
static const GUID IID_IMultiplier =
{ 0x2c93434a, 0xfce1, 0x4892, { 0xb8, 0xe9, 0x90, 0x8a, 0xe1, 0x48, 0xd3, 0x2 } };

interface IMultiplier : IUnknown
{
	STDMETHOD(Mul(const double x, const double y, double& z)) = 0;
	STDMETHOD(Div(const double x, const double y, double& z)) = 0;
};