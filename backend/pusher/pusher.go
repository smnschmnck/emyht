package pusher

import (
	"chat/utils"

	"github.com/pusher/pusher-http-go/v5"
)

var PusherClient = pusher.Client{
	AppID:   utils.GetEnv("PUSHER_APP_ID"),
	Key:     utils.GetEnv("PUSHER_KEY"),
	Secret:  utils.GetEnv("PUSHER_SECRET"),
	Cluster: utils.GetEnv("PUSHER_CLUSTER"),
	Secure:  true,
}
