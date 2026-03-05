---
title: "Uniswap Permit2 Phishing: The Silent Signature Draining Wallets"
published: 2026-03-06
draft: true
description: "Permit2 was built to improve token approvals. Attackers turned it into the most dangerous phishing vector in DeFi. Here is how they do it and how you can protect yourself."
tags: ['web3', 'security']
---

You approve tokens on DeFi every day. Swap on Uniswap, add liquidity, bridge assets. It feels routine.

But what if one of those "routine" signatures silently handed over **every token in your wallet** to an attacker?

That's exactly what Permit2 phishing does. And it's responsible for some of the largest individual wallet drains in crypto history.

---

## What Is Permit2 and Why Does It Exist?

Before we get to the attack, you need to understand the tool.

**Permit2** is a smart contract deployed by Uniswap Labs in late 2022. It was designed to solve a real problem: the old ERC-20 approval model was clunky and dangerous.

### The Old Way (ERC-20 Approve)

Every time you wanted to use a new DeFi protocol, you had to:

1. Send an on-chain `approve()` transaction (costs gas)
2. Often approve **unlimited** token amounts (because who wants to approve again every time?)
3. These approvals **never expire** unless you manually revoke them

That meant if a protocol got hacked six months later, your old approval could still be exploited.

### The Permit2 Way

Permit2 introduced a better model:

- **One-time approval** to the Permit2 contract, then use off-chain signatures for individual dApps
- **Time-bound permissions** that can expire
- **Batch operations** to approve multiple tokens in one go

Sounds great, right? It is — until attackers figured out how to weaponize it.

---

## How Permit2 Phishing Works: The Kill Chain

Here's the attack, step by step. No smart contract exploit needed. Just social engineering and a signature.

### Step 1: The Bait

The attacker sets up a phishing site. It could be:

- A fake airdrop claim page ("You're eligible for 5,000 UNI tokens!")
- A spoofed DeFi interface (looks exactly like Uniswap, 1inch, or OpenSea)
- A fake NFT mint page
- A malicious link shared through a compromised Discord, Telegram, or X account

> **Screenshot suggestion:** A phishing site mimicking a legitimate DeFi airdrop page with a "Claim Tokens" button. The URL bar shows a subtle typo domain like `unisvvap.com` instead of `uniswap.org`.

### Step 2: Connect Wallet

The victim connects their wallet. Nothing unusual here — connecting a wallet alone doesn't give attackers access. But it lets the phishing site see:

- Which tokens the victim holds
- Their balances
- Whether they've already approved Permit2 (most active DeFi users have)

### Step 3: The Malicious Signature Request

Here's where it gets dangerous. The site pops up a **signature request** in MetaMask or whatever wallet the victim uses. It looks like a standard "Sign this message" prompt.

But buried in that signature is a **Permit2 `permit()` or `permitTransferFrom()` call** that authorizes the attacker to:

- Transfer **specific tokens** (or all of them)
- In **unlimited amounts**
- To the **attacker's address**
- With a **very long expiration** (sometimes set years into the future)

