// Set your API key here
const APIKEY = 'onemillionwallets';

// Token table reset

const tableRef = document.getElementById('tokenTable1').getElementsByTagName('tbody')[0];
tableRef.innerHTML = "";

// Covalent API request setup
const url = new URL(`https://api.covalenthq.com/v1/pricing/tickers/`);
url.search = new URLSearchParams({
    key: APIKEY
})

// Use Fetch API to get Covalent data and display in token table
fetch(url)
.then((resp) => resp.json())
.then(function(data) {
    let tokens = data.data.items;
    return tokens.map(function(token) { // Map through the results and for each run the code below
    tableRef.insertRow().innerHTML = 
        `<td><img src=${token.logo_url} style=width:50px;height:50px;></td>` +
        `<td> ${token.contract_name} </td>` +
        `<td> ${token.contract_ticker_symbol} </td>` +
        `<td> $${parseFloat(token.quote_rate).toFixed(2)} </td>`
    })
})

async function getData() {
    // Get key HTML elements and reset table content
    const ul = document.getElementById('metadata');
    
    

    const tableRef = document.getElementById('tokenTable2');
    tableRef.innerHTML = 
        `<thead class="thead-dark">
            <tr>
                <th></th>
                <th>Token</th>
                <th>Symbol</th>
                <th>Balance</th>
                <th>Fiat Value</th>
                <th>Type</th>
            </tr>
        </thead>
        <tbody>
        </tbody>`;

    // Covalent API request setup
    const address = document.getElementById('address').value || '0xbe3bf9bb42bf423695b792250be206c9a58e2de1';
    const url = new URL(`https://api.covalenthq.com/v1/1/address/${address}/balances_v2`);
    url.search = new URLSearchParams({
        key: APIKEY,
        nft: true
    })

    // Use Fetch API to get Covalent data
    let resp = await fetch(url);
    let data = await resp.json();
    let tokens = data.data.items;
    // Update wallet metadata
    ul.innerHTML = 
        `<li> Wallet address: ${data.data.address} </li>` +
        `<li> Last update: ${data.data.updated_at} </li>` +
        `<li> Fiat currency: ${data.data.quote_currency} </li>`;

    return tokens.map(async function(token) { // Map through the results and for each run the code below
    // console.log(token);
    

    if (token.contract_decimals > 0) {
        balance = parseInt(token.balance) / Math.pow(10, token.contract_decimals);
    } else {
        balance = parseInt(token.balance);
    }
    tableRef.insertRow().innerHTML = 
        `<td><img src=${token.logo_url} style=width:50px;height:50px;></td>` +
        `<td> ${token.contract_address} </td>` +
        `<td> ${token.contract_ticker_symbol} </td>` +
        `<td> ${balance.toFixed(4)} </td>` +
        `<td> $${parseFloat(token.quote).toFixed(2)} </td>` +
        `<td> ${token.type} </td>`;

    if (token.type === 'stablecoin' || token.type === 'cryptocurrency') {
        await getTransfers(address, token);
    }
    })
}

async function getTransfers(address, token) {
    let oldTransferTable = document.getElementById(token.contract_ticker_symbol);
    if (oldTransferTable) {
       oldTransferTable.remove();
    }
    const transferTable = document.createElement('TABLE');
    transferTable.setAttribute("id", token.contract_ticker_symbol);
    transferTable.setAttribute("class", "table");
    transferTable.innerHTML = 
    `<thead class="thead-dark"><tr>
        <th>Timestamp (UTC)</th>
        <th>From Address</th>
        <th>From Label</th>
        <th>Ticker</th>
        <th>Transfer Type</th>
        <th>To Address</th>
        <th>To Label</th>
        <th>Amount</th>
        <th>Value</th>
    </tr></thead><tbody></tbody><br>`
    document.getElementById("tokentable3").append(transferTable);
    

    const url = new URL(`https://api.covalenthq.com/v1/1/address/${address}/transfers_v2`);
    url.search = new URLSearchParams({
        key: APIKEY,
        "contract-address": token.contract_address
    })

    // Use Fetch API to get Covalent data
    let resp = await fetch(url);
    let data = await resp.json();
    console.log('tranfer data is', data);
    let transactions = data.data.items;
    return transactions.map(function(transaction) {
        transaction.transfers.forEach(function(transfer) {
            amount = parseInt(transfer.delta) / Math.pow(10, transfer.contract_decimals);
            transferTable.insertRow().innerHTML =
                `<td> ${transfer.block_signed_at} </td>` +
                `<td> ${transfer.from_address} </td>` +
                `<td> ${transfer.from_address_label} </td>` +
                `<td> ${transfer.contract_ticker_symbol} </td>` +
                `<td> ${transfer.transfer_type} </td>` +
                `<td> ${transfer.to_address} </td>` +
                `<td> ${transfer.to_address_label} </td>` +
                `<td> ${amount.toFixed(4)} </td>` +
                `<td> $${parseFloat(transfer.delta_quote).toFixed(2)} </td>`;
        })
    })
}

