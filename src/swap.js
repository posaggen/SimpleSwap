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
    tx_params.gas = gas.multipliedBy(1.3).toString(10);
  } catch (e) {
    console.log(e);
    console.log(`transaction will always fail. exit.`);
    return;
  }
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
    event.catch(() => {});
    console.log(`transaction broadcast with bsc hash: ${hash}`);
  } catch (e) {
    console.log(e);
  }
}

program
  .option('-t, --token [type]', 'target token address')
  .option('-n, --amountBnbIn [type]', 'bnb amount')
  .option('-m, --amountOutMin [type]', 'minimal out value')
  .option('-p, --privatekey [type]', 'private key of owner')
  .parse(process.argv);

let token = new w3.eth.Contract(erc20Abi, program.token);
let amountOutMin = program.amountOutMin;
let amountBnbIn = new BigNumber(program.amountBnbIn)
  .multipliedBy(1e18)
  .toString(10);
let account = w3.eth.accounts.privateKeyToAccount(program.privatekey);

run();
