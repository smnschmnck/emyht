package emailService

import (
	"bytes"
	"html/template"
	"log"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ses"
)

func populateHtmlTemplate(data any, templatePath string) (string, error) {
	tmpl := template.Must(template.ParseFiles(templatePath))
	var tpl bytes.Buffer
	err := tmpl.Execute(&tpl, data)
	if err != nil {
		return "", err
	}
	return tpl.String(), nil
}

func sendEmail(subject string, recipientMail string, htmlBody string, textBody string) error {
	const (
		CharSet = "UTF-8"
		Sender  = "emyht <no-reply@emyht.com>"
	)

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("eu-central-1")},
	)

	if err != nil {
		return err
	}

	svc := ses.New(sess)

	input := &ses.SendEmailInput{
		Destination: &ses.Destination{
			CcAddresses: []*string{},
			ToAddresses: []*string{
				aws.String(recipientMail),
			},
		},
		Message: &ses.Message{
			Body: &ses.Body{
				Html: &ses.Content{
					Charset: aws.String(CharSet),
					Data:    aws.String(htmlBody),
				},
				Text: &ses.Content{
					Charset: aws.String(CharSet),
					Data:    aws.String(textBody),
				},
			},
			Subject: &ses.Content{
				Charset: aws.String(CharSet),
				Data:    aws.String(subject),
			},
		},
		Source: aws.String(Sender),
	}

	_, err = svc.SendEmail(input)

	if err != nil {
		return err
	}

	return nil
}

func SendVerificationEmail(username string, recipientMail string, token string) error {
	type VerifyPageData struct {
		Username   string
		VerifyLink string
	}

	const (
		templatePath = "./emailService/htmlTemplates/mailVerifyLayout.html"
		subject      = "Verify your E-Mail"
	)

	frontendHost := os.Getenv("FRONTEND_HOST")
	if frontendHost == "" {
		panic("NO FRONTEND HOST IN .ENV!")
	}
	url := frontendHost + "/verify-email?token=" + token
	templateData := VerifyPageData{Username: username, VerifyLink: url}
	htmlBody, err := populateHtmlTemplate(templateData, templatePath)
	if err != nil {
		return err
	}

	textBody := "Hey " +
		username +
		"! Use the following link to verify your E-Mail address and start using emyht: " + url

	err = sendEmail(subject, recipientMail, htmlBody, textBody)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

func SendVerifyEmailChangeEmail(username string, recipientMail string, token string) error {
	type VerifyPageData struct {
		Username   string
		VerifyLink string
	}

	const (
		templatePath = "./emailService/htmlTemplates/confirmEmailChangeLayout.html"
		subject      = "Confirm your new E-Mail Adress"
	)

	frontendHost := os.Getenv("FRONTEND_HOST")
	if frontendHost == "" {
		panic("NO FRONTEND HOST IN .ENV!")
	}
	url := frontendHost + "/confirm-new-email?token=" + token
	templateData := VerifyPageData{Username: username, VerifyLink: url}
	htmlBody, err := populateHtmlTemplate(templateData, templatePath)
	if err != nil {
		return err
	}

	textBody := "Hey " +
		username +
		"! Use the following link to confirm your new E-Mail address and start using emyht: " + url

	err = sendEmail(subject, recipientMail, htmlBody, textBody)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}
