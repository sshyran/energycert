import * as driver from 'bigchaindb-driver'
import * as bip39 from 'bip39'

const config = require('../config/config');

// gets a Ed25519Keypair from a pass phrase
export function getKeypairFromSeed(seed: string) {
    return new driver.Ed25519Keypair(bip39.mnemonicToSeed(seed).slice(0, 32))
}

// gets a Ed25519Keypair from a pass phrase
export function createKeypairAndSeed() {
    const mnemonic = bip39.generateMnemonic()
    const keypair = new driver.Ed25519Keypair(bip39.mnemonicToSeed(mnemonic).slice(0, 32))
    return {
        'passPhrase': mnemonic,
        'keyPair': keypair
    }
}

// gets a transaction based on id
export async function getTransaction(txId: string) {
    try {
        await this._getConnection()
        const tx = await this.conn.getTransaction(txId)
        return tx
    } catch (err) {
        console.log(err)
        return null
    }
}

// searches assets in BDB based on a text input
export async function searchTypeInstances(text: string, link: string) {
    await this._getConnection()
    const txList = []
    const assetList = await this.conn.searchAssets(text)
    for (const asset of assetList) {
        if (asset.data.link === link) {
            const tx = await this.conn.getTransaction(asset.id)
            txList.push(tx)
        }
    }

    return txList
}

// get all users
export async function getAllUsers() {
    await this._getConnection()
    const txList = []
    const assetList = await this.conn.searchAssets('"UserAsset"')
    for (let asset of assetList) {
        let tx = await this.conn.getTransaction(asset.id)
        txList.push(tx)
    }
    return txList
}

// searches assets in BDB based on a text input
export async function searchChildAssets(text: string, link: string, parent: string) {
    await this._getConnection()
    const txList = []
    const assetList = await this.conn.searchAssets(text)
    for (const asset of assetList) {
        if (asset.data.link === link && asset.data.parent === parent) {
            const tx = await this.conn.getTransaction(asset.id)
            txList.push(tx)
        }
    }

    return txList
}

// gets all transfer transactions for an asset
export async function getTransferTransactionsForAsset(assetId: string) {
    await this._getConnection()
    return this.conn.listTransactions(assetId, 'TRANSFER')
}

// gets all outputs (spent or unspent) from a wallet
export async function getAssetsInWallet(publicKey: string, spent: boolean) {
    await this._getConnection()
    const assets = []
    const unSpent = await this.conn.listOutputs(publicKey, spent)

    if (!unSpent || !unSpent.length) {
        return []
    }

    for (const item of unSpent) {
        const tx = await this.conn.getTransaction(item.transaction_id)
        if (tx.operation === 'CREATE') {
            assets.push({
                'id': tx.id,
                'asset': tx.asset,
                'metadata': tx.metadata
            })
        } else {
            const crTx = await this.conn.getTransaction(tx.asset.id)
            assets.push({
                'id': crTx.id,
                'asset': crTx.asset,
                'metadata': crTx.metadata
            })
        }
    }

    return assets
}

// returns the blockchain history of an asset
// under the hood, gets a list of metadata objects of all transfers of the asset
export async function getAssetHistory(assetId: string) {
    await this._getConnection()

    const createTx = await this.getTransaction(assetId)
    const transferTx = await this.getTransferTransactionsForAsset(assetId)

    const assetData = createTx.asset.data
    const metadataArr = []
    metadataArr.push(createTx.metadata)
    for (const trtx of transferTx) {
        metadataArr.push(trtx.metadata)
    }
    return metadataArr
}

// Creates a new asset in BigchainDB
export async function createNewAsset(keypair, asset, metadata) {
    await this._getConnection()
    const condition = driver.Transaction.makeEd25519Condition(keypair.publicKey, true)

    const output = driver.Transaction.makeOutput(condition)
    output.public_keys = [keypair.publicKey]

    const transaction = driver.Transaction.makeCreateTransaction(
        asset,
        metadata,
        [output],
        keypair.publicKey
    )

    const txSigned = driver.Transaction.signTransaction(transaction, keypair.privateKey)
    let tx
    await this.conn.postTransaction(txSigned)
        .then(() => this.conn.pollStatusAndFetchTransaction(txSigned.id))
        .then(retrievedTx => {
            tx = retrievedTx
        })

    return tx
}

