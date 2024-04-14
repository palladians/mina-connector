<script lang="ts">
    import { writable } from "svelte/store";
    import { constructPaymentTx } from "./lib/tx";
    import { createMockCredential } from "./credentials/mock_credential";
    import { onMount } from "svelte";

    export const messageToSign = writable<string>("Message to sign");
    export const fieldsToSign = writable<string>("[0]");
    export const walletName = writable<string>("");
    export const walletIcon = writable<string>("");
    export const walletIsConnected = writable<boolean>(false);

    onMount(() => {
        setTimeout(() => {
            walletName.set(window.mina?.wallet?.name);
            walletIcon.set(window.mina?.wallet?.icon);
            window.mina
                ?.isConnected()
                ?.then((res) => walletIsConnected.set(res.result));
        }, 500);
    });

    export let enable = window.mina?.enable;
    export let disconnect = window.mina?.disconnect;
    export const signMessage = async () => {
        const response = await window.mina.request({
            method: "mina_sign",
            params: { message: $messageToSign },
        });
        results.set({
            ...$results,
            signMessage: JSON.stringify(response.result, undefined, "\t"),
        });
    };
    export const signFields = async () => {
        const response = await window.mina.request({
            method: "mina_signFields",
            params: JSON.parse($fieldsToSign),
        });
        results.set({
            ...$results,
            signFields: JSON.stringify(response.result, undefined, "\t"),
        });
    };
    const signTx = async () => {
        const accountsResponse = await window.mina.request({
            method: "mina_accounts",
        });
        const constructedTx = constructPaymentTx({
            from: accountsResponse.result[0],
            to: "B62qkYa1o6Mj6uTTjDQCob7FYZspuhkm4RRQhgJg9j4koEBWiSrTQrS",
            amount: 100,
            fee: 1,
            type: "payment",
            nonce: 0,
            validUntil: 321,
        });
        console.log(JSON.stringify(constructedTx));
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
            method: "mina_getState",
            params: { query: { issuer: "University of Example" }, props: [] },
        });
        console.log(response);
        results.set({
            ...$results,
            credential: JSON.stringify(response.result, undefined, "\t"),
        });
    };
    const setCredentialState = async () => {
        const account = getAccounts()
        const credential = createMockCredential(account[0])
        const response = await window.mina.request({
            method: "mina_setState",
            params: {
                objectName: "Pallad Mock Credential",
                object: credential,
            },
        });
        console.log(response);
        // nothing to write in the app
        // since it is writing to Pallad
    };
    export const results = writable({
        accounts: "",
        chainId: "",
        balance: null,
        signFields: "",
        signMessage: "",
        signTransactions: "",
        credential: "",
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
                        <div class="stat-value">{$walletName}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Icon</div>
                        <div class="stat-value">
                            <img
                                src={$walletIcon}
                                width="28"
                                height="28"
                                alt={$walletName}
                            />
                        </div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Enabled</div>
                        <div class="stat-value">{$walletIsConnected}</div>
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
                </div>
            </div>
        </div>
        <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
                <h2 class="text-2xl font-semibold">Proofs Store</h2>
                <p>Result</p>
                <textarea
                    class="textarea textarea-bordered h-32 resize-none"
                    placeholder="Result"
                    value={$results.credential}
                />
                <div class="grid grid-cols-2 gap-2">
                    <button
                        class="btn btn-neutral flex-1"
                        on:click={setCredentialState}>mina_setState</button
                    >
                    <button
                        class="btn btn-neutral flex-1"
                        on:click={getCredential}>mina_getState</button
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
                    bind:value={$messageToSign}
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
                    bind:value={$fieldsToSign}
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
