#include "LibChart2D.h"


CString FormatPi(double value)
{
    const double eps = 1e-6;

    double k = value / pi;
    int ki = (int)round(k);

    CString s;

    if (fabs(k) < eps)
        return L"0";

    if (fabs(k - ki) < eps)
    {
        if (ki == 1)  return L"π";
        if (ki == -1) return L"-π";

        CString t;
        t.Format(L"%dπ", ki);
        return t;
    }

    CString t;
    t.Format(L"%.2fπ", k);
    return t;
}
//--

CRectD::CRectD(double l, double t, double r, double b)
{
    left = l;
    top = t;
    right = r;
    bottom = b;
}
//------------------------------------------------------------------------------
void CRectD::SetRectD(double l, double t, double r, double b)
{
    left = l;
    top = t;
    right = r;
    bottom = b;
}

//------------------------------------------------------------------------------
CSizeD CRectD::SizeD()
{
    CSizeD cz;
    cz.cx = fabs(right - left);	// Ширина прямоугольной области
    cz.cy = fabs(top - bottom);	// Высота прямоугольной области
    return cz;
}

//------------------------------------------------------------------------------

CMatrix SpaceToWindow(CRectD& RS, CRect& RW)
// Функция обновлена
// Возвращает матрицу пересчета координат из мировых в оконные
// RS - область в мировых координатах - double
// RW - область в оконных координатах - int
{
    CMatrix M(3, 3);
    CSize sz = RW.Size();	 // Размер области в ОКНЕ
    int dwx = sz.cx;	     // Ширина
    int dwy = sz.cy;	     // Высота
    CSizeD szd = RS.SizeD(); // Размер области в МИРОВЫХ координатах

    double dsx = szd.cx;    // Ширина в мировых координатах
    double dsy = szd.cy;    // Высота в мировых координатах

    double kx = (double)dwx / dsx;   // Масштаб по x
    double ky = (double)dwy / dsy;   // Масштаб по y

    M(0, 0) = kx;  M(0, 1) = 0;    M(0, 2) = (double)RW.left - kx * RS.left;			// Обновлено
    M(1, 0) = 0;   M(1, 1) = -ky;  M(1, 2) = (double)RW.bottom + ky * RS.bottom;		// Обновлено
    M(2, 0) = 0;   M(2, 1) = 0;    M(2, 2) = 1;
    return M;
}

//------------------------------------------------------------------------------

void SetMyMode(CDC& dc, CRectD& RS, CRect& RW)  //MFC
// Устанавливает режим отображения MM_ANISOTROPIC и его параметры
// dc - ссылка на класс CDC MFC
// RS -  область в мировых координатах - int
// RW -	 Область в оконных координатах - int  
{
    double dsx = RS.right - RS.left;
    double dsy = RS.top - RS.bottom;
    double xsL = RS.left;
    double ysL = RS.bottom;

    int dwx = RW.right - RW.left;
    int dwy = RW.bottom - RW.top;
    int xwL = RW.left;
    int ywH = RW.bottom;

    dc.SetMapMode(MM_ANISOTROPIC);
    dc.SetWindowExt((int)dsx, (int)dsy);
    dc.SetViewportExt(dwx, -dwy);
    dc.SetWindowOrg((int)xsL, (int)ysL);
    dc.SetViewportOrg(xwL, ywH);
}

/////////////////////// CLASS CPlot2D //////////////////////////////////

void CPlot2D::SetParams(CMatrix& XX, CMatrix& YY, CRect& RWX)
// XX - вектор данных по X 
// YY - вектор данных по Y 
// RWX - область в окне 
{
    int nRowsX = XX.rows();
    int nRowsY = YY.rows();
    if (nRowsX != nRowsY)
    {
        //char* error="SetParams: неправильные размеры массивов данных";
        //MessageBox(NULL,error,"Ошибка",MB_ICONSTOP);

        TCHAR* error = _T("SetParams: неправильные размеры массивов данных");
        MessageBox(NULL, error, _T("Ошибка"), MB_ICONSTOP);

        exit(1);
    }
    X.RedimMatrix(nRowsX);
    Y.RedimMatrix(nRowsY);
    X = XX;
    Y = YY;
    double x_max = X.MaxElement();
    double x_min = X.MinElement();
    double y_max = Y.MaxElement();
    double y_min = Y.MinElement();
    RS.SetRectD(x_min, y_max, x_max, y_min);		// Область в мировой СК
    RW.SetRect(RWX.left, RWX.top, RWX.right, RWX.bottom);	// Область в окне
    K = SpaceToWindow(RS, RW);			// Матрица пересчета координат
}

