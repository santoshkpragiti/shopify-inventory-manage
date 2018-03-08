This app is to manage inventory in shopify.

clone the repo
run yarn install
Create a tunnel to localhost:3000 using forward or ngrok (we refer to tunnel as Host)

In Shopify
Sign into your Shopify Partner Dashboard
Click 'Apps' in the sidebar and create a new app
Set the app url to {{ HOST }}/
Set the whitelisted URL to {{ HOST }}/auth/shopify/callback
Go to extensions tab and enable “Embed in Shopify admin”

In Project
Rename .env.example to .env and
Set Add HOST from your tunnel service as SHOPIFY_APP_HOST
Add the api key from partners dash as SHOPIFY_APP_KEY
Add the api secret from partners dash as SHOPIFY_APP_SECRET

run yarn install 
