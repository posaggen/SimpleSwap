const BigNumber = require('bignumber.js');
const program = require('commander');
const Web3 = require('web3');
const w3 = new Web3('https://bsc-dataseed.binance.org/');
const fs = require('fs');

const routerAbi = JSON.parse(fs.readFileSync(__dirname + '/routerV2.abi'));

const erc20Abi = JSON.parse(fs.readFileSync(__dirname + '/erc20.abi'));

const routerAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
const wbnbAddress = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';

const router = new w3.eth.Contract(routerAbi, routerAddress);

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function printReceipt(hashes) {
  for (let i = 0; i < hashes.length; ++i) {
    let receipt = await w3.eth.getTransactionReceipt(hashes[i]);
    if (receipt !== null) {
      console.log(receipt);
      return;
    }
  }
}

async function run() {
  let nonce = await w3.eth.getTransactionCount(account.address);
  let decimals = await token.methods.decimals().call();
  amountOutMin = new BigNumber(amountOutMin)
    .multipliedBy(10 ** decimals)
    .toString(10);
  let path = [wbnbAddress, token.options.address];
  let deadline = Math.floor(Date.now() / 1000 + 1000);
  let gasPrice = new BigNumber(await w3.eth.getGasPrice())
    .multipliedBy(1.1)
    .integerValue()
    .toString(10);
  let tx_params = {
    from: account.address,
    to: routerAddress,
    value: amountBnbIn,
    nonce: nonce,
    gasPrice: gasPrice,
    data: router.methods
      .swapExactETHForTokens(amountOutMin, path, account.address, deadline)
      .encodeABI(),
  };
  try {
    let gas = new BigNumber(await w3.eth.estimateGas(tx_params));
    tx_params.gas = gas.multipliedBy(1.3).integerValue().toString(10);
  } catch (e) {
    console.log(e);
    console.log(`transaction will always fail. exit.`);
    return;
  }
  let txHashes = [];
  for (;;) {
    try {
      const { rawTransaction } = await w3.eth.accounts.signTransaction(
        tx_params,
        account.privateKey,
      );
      let event = this.w3.eth.sendSignedTransaction(rawTransaction);
      let hash = await new Promise((resolve, reject) => {
        event.once('transactionHash', resolve);
        event.once('error', reject);
      });
      txHashes.push(hash);
      event.catch(() => {});
      console.log(`transaction broadcast with bsc hash: ${hash}`);
      // check nonce
      let start = Date.now();
      for (;;) {
        await sleep(500);
        let now = Date.now();
        let curNonce = await w3.eth.getTransactionCount(account.address);
        if (curNonce > nonce) {
          console.log(`transaction packed.`);
          printReceipt(txHashes);
          return;
        }
        if ((now - start) / 1000 > resendTimeout) break;
      }
    } catch (e) {
      console.log(e);
    }
    tx_params.gas = new BigNumber(tx_params.gas)
      .multipliedBy(100 + program.gasPriceStep)
      .divided(100);
    if (tx_params.gas.isLargerThan(maxGasPrice)) {
      console.log(`gas price reached upper bound.`);
      for (;;) {
        await sleep(500);
        let curNonce = await w3.eth.getTransactionCount(account.address);
        if (curNonce > nonce) {
          console.log(`transaction packed.`);
          printReceipt(txHashes);
          return;
        }
      }
    }
    tx_params.gas = tx_params.gas.integerValue().toString(10);
  }
}

program
  .option('-t, --token [type]', 'target token address')
  .option('-n, --amountBnbIn [type]', 'bnb amount')
  .option('-m, --amountOutMin [type]', 'minimal out value')
  .option('-p, --privatekey [type]', 'private key of owner')
  .option('-g0, --maxGasPrice [type]', 'max gas price')
  .option('-g1, --gasPriceStep [type]', 'gas price step')
  .option('-r, --resendTimeout [type]', 'resend timeout')
  .parse(process.argv);

let token = new w3.eth.Contract(erc20Abi, program.token);
let amountOutMin = program.amountOutMin;
let amountBnbIn = new BigNumber(program.amountBnbIn)
  .multipliedBy(1e18)
  .toString(10);
let account = w3.eth.accounts.privateKeyToAccount(program.privatekey);
let maxGasPrice = new BigNumber(program.maxGasPrice).multipliedBy(1e9);
let gasPriceStep = new BigNumber(program.gasPriceStep);
let resendTimeout = program.resendTimeout;

run();
