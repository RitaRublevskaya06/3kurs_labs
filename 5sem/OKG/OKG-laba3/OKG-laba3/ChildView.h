
// ChildView.h: интерфейс класса CChildView
//


#pragma once
#include "CMatrix.h"
#include "LibChart2D.h"

// Окно CChildView

class CChildView : public CWnd
{
// Создание
public:
	CChildView();

// Атрибуты
public:
	int Index;
	CMatrix X;
	CMatrix Y;
	CMatrix K;
	CRect RW;
	CRectD RS;
	CPlot2D Graph;
	CMyPen PenLine;
	CMyPen PenAxis;

// Операции
public:
	double MyF1(double x);
	double MyF2(double x);
// Переопределение
	protected:
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);

// Реализация
public:
	virtual ~CChildView();

	// Созданные функции схемы сообщений
protected:
	afx_msg void OnPaint();
	afx_msg void OnSize(UINT nType, int cx, int cy);
	DECLARE_MESSAGE_MAP()
public:
	afx_msg void OnTestsF1();
	afx_msg void OnTestsF2();
	afx_msg void OnTestsF3();
};

