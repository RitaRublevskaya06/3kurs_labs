
// ChildView.cpp: реализация класса CChildView
//

#include "stdafx.h"
#include "framework.h"
#include "lab3.h"
#include "ChildView.h"
#include <math.h>
#define MARGIN_CYCLE 10

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// CChildView

CChildView::CChildView()
{
	Index = 0;
}

CChildView::~CChildView()
{
}


BEGIN_MESSAGE_MAP(CChildView, CWnd)
	ON_WM_PAINT()
	ON_WM_SIZE()
	ON_COMMAND(ID_TESTS_F1, &CChildView::OnTestsF1)
	ON_COMMAND(ID_TESTS_F2, &CChildView::OnTestsF2)
	ON_COMMAND(ID_TESTS_F3, &CChildView::OnTestsF3)
END_MESSAGE_MAP()



// Обработчики сообщений CChildView

BOOL CChildView::PreCreateWindow(CREATESTRUCT& cs) 
{
	if (!CWnd::PreCreateWindow(cs))
		return FALSE;

	cs.dwExStyle |= WS_EX_CLIENTEDGE;
	cs.style &= ~WS_BORDER;
	cs.lpszClass = AfxRegisterWndClass(CS_HREDRAW|CS_VREDRAW|CS_DBLCLKS, 
		::LoadCursor(nullptr, IDC_ARROW), reinterpret_cast<HBRUSH>(COLOR_WINDOW+1), nullptr);

	return TRUE;
}

void CChildView::OnPaint() 
{
	CPaintDC dc(this); // контекст устройства для рисования 
	/*dc.SetMapMode(MM_ANISOTROPIC);*/

	CRect rect;
	GetClientRect(&rect);
	CBrush brush(RGB(255, 255, 255)); // Белый фон
	dc.FillRect(&rect, &brush);

	if (Index == 1 || Index == 2)
	{
		Graph.Draw(dc, 1, 1);
	}
	else if (Index == 3)
	{
		// Перерисовываем восьмиугольник
		OnTestsF3();
	}
}

void CChildView::OnSize(UINT nType, int cx, int cy)
{
	CWnd::OnSize(nType, cx, cy);

	// Обновляем область рисования при изменении размеров окна
	if (Index == 1 || Index == 2)
	{
		// Автоматически изменяем размер области рисования
		int margin = 50;
		RW.SetRect(margin, margin, cx - margin, cy - margin);
		Graph.SetWindowRect(RW);
	}

	Invalidate(); // Перерисовываем
}

double CChildView::MyF1(double x)
{
	double y = sin(x) / x;
	return y;
}



double CChildView::MyF2(double x)
{
	double y = sqrt(abs(x)) * sin(x);
	return y;
}


void CChildView::OnTestsF1() {
	double xL = -3 * pi;
	double xH = -xL;
	double deltaX = pi / 36;
	int n = (xH - xL) / deltaX;
	X.RedimMatrix(n + 1);
	Y.RedimMatrix(n + 1);
	for (int i = 0; i <= n; i++) {
		X(i) = xL + i * deltaX;
		Y(i) = MyF1(X(i));
	}
	PenLine.Set(PS_SOLID, 1, RGB(255, 0, 0));
	PenAxis.Set(PS_SOLID, 2, RGB(0, 0, 255));
	GetClientRect(&RW);
	int margin = 50;
	RW.DeflateRect(margin, margin);
	Graph.SetParams(X, Y, RW);
	Graph.SetPenLine(PenLine);
	Graph.SetPenAxis(PenAxis);
	Index = 1;
	Invalidate();
}

void CChildView::OnTestsF2() {
	double xL = -4 * pi;
	double xH = -xL;
	double deltaX = pi / 36;
	int n = (xH - xL) / deltaX;
	X.RedimMatrix(n + 1);
	Y.RedimMatrix(n + 1);
	for (int i = 0; i <= n; i++) {
		X(i) = xL + i * deltaX;
		Y(i) = MyF2(X(i));
	}
	PenLine.Set(PS_DASHDOT, 3, RGB(255, 0, 0));
	PenAxis.Set(PS_SOLID, 2, RGB(0, 0, 0));
	GetClientRect(&RW);
	int margin = 50;
	RW.DeflateRect(margin, margin);
	Graph.SetParams(X, Y, RW);
	Graph.SetPenLine(PenLine);
	Graph.SetPenAxis(PenAxis);
	Index = 2;
	Invalidate();
}

