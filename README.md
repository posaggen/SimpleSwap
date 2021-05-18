BUILD:

```bash
npm install
```

RUN:

```bash
cd src
```

```bash
node swap.js --token ${token_hex_address} --amountBnbIn ${bnb_to_swap} --amountOutMin ${minimal_token_received} --privatekey ${your_private_key}
```

EXAMPLE

```bash
node swap.js --token 0xe9e7cea3dedca5984780bafc599bd69add087d56  --amountBnbIn 1  --amountOutMin 500 --maxGasPrice 10 --gasPriceStep 8 --resendTimeout 5 --privatekey 0x...
```

This will swap exact 1 bnb to at least 500 bUSD. If the sent transaction is not packed in 5 seconds, it will send a new transaction with gas price of 8% percent higher. The gas price upper bound is 10 GWei.