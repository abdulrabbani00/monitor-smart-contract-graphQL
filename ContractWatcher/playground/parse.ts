let val: any = {
    removed: false,
    logIndex: 47,
    transactionIndex: 41,
    transactionHash: '0xb7eba7fb593ef7aa8ea9df7a81b90afd47525e1f67797871466287295a6462dd',
    blockHash: '0x0f63b429a66caae19c1d03be28520f2f79c7b3366381722e1f9fd61fdaad9881',
    blockNumber: 14141322,
    address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
    id: 'log_f0d8facb',
    returnValues: {
        '0': '0x6d0267156f1c6CE44Caa4BF129B76009d3d41830',
        '1': '0xC310e760778ECBca4C65B6C559874757A4c4Ece0',
        '2': '9138',
        from: '0x6d0267156f1c6CE44Caa4BF129B76009d3d41830',
        to: '0xC310e760778ECBca4C65B6C559874757A4c4Ece0',
        tokenId: '9138'
    },
    event: 'Transfer',
    signature: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    raw: {
        data: '0x',
        topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '0x0000000000000000000000006d0267156f1c6ce44caa4bf129b76009d3d41830',
            '0x000000000000000000000000c310e760778ecbca4c65b6c559874757a4c4ece0',
            '0x00000000000000000000000000000000000000000000000000000000000023b2'
        ]
    }
}

function filterEvents(event: any) {
    const picked = (({ transactionHash, blockNumber, returnValues: { from, to, tokenId } }) => (
        { transactionHash, blockNumber, tokenId, "fromAddres": from, "toAddress": to }
    ))(event);
    return picked
}

let a = filterEvents(val)
console.log(a)