void CChildView::OnTestsF3() {
    Invalidate();
    Index = 3;
    CPaintDC dc(this);

    // Установка параметров пера для отображения фигуры
    CPen penFigure(PS_SOLID, 3, RGB(255, 0, 0));
    dc.SelectObject(&penFigure);

    // Установка параметров пера для отображения окружности
    CPen penCircle(PS_SOLID, 2, RGB(0, 0, 255));

    // Расчет размеров квадрата
    CRect rect;
    GetClientRect(&rect);
    const int squareSize = min(rect.Width() - MARGIN_CYCLE * 2, rect.Height() - MARGIN_CYCLE * 2);

    // Расчет координат точек восьмиугольника
    const int sides = 8;

    const double radius = squareSize / 2.0;
    const double angle = 360 / sides; // Угол между двумя соседними сторонами восьмиугольника
    const double centerX = rect.left + squareSize / 2.0 + MARGIN_CYCLE; // Координаты центра квадрата
    const double centerY = rect.top + squareSize / 2.0 + MARGIN_CYCLE;
    const double circleRadius = radius; // Радиус окружности, в которую вписан восьмиугольник
    const double circleLeft = centerX - circleRadius;
    const double circleTop = centerY - circleRadius;
    const double circleRight = centerX + circleRadius;
    const double circleBottom = centerY + circleRadius;

    // --- ОКРУЖНОСТЬ ---
    dc.SelectObject(&penCircle);
    dc.Ellipse(circleLeft, circleTop, circleRight, circleBottom);

    // --- ВОСЬМИУГОЛЬНИК ---
    dc.SelectObject(&penFigure);

    const double angleRadians = angle * 3.14159 / 180.0;
    const double shift = (angle / 2.0) * 3.14159 / 180.0;

    double startX = centerX + radius * cos(shift);
    double startY = centerY - radius * sin(shift);
    double currentX = startX;
    double currentY = startY;

    for (int i = 1; i <= sides; i++)
    {
        double nextX = centerX + radius * cos(shift + angleRadians * i);
        double nextY = centerY - radius * sin(shift + angleRadians * i);

        dc.MoveTo((int)currentX, (int)currentY);
        dc.LineTo((int)nextX, (int)nextY);

        currentX = nextX;
        currentY = nextY;
    }

    // Отображение последней стороны восьмиугольника
    dc.MoveTo((int)currentX, (int)currentY);
    dc.LineTo((int)startX, (int)startY);


    //// --- ОСИ КООРДИНАТ ДЛЯ ВОСЬМИУГОЛЬНИКА ---
    //CPen penAxis(PS_SOLID, 2, RGB(0, 0, 0)); // Черные оси
    //dc.SelectObject(&penAxis);

    //// Ось X (горизонтальная) - через центр
    //dc.MoveTo((int)(centerX - radius - 20), (int)centerY);
    //dc.LineTo((int)(centerX + radius + 20), (int)centerY);

    //// Ось Y (вертикальная) - через центр
    //dc.MoveTo((int)centerX, (int)(centerY - radius - 20));
    //dc.LineTo((int)centerX, (int)(centerY + radius + 20));

    //// Стрелки для осей
    //// Стрелка оси X (вправо)
    //dc.MoveTo((int)(centerX + radius + 20), (int)centerY);
    //dc.LineTo((int)(centerX + radius + 10), (int)(centerY - 5));
    //dc.MoveTo((int)(centerX + radius + 20), (int)centerY);
    //dc.LineTo((int)(centerX + radius + 10), (int)(centerY + 5));

    //// Стрелка оси Y (вверх)
    //dc.MoveTo((int)centerX, (int)(centerY - radius - 20));
    //dc.LineTo((int)(centerX - 5), (int)(centerY - radius - 10));
    //dc.MoveTo((int)centerX, (int)(centerY - radius - 20));
    //dc.LineTo((int)(centerX + 5), (int)(centerY - radius - 10));

    //// Подписи осей
    //dc.SetTextColor(RGB(0, 0, 0));
    //dc.SetBkMode(TRANSPARENT);

    //// Подпись оси X
    //dc.TextOutW((int)(centerX + radius + 25), (int)(centerY + 5), L"X");

    //// Подпись оси Y
    //dc.TextOutW((int)(centerX - 15), (int)(centerY - radius - 25), L"Y");

    //// Подпись центра (0,0)
    //dc.TextOutW((int)(centerX + 5), (int)(centerY + 5), L"0");

    //// Деления на осях
    //int tickLength = 5;

    //// Деления на оси X
    //for (int i = -10; i <= 10; i += 5) {
    //    if (i == 0) continue; // Пропускаем центр
    //    double tickX = centerX + (i * radius / 10.0);
    //    dc.MoveTo((int)tickX, (int)(centerY - tickLength));
    //    dc.LineTo((int)tickX, (int)(centerY + tickLength));

    //    // Подписи делений на оси X
    //    CString label;
    //    label.Format(L"%d", i);
    //    dc.TextOutW((int)tickX - 5, (int)(centerY + 10), label);
    //}

    //// Деления на оси Y
    //for (int i = -10; i <= 10; i += 5) {
    //    if (i == 0) continue; // Пропускаем центр
    //    double tickY = centerY - (i * radius / 10.0); // Минус потому что Y в Windows увеличивается вниз
    //    dc.MoveTo((int)(centerX - tickLength), (int)tickY);
    //    dc.LineTo((int)(centerX + tickLength), (int)tickY);

    //    // Подписи делений на оси Y
    //    CString label;
    //    label.Format(L"%d", i);
    //    dc.TextOutW((int)(centerX + 10), (int)tickY - 8, label);
    //}

    //// --- ТОЧКА (0,0) В МИРОВЫХ КООРДИНАТАХ (центр) ---
    //CPen penWorldPoint(PS_SOLID, 2, RGB(0, 0, 0));
    //dc.SelectObject(&penWorldPoint);

    //CBrush brushWorldPoint(RGB(255, 255, 255)); // Красная заливка
    //CBrush* pOldBrush = dc.SelectObject(&brushWorldPoint);

    //// Координаты точки (0,0) в мировых координатах
    //double worldPointX = 0;
    //double worldPointY = 0;

    //// Преобразуем в оконные координаты
    //double worldScreenX = centerX + (worldPointX * radius / 10.0);
    //double worldScreenY = centerY - (worldPointY * radius / 10.0);

    //// Рисуем закрашенный круг в точке (0,0) мировых координат
    //int worldPointRadius = 5;
    //dc.Ellipse((int)(worldScreenX - worldPointRadius),
    //    (int)(worldScreenY - worldPointRadius),
    //    (int)(worldScreenX + worldPointRadius),
    //    (int)(worldScreenY + worldPointRadius));

    //// Подпись мировой точки
    //dc.SetTextColor(RGB(0, 0, 0));
    //CString worldLabel;
    //worldLabel.Format(L"", (int)worldScreenX, (int)worldScreenY);
    //dc.TextOutW((int)worldScreenX + 10, (int)worldScreenY - 10, worldLabel);

    //// --- ТОЧКА (0,0) В ОКОННЫХ КООРДИНАТАХ (левый верхний угол) ---
    //CPen penWindowPoint(PS_SOLID, 2, RGB(0, 0, 0));
    //dc.SelectObject(&penWindowPoint);

    //CBrush brushWindowPoint(RGB(255, 255, 255));
    //dc.SelectObject(&brushWindowPoint);

    // Координаты точки (0,0) в оконных координатах (левый верхний угол)
    //int windowPointX = 0;
    //int windowPointY = 0;

    //int windowPointRadius = 5;
    //dc.Ellipse(windowPointX - windowPointRadius,
    //    windowPointY - windowPointRadius,
    //    windowPointX + windowPointRadius,
    //    windowPointY + windowPointRadius);

    //// Подпись оконной точки
    //dc.SetTextColor(RGB(0, 0, 0));
    //CString windowLabel;
    ////windowLabel.Format(L"Окно: (0,0)");
    //dc.TextOutW(windowPointX + 10, windowPointY + 10, windowLabel);

    //dc.SelectObject(pOldBrush);
}