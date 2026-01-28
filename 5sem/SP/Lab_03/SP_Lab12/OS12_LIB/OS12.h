#pragma once
#define OS12HANDEL void*
#define IERR(s)    std::cout<<"error "<<s<<std::endl


// {C74B7509-B36C-446D-A247-DB1BD7E01FCE}
static const GUID CLSID_CA =
{ 0xc74b7509, 0xb36c, 0x446d, { 0xa2, 0x47, 0xdb, 0x1b, 0xd7, 0xe0, 0x1f, 0xce } };

namespace OS12
{
	OS12HANDEL Init();
	//   if CoCreateInstance(... IID_Unknown)!= succesfull --> throw (int)HRESULT  
	namespace Adder
	{
		double Add(OS12HANDEL h, double x, double y);        // return x+y
		//  if QueryInteface(IID_IAdder) != succesfull -->  throw (int)HRESULT     
		double Sub(OS12HANDEL h, double x, double y);        // return x-y
		//  if QueryInteface(IID_IAdder) != succesfull -->  throw (int)HRESULT
	}
	namespace Multiplier
	{
		double Mul(OS12HANDEL h, double x, double y);        // return x*y
		//  if QueryInteface(IID_IMultiplier) != succesfull -->  throw (int)HRESULT 
		double Div(OS12HANDEL h, double x, double y);        // return x/y
		//  if QueryInteface(IID_IMultiplier) != succesfull -->  throw (int)HRESULT 
	}
	void Dispose(OS12HANDEL h);
}

