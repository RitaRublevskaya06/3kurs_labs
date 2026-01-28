#include "HT.h"

using namespace std;

int main()
{
	HT::HTHANDLE* ht = nullptr;
	try
	{
		ht = HT::Create(1000, 3, 10, 256, L"./storage/HTexample.ht");
		if (ht)
			cout << "-- create: success" << endl;
		else
			throw "-- create: error";
	
		if (HT::Insert(ht, new HT::Element("name", 4, "Vova", 4)))
			cout << "-- insert: success" << endl;
		else
			throw "-- insert: error";

		HT::Element* hte = HT::Get(ht, new HT::Element("name", 4));
		if (hte)
			cout << "-- get: success" << endl;
		else
			throw "-- get: error";
	
		HT::print(hte);

		if (HT::Update(ht, hte, "Rita", 4))
			cout << "-- update: success" << endl;
		else
			throw "-- update: error";

		if (HT::Snap(ht))
			cout << "-- snapSync: success" << endl;
		else
			throw "-- snap: error";

		hte = HT::Get(ht, new HT::Element("name", 4));
		if (hte)
			cout << "-- get: success" << endl;
		else
			throw "-- get: error";

		HT::print(hte);

		SleepEx(3000, TRUE);	

		if (HT::Delete(ht, hte))
			cout << "-- remove: success" << endl;
		else
			throw "-- remove: error";

		hte = HT::Get(ht, new HT::Element("name", 4));
		if (hte)
			cout << "-- get: success" << endl;
		else
			throw "-- get: error";
	}
	catch (const char* msg)
	{
		cout << msg << endl;
	
		if (ht != nullptr)
			cout << HT::GetLastError(ht) << endl;
	}

	try
	{
		if (ht != nullptr)
			if (HT::Close(ht))
				cout << "-- close: success" << endl;
			else
				throw "-- close: error";
	}
	catch (const char* msg)
	{
		cout << msg << endl;
	}
}