//-------------------------------------------------------------------


void CPlot2D::SetWindowRect(CRect& RWX)
{
    RW.SetRect(RWX.left, RWX.top, RWX.right, RWX.bottom);	// Область в окне
    K = SpaceToWindow(RS, RW);			// Матрица пересчета координат
}

//--------------------------------------------------------------------

void CPlot2D::SetPenLine(CMyPen& PLine)
// Установка параметров пера для линии графика
{
    PenLine.PenStyle = PLine.PenStyle;
    PenLine.PenWidth = PLine.PenWidth;
    PenLine.PenColor = PLine.PenColor;
}

//-------------------------------------------------------------------
void CPlot2D::SetPenAxis(CMyPen& PAxis)
// Установка параметров пера для линий осей 
{
    PenAxis.PenStyle = PAxis.PenStyle;
    PenAxis.PenWidth = PAxis.PenWidth;
    PenAxis.PenColor = PAxis.PenColor;
}

//-----------------------------------------------------------------
void CPlot2D::GetRS(CRectD& RS)
// RS - структура, куда записываются параметры области графика
{
    RS.left = (this->RS).left;
    RS.top = (this->RS).top;
    RS.right = (this->RS).right;
    RS.bottom = (this->RS).bottom;
}

void CPlot2D::GetWindowCoords(double xs, double ys, int& xw, int& yw)
// Пересчитывает координаты точки из МСК в оконную
// xs - x- кордината точки в МСК
// ys - y- кордината точки в МСК
// xw - x- кордината точки в оконной СК
// yw - y- кордината точки в оконной СК

{
    CMatrix V(3), W(3);
    V(2) = 1;
    V(0) = xs;
    V(1) = ys;
    W = K * V;
    xw = (int)W(0);
    yw = (int)W(1);
}

