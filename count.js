  progressBar.update(iteration)
    
    let row = {
        n: parseInt(index) + 1,
        Wallet: wallet,
        Clusters: data.clusters,
        'TX Count': data.tx_count,
        'Source chains': data.source_chain_count,
        'Dest chains': data.dest_chain_count,
        'Contracts': data.contracts,
        'Days': data.days,
        'Weeks': data.weeks,
        'Months': data.months,
        'First tx': data.first_tx ? moment((data.first_tx)).format("DD.MM.YY") : '-',
        'Last tx': data.last_tx ? moment((data.last_tx)).format("DD.MM.YY") : '-',
    }

    let jsonRow = {
        n: parseInt(index) + 1,
        Wallet: wallet,
        Clusters: data.clusters,
        'TX Count': data.tx_count,
        'Source chains': data.source_chain_count,
        'Dest chains': data.dest_chain_count,
        'Contracts': data.contracts,
        'Days': data.days,
        'Weeks': data.weeks,
        'Months': data.months,
        'First tx': data.first_tx,
        'Last tx': data.last_tx,
    }

    if (isExtended) {
        sourceNetworks.forEach((source) => {
            row[source] = 0
        })
        Object.entries(sources).forEach(([source, count]) => {
            row[source] = count
        })

        protocolsList.forEach((protocol) => {
            if (protocol === 'harmony') {
                row[protocol+'-bridge'] = 0
            } else {
                row[protocol] = 0
            }
        })
        Object.entries(data.protocols).forEach(([protocol, count]) => {
            if (protocol === 'harmony') {
                row[protocol+'-bridge'] = count
            } else {
                row[protocol] = count
            }
        })
    }

    jsonRow['sources'] = sortObjectByKey(data.sources)
    jsonRow['destinations'] = data.destinations
    jsonRow['protocols'] = sortObjectByKey(data.protocols)

    p.addRow(row)
    jsonData.push(jsonRow)

    if (data.tx_count > 0) {
        await saveWalletToDB(wallet, 'layerzero', JSON.stringify(data))
    }

    iteration++
}

async function fetchBatch(batch, isExtended) {
    await Promise.all(batch.map((account, index) => fetchWallet(account, getKeyByValue(wallets, account), isExtended)))
}

async function fetchWallets(isExtended) {
    wallets = readWallets(config.modules.layerzero.addresses)
    iterations = wallets.length
    iteration = 1
    csvData = []
    jsonData = []

    csvWriter = createObjectCsvWriter({
        path: './results/layerzero.csv',
        header: headers
    })
