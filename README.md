BUILD:

npm install

RUN:

cd src

node swap.js --token ${token_hex_address} --amountBnbIn ${bnb_to_swap} --amountOutMin ${minimal_token_received} --privatekey ${your_private_key}

EXAMPLE:

node swap.js --token 0xe9e7cea3dedca5984780bafc599bd69add087d56  --amountBnbIn 1  --amountOutMin 500 --privatekey 0x...

This will swap exact 1 bnb to at least 500 bUSD.l