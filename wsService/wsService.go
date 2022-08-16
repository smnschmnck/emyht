package wsService

import (
	"chat/authService"
	"chat/userService"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

var validate = validator.New()

var socketIdToConn = make(map[string]*websocket.Conn)
var uuidToWebsocketID = make(map[string][]string)
var websocketIDToUuid = make(map[string]string)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		corsOrigins := os.Getenv("CORS_ORIGINS")
		if corsOrigins == "*" {
			return true
		}
		return origin == corsOrigins
	},
}

type wsData struct {
	Event   string `json:"event"`
	Payload any    `json:"payload"`
}

//If payload is a struct remember to export your fields
func WriteStruct(ws *websocket.Conn, event string, payload any) error {
	out, err := json.Marshal(wsData{Event: event, Payload: payload})
	ws.WriteMessage(websocket.TextMessage, out)
	return err
}

func recieveIncomingWebsocketMessages(ws *websocket.Conn) error {
	for {
		_, _, err := ws.ReadMessage()
		if err != nil {
			return err
		}
	}
}

//yeah that name is long
func deleteWsIdFromUuidToWsId(websocketID string) {
	uuid := websocketIDToUuid[websocketID]
	websocketIDArray := uuidToWebsocketID[uuid]
	if len(websocketIDArray) <= 1 {
		delete(uuidToWebsocketID, uuid)
	} else {
		for i, wId := range websocketIDArray {
			if wId == websocketID {
				websocketIDArray[i] = websocketIDArray[len(websocketIDArray)-1]
				uuidToWebsocketID[uuid] = websocketIDArray[:len(websocketIDArray)-1]
				return
			}
		}
	}
}

func handleWsClose(websocketID string) error {
	delete(socketIdToConn, websocketID)
	deleteWsIdFromUuidToWsId(websocketID)
	delete(websocketIDToUuid, websocketID)
	return errors.New("SOCKET NOT FOUND")
}

func InitializeNewSocketConnection(c echo.Context) error {
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}
	websocketID := uuid.New().String()
	socketIdToConn[websocketID] = ws
	sendInitialSocketID(ws, websocketID)
	err = recieveIncomingWebsocketMessages(ws)
	if err != nil {
		handleWsClose(websocketID)
	}
	return nil
}

func sendInitialSocketID(ws *websocket.Conn, uuid string) error {
	type socketAuthID struct {
		Id string `json:"id"`
	}
	err := WriteStruct(ws, "auth", socketAuthID{Id: uuid})
	return err
}

func AuthenticateSocketConnection(c echo.Context) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type reqBody struct {
		Id string `json:"id"`
	}
	req := new(reqBody)
	err = c.Bind(&req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	websocketID := req.Id
	if websocketIDs, containsUUID := uuidToWebsocketID[reqUUID]; containsUUID {
		uuidToWebsocketID[reqUUID] = append(websocketIDs, websocketID)
	} else {
		newArr := make([]string, 1)
		newArr[0] = websocketID
		uuidToWebsocketID[reqUUID] = newArr
	}
	websocketIDToUuid[websocketID] = reqUUID
	return c.String(http.StatusOK, "SUCCESS")
}

func GetSocketsByUUID(uuid string) []*websocket.Conn {
	websocketIDs := uuidToWebsocketID[uuid]
	websocketIDCount := len(websocketIDs)
	connArray := make([]*websocket.Conn, websocketIDCount)
	for i, websocketID := range websocketIDs {
		connArray[i] = socketIdToConn[websocketID]
	}
	return connArray
}