//-----------------------------------------------------------------
void CPlot2D::Draw(CDC& dc, int Ind1, int Ind2)
{
    double xs, ys;
    int xw, yw;

    if (Ind1 == 1) dc.Rectangle(RW);

    if (Ind2 == 1)
    {
        CPen MyPen(PenAxis.PenStyle, PenAxis.PenWidth, PenAxis.PenColor);
        CPen* pOldPen = dc.SelectObject(&MyPen);

        CFont font;
        font.CreatePointFont(90, L"Segoe UI");
        CFont* oldFont = dc.SelectObject(&font);

        // --- Ось Y: рисуем там, где x=0 в мировых координатах ---
        bool hasYZero = (RS.left <= 0 && RS.right >= 0);
        if (hasYZero)
        {
            xs = 0;  ys = RS.top;           // (0, y_max)
            GetWindowCoords(xs, ys, xw, yw);
            dc.MoveTo(xw, yw);
            xs = 0;  ys = RS.bottom;        // (0, y_min)
            GetWindowCoords(xs, ys, xw, yw);
            dc.LineTo(xw, yw);              // ось Y
        }
        else
        {
            // Если 0 не входит в диапазон, рисуем ось по левому краю
            xs = RS.left;  ys = RS.top;
            GetWindowCoords(xs, ys, xw, yw);
            int xLeft = xw;
            xs = RS.left;  ys = RS.bottom;
            GetWindowCoords(xs, ys, xw, yw);
            dc.MoveTo(xLeft, yw);
            dc.LineTo(xLeft, yw + RW.Height());
        }

        // --- Деления и подписи на оси Y ---
        double yStep = pi / 2;
        double yStart = ceil(RS.bottom / yStep) * yStep;

        int tickLen = 5;
        dc.SetBkMode(TRANSPARENT);
        for (double yv = yStart; yv <= RS.top + 1e-12; yv += yStep)
        {
            if (fabs(yv) < 1e-12 && hasYZero) continue; // избегаем дублирования в нуле

            xs = hasYZero ? 0 : RS.left;
            ys = yv;
            GetWindowCoords(xs, ys, xw, yw);

            //// Деления
            //int xTickL = hasYZero ? (xw - tickLen) : (xw);
            //int xTickR = hasYZero ? (xw + tickLen) : (xw + tickLen);
            //dc.MoveTo(xTickL, yw);
            //dc.LineTo(xTickR, yw);

            //// Подписи
            ////CString lab;
            ////lab.Format(L"%.1f", yv);
            //CString lab = FormatPi(yv);
            //int xText = hasYZero ? (xTickR + 2) : (xTickR + 2);
            //dc.TextOutW(xText, yw - 8, lab);
        }

        // --- Ось X: рисуем там, где y=0 в мировых координатах ---
        bool hasXZero = (RS.bottom <= 0 && RS.top >= 0);
        if (hasXZero)
        {
            xs = RS.left;  ys = 0;           // (x_min, 0)
            GetWindowCoords(xs, ys, xw, yw);
            dc.MoveTo(xw, yw);
            xs = RS.right;  ys = 0;          // (x_max, 0)
            GetWindowCoords(xs, ys, xw, yw);
            dc.LineTo(xw, yw);               // ось X
        }
        else
        {
            // Если 0 не входит в диапазон, рисуем ось по нижнему краю
            xs = RS.left;  ys = RS.bottom;
            GetWindowCoords(xs, ys, xw, yw);
            int yBottom = yw;
            xs = RS.right; ys = RS.bottom;
            GetWindowCoords(xs, ys, xw, yw);
            dc.MoveTo(xw, yBottom);
            dc.LineTo(xw + RW.Width(), yBottom);
        }

        // --- Деления и подписи на оси X ---
        // шаг делений по X = π/2
        double xStep = pi / 2;
        // первое деление — ближайшее сверху
        double xStart = ceil(RS.left / xStep) * xStep;


        for (double xv = xStart; xv <= RS.right + 1e-12; xv += xStep)
        {
            if (fabs(xv) < 1e-12 && hasXZero) continue; // избегаем дублирования в нуле

            xs = xv;
            ys = hasXZero ? 0 : RS.bottom;
            GetWindowCoords(xs, ys, xw, yw);

            // Деления
            int yTickT = hasXZero ? (yw - tickLen) : (yw - tickLen);
            int yTickB = hasXZero ? (yw + tickLen) : (yw);
            dc.MoveTo(xw, yTickT);
            dc.LineTo(xw, yTickB);

            // Подписи
            //CString lab;
            //lab.Format(L"%.1f", xv);
            CString lab = FormatPi(xv);
            int yText = hasXZero ? (yTickB + 2) : (yTickB + 2);
            //dc.TextOutW(xw - 8, yText, lab);
            dc.TextOutW(xw - 12, yText, lab);
        }

        // Подпись "0" в начале координат (если есть)
        if (hasXZero && hasYZero)
        {
            xs = 0; ys = 0;
            GetWindowCoords(xs, ys, xw, yw);
            CString zeroLabel = L"0";
            dc.TextOutW(xw + 4, yw + 4, zeroLabel);
        }

        // --- ПОДПИСИ ОСЕЙ ---
        dc.SetTextColor(PenAxis.PenColor);

        // Подпись оси X (в конце оси справа)
        xs = RS.right; ys = 0;
        GetWindowCoords(xs, ys, xw, yw);
        if (!hasXZero) {
            xs = RS.right; ys = RS.bottom;
            GetWindowCoords(xs, ys, xw, yw);
        }
        dc.TextOutW(xw + 15, yw + 5, L"X");

        // Подпись оси Y (вверху оси)
        xs = 0; ys = RS.top;
        GetWindowCoords(xs, ys, xw, yw);
        if (!hasYZero) {
            xs = RS.left; ys = RS.top;
            GetWindowCoords(xs, ys, xw, yw);
        }
        dc.TextOutW(xw - 20, yw - 20, L"Y");

        dc.SelectObject(pOldPen);

        dc.SelectObject(oldFont);
        font.DeleteObject();
    }

    // --- Отрисовка графика ---
    xs = X(0); ys = Y(0);
    GetWindowCoords(xs, ys, xw, yw);
    CPen MyPen(PenLine.PenStyle, PenLine.PenWidth, PenLine.PenColor);
    CPen* pOldPen = dc.SelectObject(&MyPen);
    dc.MoveTo(xw, yw);
    for (int i = 1; i < X.rows(); i++)
    {
        xs = X(i); ys = Y(i);
        GetWindowCoords(xs, ys, xw, yw);
        dc.LineTo(xw, yw);
    }
    dc.SelectObject(pOldPen);

}

