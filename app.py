from flask import Flask, request, redirect
import requests
import urllib.parse
import re

app = Flask(__name__)


CLIENT_ID = 'fc9ab7b9-6d48-409b-9280-c6cf088f3897'
TENANT_ID = '901cb4ca-b862-4029-9306-e5cd0f6d9f86'
CLIENT_SECRET = 'Ize8Q~rTBaIxI74wGjwIaqEdeYEG1LQKBZ7zjb_M'

REDIRECT_URI = 'http://localhost:5000/callback'
SCOPE = 'Mail.Read'

@app.route('/')
def index():
    base_authorization_url = f'https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/authorize'
    params = {
        'client_id': CLIENT_ID,
        'response_type': 'code',
        'redirect_uri': REDIRECT_URI,
        'scope': SCOPE
    }
    authorization_url = f"{base_authorization_url}?{urllib.parse.urlencode(params)}"
    return f'Go to <a href="{authorization_url}">this link</a> to authorize and get code.'

@app.route('/callback')
def callback():
    # Get the authorization code from the query parameters
    auth_code = request.args.get('code')

    # Exchange authorization code for access token
    token_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
    token_data = {
        'grant_type': 'authorization_code',
        'code': auth_code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'scope': SCOPE
    }
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    # Make POST request to token endpoint
    response = requests.post(token_url, headers=headers, data=token_data)
    token_json = response.json()


    # Extract access token from response
    access_token = token_json.get('access_token')

    # Example: Use the access token to make a request to Microsoft Graph API
    if access_token:
        # Example: Make a request to Microsoft Graph API
        params = {
            '$top': 1,
            '$skip': 1
        }
        graph_api_endpoint = f'https://graph.microsoft.com/v1.0/me/messages?{urllib.parse.urlencode(params)}'
        graph_headers = {
            'Authorization': 'Bearer ' + access_token,
            'Accept': 'application/json'
        }
        graph_response = requests.get(graph_api_endpoint, headers=graph_headers)
        messages = graph_response.json()
        CLEANR = re.compile('<.*?>')
        for message in messages['value']:
            content = message['body']['content']
            cleantext = re.sub(CLEANR, '', content)
            with open('content.txt', 'w') as file:
                file.write(cleantext)

        return f"Access Token: {access_token}<br><br>Messages: {messages}"
    else:
        return "Error: Failed to retrieve access token"

if __name__ == '__main__':
    app.run(debug=True)
