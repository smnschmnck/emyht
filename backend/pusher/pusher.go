package pusher

import (
	"chat/authService"
	"chat/chatHelpers"
	"chat/userService"
	"chat/utils"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/pusher/pusher-http-go/v5"
)

var PusherClient = pusher.Client{
	AppID:   utils.GetEnv("PUSHER_APP_ID"),
	Key:     utils.GetEnv("PUSHER_KEY"),
	Secret:  utils.GetEnv("PUSHER_SECRET"),
	Cluster: utils.GetEnv("PUSHER_CLUSTER"),
	Secure:  true,
}

func PusherAuth(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	params, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to read request body")
	}

	values, err := url.ParseQuery(string(params))
	if err != nil {
		return c.String(http.StatusBadRequest, "Invalid form data")
	}

	privateChannelName := values.Get("channel_name")
	fullChannelName := strings.Replace(privateChannelName, "private-", "", 1)
	splitChannelName := strings.Split(fullChannelName, ".")
	channelType := splitChannelName[0]
	channelName := splitChannelName[1]

	switch channelType {
	case "chat":
		inChat, err := chatHelpers.IsUserInChat(reqUUID, channelName)
		if err != nil {
			return c.String(http.StatusUnauthorized, err.Error())
		}

		if !inChat {
			return c.String(http.StatusUnauthorized, "User not in chat")
		}
	case "user_feed":
		if reqUUID != channelName {
			return c.String(http.StatusUnauthorized, "NO AUTH")
		}
	default:
		return c.String(http.StatusBadRequest, "Unknown channel type")
	}

	response, err := PusherClient.AuthorizePrivateChannel(params)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.String(http.StatusOK, string(response))
}

const (
	CHAT_EVENT            = "chat"
	MESSAGE_EVENT         = "message"
	CONTACT_REQUEST_EVENT = "contact_request"
	USER_FEED_PREFIX      = "private-user_feed."
	CHAT_PREFIX           = "private-chat."
)

func MakePusherEventArray(channelPrefix string, channelSuffixes []string, eventName string, data any) []pusher.Event {
	pusherEvents := make([]pusher.Event, 0)
	for _, channelSuffix := range channelSuffixes {
		event := pusher.Event{
			Channel: channelPrefix + channelSuffix,
			Name:    eventName,
			Data:    data,
		}
		pusherEvents = append(pusherEvents, event)
	}

	return pusherEvents
}
