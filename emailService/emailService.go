package emailService

import (
	"bytes"
	"html/template"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ses"
)

func populateHtmlTemplate(data any, templatePath string) string {
	tmpl := template.Must(template.ParseFiles(templatePath))
	var tpl bytes.Buffer
	tmpl.Execute(&tpl, data)
	return tpl.String()
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

func SendVerificationEmail(username string, recipientMail string) error {
	textBody := "Hey" + username + "! Use the following link to verify your E-Mail address and start using emyht: "

	type VerifyPageData struct {
		Username   string
		VerifyLink string
	}

	subject := "Verify your E-Mail"
	//TODO Add verify Link
	templateData := VerifyPageData{Username: username, VerifyLink: "https://www.google.com"}
	templatePath := "./emailService/htmlTemplates/mailVerifyLayout.html"
	htmlBody := populateHtmlTemplate(templateData, templatePath)

	sendEmail(subject, recipientMail, htmlBody, textBody)

	return nil
}
