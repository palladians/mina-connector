<script lang="ts">
    import { writable } from "svelte/store";
    import { Mina } from "o1js";
    import { constructPaymentTx } from "./lib/tx";
    import Client from "mina-signer";
    import { exampleCredential } from './credentials/mock_credential'

    const Local = Mina.LocalBlockchain();
    const signerClient = new Client({ network: Local.getNetworkId() });
    const keypair = signerClient.genKeys();

    const walletName = window.mina.wallet.name;
    const walletIcon = window.mina.wallet.icon;
    export let isConnected = window.mina.isConnected();
    export let enable = window.mina.enable;
    export let disconnect = window.mina.disconnect;
    export const signMessage = async () => {
        const response = await window.mina.request({
            method: "mina_sign",
            params: { message: "test" },
        });
        results.set({
            ...$results,
            signMessage: JSON.stringify(response.result, undefined, "\t"),
        });
    };
    export const signFields = async () => {
        const response = await window.mina.request({
            method: "mina_signFields",
            params: [0],
        });
        results.set({
            ...$results,
            signFields: JSON.stringify(response.result, undefined, "\t"),
        });
    };
    const signTx = async () => {
        console.log(">>>KP", keypair);
        const constructedTx = constructPaymentTx({
            from: keypair.publicKey,
            to: keypair.publicKey,
            amount: 100,
            fee: 0,
            type: "payment",
            nonce: 0,
            validUntil: 321,
        });
        const response = await window.mina.request({
            method: "mina_signTransaction",
            params: { transaction: constructedTx },
        });
        results.set({
            ...$results,
            signTransactions: JSON.stringify(response.result, undefined, "\t"),
        });
    };
    const getAccounts = async () => {
        const response = await window.mina.request({ method: "mina_accounts" });
        console.log(response);
        results.set({
            ...$results,
            accounts: JSON.stringify(response.result),
        });
    };
    const getChainId = async () => {
        const response = await window.mina.request({ method: "mina_chainId" });
        console.log(response);
        results.set({
            ...$results,
            chainId: response.result,
        });
    };
    const getBalance = async () => {
        const response = await window.mina.request({
            method: "mina_getBalance",
        });
        console.log(response);
        results.set({
            ...$results,
            balance: response.result,
        });
    };
    const getCredential = async () => {
        const response = await window.mina.request({
            method: 'mina_getState', params: {query: {issuer: 'University of Example'}, props: []}
        })
        console.log(response);
        results.set({
            ...$results,
            credential: response.result,
        })
    };
    const setCredentialState = async () => {
        const response = await window.mina.request({
            method: 'mina_setState', params: {objectName: "exampleCredential", object: exampleCredential}
        })
        console.log(response);
        // nothing to write in the app
        // since it is writing to Pallad
    }
    export const results = writable({
        accounts: "",
        chainId: "",
        balance: null,
        signFields: "",
        signMessage: "",
        signTransactions: "",
        credential: "",
        mockCredential: exampleCredential,
    });
</script>

<main class="container mx-auto space-y-4 p-4">
    <div class="grid flex-1 grid-cols-1 items-start gap-8 lg:grid-cols-2">
        <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
                <h1 class="text-3xl font-semibold">Mina Web Connector</h1>
                <p>Web Connector E2E Testing zkApp</p>
                <div class="stats shadow">
                    <div class="stat">
                        <div class="stat-title">Wallet</div>
                        <div class="stat-value">{walletName}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Icon</div>
                        <div class="stat-value">
                            <img
                                src={walletIcon}
                                width="28"
                                height="28"
                                alt={walletName}
                            />
                        </div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Enabled</div>
                        {#await isConnected}
                            <div class="stat-value">Loading</div>
                        {:then connected}
                            <div class="stat-value">{connected.result}</div>
                        {/await}
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-primary flex-1" on:click={enable}
                        >Enable (Authorize)</button
                    >
                    <button class="btn btn-neutral flex-1" on:click={disconnect}
                        >Disconnect</button
                    >
                </div>
            </div>
        </div>
        <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
                <h2 class="text-2xl font-semibold">Getters</h2>
                <div class="grid grid-cols-[2fr_1fr] gap-2">
                    <input
                        class="input input-bordered"
                        value={$results.accounts}
                    />
                    <button
                        class="btn btn-neutral flex-1"
                        on:click={getAccounts}>mina_accounts</button
                    >
                    <input
                        class="input input-bordered"
                        value={$results.chainId}
                    />
                    <button class="btn btn-neutral flex-1" on:click={getChainId}
                        >mina_chainId</button
                    >
                    <input
                        class="input input-bordered"
                        value={$results.balance}
                    />
                    <button class="btn btn-neutral flex-1" on:click={getBalance}
                        >mina_getBalance</button
                    >
                    <button class="btn btn-neutral flex-1" on:click={getCredential}
                        >mina_getState</button
                    >
                </div>
            </div>
        </div>
        <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
                <h2 class="text-2xl font-semibold">Setters</h2>
                <div class="grid grid-cols-[2fr_1fr] gap-2">
                    <input
                        class="input input-bordered"
                        value={$results.mockCredential}
                    />
                    <button class="btn btn-neutral flex-1" on:click={setCredentialState}
                        >mina_setState</button
                    >
                </div>
            </div>
        </div>
        <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
                <h2 class="text-2xl font-semibold">Sign Message</h2>
                <p>Message</p>
                <input
                    class="input input-bordered"
                    placeholder="Message to sign"
                />
                <p>Result</p>
                <textarea
                    class="textarea textarea-bordered h-32 resize-none"
                    placeholder="Result"
                    value={$results.signMessage}
                ></textarea>
                <button class="btn btn-primary flex-1" on:click={signMessage}
                    >mina_sign</button
                >
            </div>
        </div>
        <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
                <h2 class="text-2xl font-semibold">Sign Fields</h2>
                <p>Fields</p>
                <input
                    class="input input-bordered"
                    placeholder="Stringified fields"
                    value="[0]"
                />
                <p>Result</p>
                <textarea
                    class="textarea textarea-bordered h-32 resize-none"
                    placeholder="Result"
                    value={$results.signFields}
                ></textarea>
                <button class="btn btn-primary flex-1" on:click={signFields}
                    >mina_signFields</button
                >
            </div>
        </div>
        <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
                <h2 class="text-2xl font-semibold">Transaction</h2>
                <p>To</p>
                <input class="input input-bordered" placeholder="Received" />
                <p>Amount</p>
                <input class="input input-bordered" placeholder="Amount" />
                <p>Fee</p>
                <input class="input input-bordered" placeholder="Fee" />
                <p>Memo</p>
                <input class="input input-bordered" placeholder="Memo" />
                <p>Result</p>
                <textarea
                    class="textarea textarea-bordered h-32 resize-none"
                    placeholder="Result"
                    value={$results.signTransactions}
                ></textarea>
                <div class="flex gap-2">
                    <button class="btn btn-primary flex-1" on:click={signTx}
                        >mina_signTransaction</button
                    >
                    <button class="btn btn-neutral flex-1" on:click={signTx}
                        >mina_sendTransaction</button
                    >
                </div>
            </div>
        </div>
    </div>
</main>
