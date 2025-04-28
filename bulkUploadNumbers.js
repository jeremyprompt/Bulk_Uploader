document.addEventListener('DOMContentLoaded', () => {
    const processButton = document.getElementById('processButton');
    const csvFileInput = document.getElementById('csvFile');
    const resultsDiv = document.getElementById('results');
    const subdomainInput = document.getElementById('subdomain');
    const authTokenInput = document.getElementById('authToken');
    const forwardNumberInput = document.getElementById('forwardNumber');
    const channelTypeRadios = document.getElementsByName('channelType');

    processButton.addEventListener('click', async () => {
        const file = csvFileInput.files[0];
        if (!file) {
            showError('Please select a CSV file');
            return;
        }

        const subdomain = subdomainInput.value.trim();
        const authToken = authTokenInput.value.trim();
        const forwardNumber = forwardNumberInput.value.trim();
        const selectedChannelType = getSelectedChannelType();

        if (!subdomain || !authToken || !selectedChannelType) {
            showError('Please fill in all configuration fields and select a channel type');
            return;
        }

        try {
            const phoneNumbers = await readCSV(file);
            resultsDiv.innerHTML = '';
            
            for (const phoneNumber of phoneNumbers) {
                await createChannel(phoneNumber, subdomain, authToken, forwardNumber, selectedChannelType);
                // Add a small delay between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            showError(`Error processing file: ${error.message}`);
        }
    });

    function getSelectedChannelType() {
        for (const radio of channelTypeRadios) {
            if (radio.checked) {
                return radio.value;
            }
        }
        return null;
    }

    async function readCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const text = event.target.result;
                    const lines = text.split('\n');
                    const headers = lines[0].split(',').map(h => h.trim());
                    const numberIndex = headers.indexOf('NUMBER');
                    
                    if (numberIndex === -1) {
                        reject(new Error('CSV file must contain a "NUMBER" column'));
                        return;
                    }

                    const phoneNumbers = [];
                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i].trim()) {
                            const values = lines[i].split(',');
                            if (values[numberIndex]) {
                                phoneNumbers.push(values[numberIndex].trim());
                            }
                        }
                    }
                    resolve(phoneNumbers);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    async function createChannel(phoneNumber, subdomain, authToken, forwardNumber, channelType) {
        // Clean the number by removing all non-digit characters
        const digits = phoneNumber.replace(/\D/g, '');
        
        // Format the name with just the digits and a plus sign
        const formattedName = `+${digits}`;
        
        // Format the apiId based on channel type
        let formattedApiId;
        if (channelType === "MANAGED_BANDWIDTH") {
            formattedApiId = `mbw_${digits.substring(0, 3)}_${digits.substring(3)}`;
        } else if (channelType === "MANAGED_SIGNAL_WIRE") {
            formattedApiId = `ps_${digits.substring(0, 3)}_${digits.substring(3, 6)}_${digits.substring(6)}`;
        }
        
        const payload = {
            name: formattedName,
            apiId: formattedApiId,
            channelType: channelType,
            registrationStatus: "NA",
            firstMessage: "",
            firstMessageEnabled: false,
            apiOptOutMessage: "",
            apiOptOutMessageEnabled: false,
            optOutFinalMessage: "",
            optOutFinalMessageEnabled: false,
            incomingCallResponseType: forwardNumber.trim() ? "FORWARD" : "REJECT",
            incomingCallAudioUploadId: 0,
            incomingCallForwardNumber: forwardNumber.trim() || "",
            unsupportedMediaMessage: "",
            managedBandwidthModel: {
                phoneNumber: `+1${digits}`
            },
            prePurchased: true,
            channelApps: []
        };

        try {
            const response = await fetch('https://bulk-uploader.onrender.com/api/channels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subdomain,
                    authToken,
                    payload
                })
            });

            const result = await response.json();
            
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            if (response.ok) {
                resultItem.innerHTML = `
                    <div class="success">
                        Successfully processed number ${phoneNumber}
                    </div>
                `;
            } else {
                resultItem.innerHTML = `
                    <div class="error">
                        Error processing number ${phoneNumber}: ${result.message || 'Unknown error'}
                    </div>
                `;
            }
            
            resultsDiv.appendChild(resultItem);
            resultsDiv.scrollTop = resultsDiv.scrollHeight;
            
        } catch (error) {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item error';
            resultItem.textContent = `Error processing number ${phoneNumber}: ${error.message}`;
            resultsDiv.appendChild(resultItem);
            resultsDiv.scrollTop = resultsDiv.scrollHeight;
        }
    }

    function showError(message) {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item error';
        resultItem.textContent = message;
        resultsDiv.appendChild(resultItem);
        resultsDiv.scrollTop = resultsDiv.scrollHeight;
    }
});