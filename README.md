# Bulk Channel Creator

A web application for bulk creating channels in Prompt.io, supporting both Bandwidth and Signalwire channel types.

## Features

- Upload CSV files containing phone numbers
- Support for both Bandwidth and Signalwire channel types
- Automatic formatting of phone numbers and API IDs
- Configurable forwarding numbers
- Real-time processing status updates

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Prompt.io account with API access

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/jeremyprompt/Bulk_Uploader.git
cd Bulk_Uploader
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Deployment to Render

1. Create an account on [Render](https://render.com) if you don't have one

2. Click "New +" and select "Web Service"

3. Connect your GitHub repository

4. Configure the service with these settings:
   - Name: bulk-uploader (or your preferred name)
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Select the free tier

5. Click "Create Web Service"

6. Wait for the deployment to complete (usually takes 5-10 minutes)

7. Your application will be available at:
```
https://[your-service-name].onrender.com
```

## Usage

1. Enter your Prompt.io subdomain
2. Enter your auth token
3. (Optional) Enter a forwarding number
4. Select the channel type (Bandwidth or Signalwire)
5. Upload a CSV file with a 'NUMBER' column containing phone numbers
6. Click "Process CSV"

### CSV Format
Your CSV file should contain a column named 'NUMBER' with phone numbers. Example:
```csv
NUMBER
(123) 456-7890
+1 234 567 8901
```

### Phone Number Formatting
The application will automatically format phone numbers:
- Removes all non-digit characters
- Adds appropriate prefixes
- Formats API IDs based on channel type:
  - Bandwidth: `mbw_123_4567890`
  - Signalwire: `ps_123_456_7890`

## Notes

- The free tier on Render will spin down after 15 minutes of inactivity
- First request after inactivity might take a few seconds to respond
- Consider upgrading to a paid plan if you need the service to be always available

## Security

- Never commit your auth token or sensitive information
- The proxy server handles API requests securely
- All communications are encrypted via HTTPS

## Troubleshooting

If you encounter any issues:
1. Check your subdomain and auth token
2. Verify your CSV file format
3. Ensure the server is running
4. Check the browser console for errors
5. Verify your internet connection

## License

This project is licensed under the MIT License - see the LICENSE file for details.
