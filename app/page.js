'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [results, setResults] = useState([]);
  const [subdomain, setSubdomain] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [forwardNumber, setForwardNumber] = useState('');
  const [channelType, setChannelType] = useState('');

  const showError = (message) => {
    setResults(prev => [...prev, {
      type: 'error',
      message
    }]);
  };

  const readCSV = async (file) => {
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
  };

  const createChannel = async (phoneNumber) => {
    const digits = phoneNumber.replace(/\D/g, '');
    const formattedName = `+${digits}`;
    
    let formattedApiId;
    if (channelType === "MANAGED_BANDWIDTH") {
      formattedApiId = `mbw_${digits.substring(0, 3)}_${digits.substring(3)}`;
    } else if (channelType === "MANAGED_SIGNAL_WIRE") {
      formattedApiId = `ps_${digits.substring(0, 3)}_${digits.substring(3, 6)}_${digits.substring(6)}`;
    }

    const url = `https://${subdomain}.prompt.io/rest/1.0/org_channels`;
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'orgAuthToken': authToken
    };

    const requestBody = {
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
      channelApps: [],
      assignToEveryone: true
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      setResults(prev => [...prev, {
        type: 'success',
        message: `Successfully processed number ${phoneNumber}`
      }]);
    } catch (error) {
      setResults(prev => [...prev, {
        type: 'error',
        message: `Error processing number ${phoneNumber}: ${error.message}`
      }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = e.target.csvFile.files[0];
    
    if (!file) {
      showError('Please select a CSV file');
      return;
    }

    if (!subdomain || !authToken || !channelType) {
      showError('Please fill in all configuration fields and select a channel type');
      return;
    }

    try {
      const phoneNumbers = await readCSV(file);
      setResults([]);
      
      for (const phoneNumber of phoneNumbers) {
        await createChannel(phoneNumber);
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      showError(`Error processing file: ${error.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Bulk Channel Creator</h1>
      
      <div className={styles.configSection}>
        <h3>Configuration</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="subdomain">Subdomain:</label>
            <input
              type="text"
              id="subdomain"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              placeholder="Enter your subdomain"
            />
          </div>
          <div>
            <label htmlFor="authToken">Auth Token:</label>
            <input
              type="text"
              id="authToken"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Enter your auth token"
            />
          </div>
          <div>
            <label htmlFor="forwardNumber">Forward Number:</label>
            <input
              type="text"
              id="forwardNumber"
              value={forwardNumber}
              onChange={(e) => setForwardNumber(e.target.value)}
              placeholder="Enter your forwarding number"
            />
          </div>
          <div>
            <h4>Channel Type</h4>
            <div>
              <input
                type="radio"
                id="bandwidth"
                name="channelType"
                value="MANAGED_BANDWIDTH"
                checked={channelType === "MANAGED_BANDWIDTH"}
                onChange={(e) => setChannelType(e.target.value)}
              />
              <label htmlFor="bandwidth">Bandwidth</label>
            </div>
            <div>
              <input
                type="radio"
                id="signalwire"
                name="channelType"
                value="MANAGED_SIGNAL_WIRE"
                checked={channelType === "MANAGED_SIGNAL_WIRE"}
                onChange={(e) => setChannelType(e.target.value)}
              />
              <label htmlFor="signalwire">Signalwire</label>
            </div>
          </div>

          <div className={styles.uploadSection}>
            <h3>Upload CSV File</h3>
            <p>Your CSV file should contain a column named 'NUMBER' with phone numbers.</p>
            <input type="file" id="csvFile" accept=".csv" />
            <button type="submit">Process CSV</button>
          </div>
        </form>
      </div>

      <div className={styles.results}>
        {results.map((result, index) => (
          <div key={index} className={`${styles.resultItem} ${styles[result.type]}`}>
            {result.message}
          </div>
        ))}
      </div>
    </div>
  );
} 