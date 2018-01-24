import * as http from 'http';
import { getTransaction } from '../bdbservice/BdbService'
import * as debug from 'debug';

// config
const config = require('../config/config');

// debug
const log = debug('server:listener:actions');

// db models
const models = require('../models');

export function handleAction(inputData) {
  getTransaction(inputData.asset_id).then((transaction)=>{
    switch(transaction.asset.data.data) {
      case "UserAsset":
        handleUserAsset(transaction)
        break
      case "OfferAsset":
        handleOfferAsset(transaction)
        break
      }
    }
  )
}

function handleUserAsset(transaction) {

  // input checks
  if (
    transaction.operation !== "CREATE" ||
    transaction.metadata.email === undefined ||
    transaction.metadata.kra === undefined
  ){
    log('userAsset missing parameters')
    return
  }

  /*
  console.log("public key: <public Key>")
  console.log(transaction.inputs[0].owners_before[0])

  console.log("operation: CREATE")
  console.log(transaction.operation)

  console.log("metadata email: <email>")
  console.log(transaction.metadata.email)

  console.log("metadata name: <name>")
  console.log(transaction.metadata.name)
  */

  // create user on xtech

  // save user localy
}

function handleOfferAsset(transaction) {
  // checks
  // money to escrow
}

function handleCancelAsset(transaction) {
  // checks
  // update status
  // money from escrow back to owner
}

function handleAcceptAsset(transaction) {
  // checks
  // update status
}

function handleTokenTransfer(transaction) {
  // checks
  // money from escrow to new account
}
