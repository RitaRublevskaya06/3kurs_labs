package main

import (
	"encoding/json"
	"errors"
	"log"
	"math"
	"net/http"

	"github.com/gorilla/mux"
)

var precision int = 2

type RPCRequest struct {
	JSONRPC string          `json:"jsonrpc"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params"`
	ID      interface{}     `json:"id"`
}

type RPCResponse struct {
	JSONRPC string      `json:"jsonrpc"`
	Result  interface{} `json:"result,omitempty"`
	Error   *RPCError   `json:"error,omitempty"`
	ID      interface{} `json:"id"`
}

type RPCError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// Реализация интерфейса error
func (e *RPCError) Error() string {
	return e.Message
}

type BatchResponse []RPCResponse

// Структуры для параметров
type ParamsXY struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type ParamsN struct {
	N int `json:"N"`
}

// Вспомогательная функция для округления результата с учетом precision
func roundResult(value float64) float64 {
	ratio := math.Pow(10, float64(precision))
	return math.Round(value*ratio) / ratio
}

// Функции вычислений
func sum(x, y float64) float64 {
	return roundResult(x + y)
}

func sub(x, y float64) float64 {
	return roundResult(x - y)
}

func mul(x, y float64) float64 {
	return roundResult(x * y)
}

func div(x, y float64) (float64, error) {
	if y == 0 {
		return 0, errors.New("division by zero")
	}
	return roundResult(x / y), nil
}

// Обработчик уведомления pre
func handlePre(params json.RawMessage) error {
	var p ParamsN
	if err := json.Unmarshal(params, &p); err != nil {
		return err
	}
	precision = p.N
	log.Printf("[NOTIFICATION] Precision set to %d", precision)
	return nil
}

// Универсальная функция для извлечения x, y из params (поддержка форматов 1 и 2)
func parseXYParams(params json.RawMessage) (float64, float64, error) {
	var xy ParamsXY
	if err := json.Unmarshal(params, &xy); err == nil {
		return xy.X, xy.Y, nil
	}

	var arr []float64
	if err := json.Unmarshal(params, &arr); err == nil && len(arr) == 2 {
		return arr[0], arr[1], nil
	}

	return 0, 0, errors.New("Invalid params: expected [x,y] or {x,y}")
}

// Основной обработчик RPC
func rpcHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var rawBody json.RawMessage
	if err := json.NewDecoder(r.Body).Decode(&rawBody); err != nil {
		sendErrorResponse(w, nil, -32700, "Parse error")
		return
	}

	// Проверка: это batch-запрос (массив) или одиночный запрос (объект)
	var isBatch bool
	var requests []RPCRequest

	if err := json.Unmarshal(rawBody, &requests); err == nil {
		isBatch = true
	} else {
		var singleReq RPCRequest
		if err := json.Unmarshal(rawBody, &singleReq); err != nil {
			sendErrorResponse(w, nil, -32700, "Parse error")
			return
		}
		requests = []RPCRequest{singleReq}
		isBatch = false
	}

	responses := make([]RPCResponse, 0, len(requests))

	for _, req := range requests {
		response := processRequest(req)
		if req.ID != nil && req.ID != "" && req.ID != 0 {
			responses = append(responses, response)
		} else if req.ID == nil && response.Error == nil {
			continue
		} else if req.ID == nil && response.Error != nil {
			responses = append(responses, response)
		}
	}

	// Ответ
	if isBatch {
		if len(responses) == 0 {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("[]"))
			return
		}
		json.NewEncoder(w).Encode(responses)
	} else {
		if len(responses) == 0 {
			w.WriteHeader(http.StatusOK)
			return
		}
		json.NewEncoder(w).Encode(responses[0])
	}
}

// Обработка одного RPC-запроса
func processRequest(req RPCRequest) RPCResponse {
	log.Printf("[RPC] Method: %s, ID: %v, Params: %s", req.Method, req.ID, req.Params)

	if req.JSONRPC != "2.0" {
		return RPCResponse{
			JSONRPC: "2.0",
			Error:   &RPCError{Code: -32600, Message: "Invalid Request: jsonrpc must be 2.0"},
			ID:      req.ID,
		}
	}

	switch req.Method {
	case "pre":
		err := handlePre(req.Params)
		if err != nil {
			return RPCResponse{
				JSONRPC: "2.0",
				Error:   &RPCError{Code: -32602, Message: "Invalid params: " + err.Error()},
				ID:      req.ID,
			}
		}
		if req.ID != nil {
			return RPCResponse{
				JSONRPC: "2.0",
				Result:  map[string]string{"status": "ok"},
				ID:      req.ID,
			}
		}
		return RPCResponse{}

	case "sum", "sub", "mul", "div":
		x, y, err := parseXYParams(req.Params)
		if err != nil {
			return RPCResponse{
				JSONRPC: "2.0",
				Error:   &RPCError{Code: -32602, Message: err.Error()},
				ID:      req.ID,
			}
		}

		var result float64
		switch req.Method {
		case "sum":
			result = sum(x, y)
		case "sub":
			result = sub(x, y)
		case "mul":
			result = mul(x, y)
		case "div":
			var divErr error
			result, divErr = div(x, y)
			if divErr != nil {
				return RPCResponse{
					JSONRPC: "2.0",
					Error:   &RPCError{Code: -32602, Message: divErr.Error()},
					ID:      req.ID,
				}
			}
		}

		return RPCResponse{
			JSONRPC: "2.0",
			Result:  map[string]float64{"Value": result},
			ID:      req.ID,
		}

	default:
		return RPCResponse{
			JSONRPC: "2.0",
			Error:   &RPCError{Code: -32601, Message: "Method not found"},
			ID:      req.ID,
		}
	}
}

// Отправка ошибки
func sendErrorResponse(w http.ResponseWriter, id interface{}, code int, message string) {
	response := RPCResponse{
		JSONRPC: "2.0",
		Error:   &RPCError{Code: code, Message: message},
		ID:      id,
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// Health-check эндпоинт
func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func main() {
	router := mux.NewRouter()

	// RPC endpoint
	router.HandleFunc("/rpc", rpcHandler).Methods("POST")

	// Health check
	router.HandleFunc("/health", healthHandler).Methods("GET")

	log.Println("Starting JSON-RPC 2.0 server on port 3000")
	log.Println("Endpoints:")
	log.Println("  POST /rpc - JSON-RPC 2.0 requests")
	log.Println("  GET  /health - Health check")

	if err := http.ListenAndServe(":3000", router); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