// Creates a new divisible asset in BigchainDB
export async function createNewDivisibleAsset(keypair, asset, metadata, amount) {
    await this._getConnection()
    const condition = driver.Transaction.makeEd25519Condition(keypair.publicKey, true)

    const output = driver.Transaction.makeOutput(condition, amount.toString())
    output.public_keys = [keypair.publicKey]

    const transaction = driver.Transaction.makeCreateTransaction(
        asset,
        metadata,
        [output],
        keypair.publicKey
    )

    const txSigned = driver.Transaction.signTransaction(transaction, keypair.privateKey)
    let tx
    await this.conn.postTransaction(txSigned)
        .then(() => this.conn.pollStatusAndFetchTransaction(txSigned.id))
        .then(retrievedTx => {
            tx = retrievedTx
        })

    return tx
}

// Transfers a BigchainDB asset from an input transaction to a new public key
export async function transferAsset(tx: any, fromKeyPair, toPublicKey, metadata) {
    await this._getConnection()

    const txTransfer = driver.Transaction.makeTransferTransaction(
        [{ tx: tx, output_index: 0 }],
        [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(toPublicKey))],
        metadata
    );

    const txSigned = driver.Transaction.signTransaction(txTransfer, fromKeyPair.privateKey)
    let trTx
    await this.conn.postTransaction(txSigned)
        .then(() => this.conn.pollStatusAndFetchTransaction(txSigned.id))
        .then(retrievedTx => {
            trTx = retrievedTx
        })

    return trTx
}

export async function transferDivisibleAsset(tx: any, fromKeyPair, toPublicKeysAmounts, metadata) {
    await this._getConnection()

    let receivers = []
    for (let entry of toPublicKeysAmounts) {
        let output = driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(entry.publicKey), entry.amount.toString())
        receivers.push(output)
    }

    const txTransfer = driver.Transaction.makeTransferTransaction(
        [{ tx: tx, output_index: 0 }],
        receivers,
        null
    );

    const txSigned = driver.Transaction.signTransaction(txTransfer, fromKeyPair.privateKey)
    let trTx
    await this.conn.postTransaction(txSigned)
        .then(() => this.conn.pollStatusAndFetchTransaction(txSigned.id))
        .then(retrievedTx => {
            trTx = retrievedTx
        })

    return trTx
}

export async function getSortedTransactions(assetId) {
    return this.conn.listTransactions(assetId)
        .then((txList) => {
            if (txList.length <= 1) {
                return txList
            }
            const inputTransactions = []
            txList.forEach((tx) =>
                tx.inputs.forEach(input => {
                    if (input.fulfills) {
                        inputTransactions.push(input.fulfills.transaction_id)
                    }
                })
            )
            const unspents = txList.filter((tx) => inputTransactions.indexOf(tx.id) === -1)
            if (unspents.length) {
                let tipTransaction = unspents[0]
                let tipTransactionId = tipTransaction.inputs[0].fulfills.transaction_id
                const sortedTxList = []
                while (true) { // eslint-disable-line no-constant-condition
                    sortedTxList.push(tipTransaction)
                    try {
                        tipTransactionId = tipTransaction.inputs[0].fulfills.transaction_id
                    } catch (e) {
                        break
                    }
                    if (!tipTransactionId) {
                        break
                    }
                    tipTransaction = txList.filter((tx) => // eslint-disable-line no-loop-func
                        tx.id === tipTransactionId)[0]
                }
                return sortedTxList.reverse()
            } else {
                console.error('something went wrong while sorting transactions',
                    txList, inputTransactions)
            }
            return txList
        })
}

// transaction sent to xtech
export function sentToXtech(transaction) {
  if (
    transaction.outputs[0].public_keys.length !== 1 ||
    transaction.outputs[0].public_keys[0] !== config.xtech_keypair.publicKey
  ) {
    return false
  } else {
    return true
  }
}

// private: creates a connection to BDB server
export async function _getConnection() {
    if (!this.conn) {
        this.conn = new driver.Connection(config.bdb_url)
    }
}