> **Screenshot suggestion:** A MetaMask signature request showing a Permit2 message. The key fields to highlight: `spender` (attacker's address), `amount` (a massive number like 115792089237316195423570985008687907853269984665640564039457584007913129639935, which is `type(uint256).max`), and `expiration` (a timestamp far in the future).

### Step 4: The signature is NOT an on-chain transaction

This is the critical detail that makes Permit2 phishing so effective:

**The victim never sees a gas fee confirmation.** There's no "Confirm Transaction" screen with a gas estimate. It's just a signature — feels harmless, like signing a login message.

But that signature is a **cryptographic authorization** that the attacker can now submit to the Permit2 contract on their own.

### Step 5: The Drain

Within seconds (or sometimes hours later), the attacker:

1. Takes the victim's signature
2. Calls `permit()` on the Permit2 contract with the victim's signed data
3. Calls `transferFrom()` to move all authorized tokens to their wallet
4. Tokens are gone. Transaction is final. No undo button.

> **Screenshot suggestion:** An Etherscan transaction showing a `transferFrom` call on the Permit2 contract. The "From" is the victim's address, "To" is the attacker's address, and the value shows a large token transfer.

---

## Real-World Permit2 Phishing Attacks

### $2.7 Million Gone in One Signature

In October 2023, a single wallet lost approximately **$2.7 million** worth of tokens after signing a malicious Permit2 approval. The victim had interacted with what appeared to be a legitimate DeFi interface. One signature. That's all it took.

Security firm Scam Sniffer reported that the attacker used a classic permit phishing approach — the victim signed an off-chain Permit2 message, and the attacker submitted the transaction to drain the wallet.

### The $24.2 Million Permit Phishing Heist

In September 2023, a crypto whale lost **$24.2 million** in staked Ethereum (stETH and rETH) through a permit-based phishing attack. The victim signed what appeared to be a standard token approval, but it was actually a permit signature that gave the attacker full access to their Lido and Rocket Pool staked assets.

This wasn't a Permit2 attack specifically — it used the older ERC-2612 permit standard — but the technique is identical: **trick the user into signing an off-chain message that authorizes token transfers.**

### Inferno Drainer and Permit2

Remember Inferno Drainer, the drainer-as-a-service kit? Before it "shut down" (spoiler: it came back), it had stolen over **$80 million** across 100,000+ victims. A significant portion of those drains used Permit2 signatures as the extraction mechanism.

The kit would:
- Detect which tokens the victim held
- Automatically craft the optimal Permit2 payload
- Target the highest-value tokens first
- Execute the drain within seconds of getting the signature

---

## Why Permit2 Phishing Is So Dangerous

Let's break down why this specific attack vector is devastating:

### 1. No Gas Fee = No Red Flag

Traditional malicious transactions trigger a gas confirmation. Users have learned (somewhat) to pause at that screen. Permit2 signatures skip it entirely.

### 2. Signature Requests Look Harmless

Most wallet UIs show signature requests as simple "Sign Message" prompts. The actual Permit2 data — spender address, token amounts, expiration — is buried in structured data that most users don't read or understand.

### 3. One Signature Can Drain Multiple Tokens

Permit2 supports batch operations. A single signature can authorize the transfer of **every token** in your wallet, not just one.

### 4. The Approval Persists

Even if you don't get drained immediately, that signed permit can be used later — as long as it hasn't expired. Attackers sometimes wait, watching for the wallet balance to grow before executing the drain.

### 5. Most DeFi Users Have Already Approved Permit2

If you've used Uniswap, the Permit2 contract likely already has approval to spend your tokens. The attacker doesn't need you to approve Permit2 first — they just need your signature.

---

## Anatomy of a Malicious Permit2 Signature

Here's what the data actually looks like when you decode a malicious Permit2 message:

```
PermitSingle {
  details: {
    token: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48  // USDC
    amount: 115792089237316195423570985008687907853269...  // max uint256 (unlimited)
    expiration: 1893456000  // January 2030
    nonce: 0
  }
  spender: 0x[ATTACKER_ADDRESS]
  sigDeadline: 1893456000
}
```

What should make you suspicious:

- **amount** is set to the maximum possible value (unlimited)
- **expiration** is years in the future
- **spender** is an unknown address (not a known DeFi protocol)
- **sigDeadline** is extremely far out

Compare this with a legitimate Permit2 signature from Uniswap:

```
PermitSingle {
  details: {
    token: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48  // USDC
    amount: 1000000000  // Exactly 1,000 USDC
    expiration: 1709683200  // 30 minutes from now
    nonce: 5
  }
  spender: 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD  // Uniswap Universal Router
  sigDeadline: 1709683200
}
```

> **Screenshot suggestion:** Side-by-side comparison of a legitimate vs malicious Permit2 signature in a wallet, highlighting the differences in amount, expiration, and spender fields.

---

## How to Protect Yourself from Permit2 Phishing

### Before You Sign Anything

**1. Read the signature data, not just the "Sign" button**

Your wallet shows you the Permit2 details. Actually read them. Check:
- What token is being permitted?
- What amount? (If it's a massive number, that's `unlimited` — be suspicious)
- What's the expiration? (30 minutes is normal. 2030 is not)
- Who is the spender? (Look up the address — is it a known protocol contract?)

**2. Verify the URL obsessively**

Phishing sites use domains like:
- `unisvvap.com` (double v instead of w)
- `app-uniswap.org` (subdomain trick)
- `uniswap.xyz` (wrong TLD)
- `claim-uniswap.io` (fake claim page)

Bookmark the real sites. Use those bookmarks. Every time.

**3. Be skeptical of "free money"**

Airdrops that ask you to connect your wallet and sign something are the #1 phishing vector. If it sounds too good to be true — you already know the rest.

**4. Use a hardware wallet**

Hardware wallets like Ledger and Trezor show you transaction details on the device screen. Some now decode Permit2 messages, giving you a second chance to spot something wrong.

### After You've Used DeFi

**5. Revoke unused Permit2 approvals**

Use tools like:
- [Revoke.cash](https://revoke.cash) — Check and revoke token approvals including Permit2
- [Etherscan Token Approval Checker](https://etherscan.io/tokenapprovalchecker) — View all your active approvals

If you have old Permit2 approvals to contracts you no longer use, revoke them.

**6. Use a separate wallet for high-value holdings**

Keep your "interaction wallet" (the one you connect to dApps) separate from your "vault wallet" (where you hold significant assets). Only transfer what you need.

**7. Enable transaction simulation**

Tools like Pocket Universe, Fire, and Blowfish simulate what a transaction or signature will do before you confirm it. They can catch Permit2 drains before they happen.

> **Screenshot suggestion:** A transaction simulation tool (like Pocket Universe) showing a warning: "This signature will allow [unknown address] to transfer ALL of your USDC, USDT, and WETH."

### For Builders and Security Teams

**8. Implement clear signing in your dApp**

If your protocol uses Permit2, make the signature request crystal clear:
- Show the human-readable token name, not just the contract address
- Display the amount in normal units ("1,000 USDC"), not raw wei
- Highlight unusual expiration periods
- Warn if the spender is not your protocol's known contract

**9. Set reasonable defaults**

Don't request unlimited amounts or far-future expirations unless absolutely necessary. Request only what the user needs for the current action.

---

## The Bigger Picture

Permit2 phishing is a perfect example of how **good infrastructure gets turned into attack surface.**

Uniswap built Permit2 to make DeFi safer and more efficient. It genuinely does improve the token approval model. But attackers took that same mechanism and realized:

> "If users are trained to sign Permit2 messages as part of normal DeFi activity, we can slip a malicious one in and they won't think twice."

This is the same pattern we see in Web2: OAuth tokens, API keys, session cookies — every convenience feature eventually becomes an attack vector.

The difference in Web3? **There's no fraud department to call. No bank to reverse the transaction. No "Undo" button.**

The only defense is **awareness, verification, and better tools.**

---

## Key Takeaways

- **Permit2 signatures look harmless but can drain your entire wallet** — no gas fee, no transaction confirmation
- **Always read the details** of what you're signing: token, amount, spender, expiration
- **Bookmark legitimate DeFi sites** and never trust links from social media, DMs, or emails
- **Use transaction simulation tools** to preview what a signature will actually do
- **Revoke old approvals regularly** at revoke.cash
- **Separate your wallets** — never connect your vault to random dApps
- **If you're building**: make Permit2 signatures human-readable and set reasonable defaults

The attackers are counting on you not reading the fine print. Don't make it easy for them.

---

## References

[Uniswap Permit2 Documentation](https://docs.uniswap.org/contracts/permit2/overview)

[Scam Sniffer: Permit2 Phishing Analysis](https://drops.scamsniffer.io/)

[Revoke.cash - Token Approval Manager](https://revoke.cash)

[$24.2M Permit Phishing Attack](https://www.coindesk.com/tech/2023/09/08/crypto-investor-loses-24m-in-staked-ether-in-phishing-attack/)

[Inferno Drainer Deep Dive](https://www.group-ib.com/blog/inferno-drainer/)

[Ethereum Foundation - Trillion Dollar Security Initiative](https://esp.ethereum.foundation/)