//--------------------------------------------------------------------

void CPlot2D::Draw1(CDC& dc, int Ind1, int Ind2)
{

    CRect IRS(RS.left, RS.top, RS.right, RS.bottom);
    if (Ind1 == 1)dc.Rectangle(IRS);
    if (Ind2 == 1)
    {//***
        CPen MyPen(PenAxis.PenStyle, PenAxis.PenWidth, PenAxis.PenColor);
        CPen* pOldPen = dc.SelectObject(&MyPen);

        if (RS.left * RS.right < 0)
        {
            dc.MoveTo(0, (int)RS.top);	  //  (0,Ymax)
            dc.LineTo(0, (int)RS.bottom);  //  (0,Ymax) - (0,Ymin) -  Y
        }

        if (RS.top * RS.bottom < 0)					//  X
        {
            dc.MoveTo((int)RS.left, 0);		    //  (0,Xmin)
            dc.LineTo((int)RS.right, 0);		    //  (0,Xmin) - (0,Xmax) -  X
        }
        dc.SelectObject(pOldPen);
    }//***

    CPen MyPen(PenLine.PenStyle, PenLine.PenWidth, PenLine.PenColor);
    CPen* pOldPen = dc.SelectObject(&MyPen);
    dc.MoveTo((int)X(0), (int)Y(0));
    for (int i = 1; i < X.rows(); i++)	dc.LineTo((int)X(i), (int)Y(i));
    dc.SelectObject(pOldPen);
}


//--------------------------------------------------------------------
void CPlot2D::DrawBezier(CDC& dc, int NT)
// Рисует кривую Безье по набору опорных точек
// Массив опорных точек: [X(0),Y(0)], [X(1),Y(1)],...
// dc - ссылка на класс CDC MFC
// NT - число отрезков по параметру t
{
    double xs, ys;  // мировые  координаты точки
    int xw, yw;     // оконные координаты точки
    CPen MyPen(PenLine.PenStyle, PenLine.PenWidth, PenLine.PenColor);
    CPen* pOldPen = dc.SelectObject(&MyPen);
    double dt = 1.0 / NT;
    int N = X.rows();
    CMatrix RX(N), RY(N);
    xs = X(0);   ys = Y(0);
    GetWindowCoords(xs, ys, xw, yw);
    dc.MoveTo(xw, yw);
    for (int k = 1; k <= NT; k++)
    {//***
        double t = k * dt;
        for (int i = 0; i < N; i++)
        {
            RX(i) = X(i);
            RY(i) = Y(i);
        }
        for (int j = N - 1; j > 0; j--)
        {
            for (int i = 0; i < j; i++)
            {
                RX(i) = RX(i) + t * (RX(i + 1) - RX(i));
                RY(i) = RY(i) + t * (RY(i + 1) - RY(i));
            }
        }
        xs = RX(0);   ys = RY(0);
        GetWindowCoords(xs, ys, xw, yw);
        dc.LineTo(xw, yw);
    }//***
    dc.SelectObject(pOldPen);
}


