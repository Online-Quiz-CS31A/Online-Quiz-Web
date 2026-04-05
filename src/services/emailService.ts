const EMAILJS_SERVICE_ID = 'service_mqydkjq'
const EMAILJS_TEMPLATE_ID = 'template_3ykzogj'
const EMAILJS_PUBLIC_KEY = 'VT7Qz6qZKYHtDNJpe'

const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send'

export async function sendPasswordEmail(
    toEmail: string,
    toName: string,
    password: string
): Promise<boolean> {
    const payload = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
            to_email: toEmail,
            to_name: toName,
            password: password,
            app_name: 'Online Quiz System'
        }
    }

    console.log('EmailJS request payload:', JSON.stringify(payload, null, 2))

    try {
        const response = await fetch(EMAILJS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        const responseText = await response.text()
        console.log('EmailJS response status:', response.status)
        console.log('EmailJS response body:', responseText)

        if (response.ok) {
            console.log(`Password email sent successfully to ${toEmail}`)
            return true
        } else {
            console.error(`EmailJS error (${response.status}):`, responseText)
            return false
        }
    } catch (error: any) {
        console.error('Failed to send password email:', error.message)
        return false
    }
}
