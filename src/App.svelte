<script lang="ts">
    import { onMount } from "svelte";
    import { derived, writable } from "svelte/store";
    import { createMockCredential } from "./credentials/mock_credential";

    type MinaProvider = {
        info: {
            icon: string;
            name: string;
            rdns: string;
            slug: string;
        };
        // biome-ignore lint/suspicious/noExplicitAny: todo
        provider: any;
    };

    export const providers = writable<MinaProvider[]>([]);
    export const currentProviderSlug = writable<string>(
        localStorage.getItem("currentProvider") ?? "",
    );
    currentProviderSlug.subscribe((newSlug) =>
        localStorage.setItem("currentProvider", newSlug),
    );
    export const currentProvider = derived(
        [providers, currentProviderSlug],
        ([$providers, $currentProviderSlug]) =>
            $providers.find(
                (provider) => provider.info.slug === $currentProviderSlug,
            ),
    );
    export const messageToSign = writable<string>("Message to sign");
    export const fieldsToSign = writable<string>("[0]");

    onMount(() => {
        window.addEventListener("mina:announceProvider", (event) => {
            providers.set([...$providers, event.detail]);
        });
        window.dispatchEvent(new Event("mina:requestProvider"));
    });

    export const signMessage = async () => {
        const response = await $currentProvider?.provider.request({
            method: "mina_sign",
            params: { message: $messageToSign },
        });
        results.set({
            ...$results,
            signMessage: JSON.stringify(response.result, undefined, "\t"),
        });
    };
    export const signFields = async () => {
        const response = await $currentProvider?.provider.request({
            method: "mina_signFields",
            params: { fields: JSON.parse($fieldsToSign) },
        });
        results.set({
            ...$results,
            signFields: JSON.stringify(response.result, undefined, "\t"),
        });
    };
    export const createNullifier = async () => {
        const response = await $currentProvider?.provider.request({
            method: "mina_createNullifier",
            params: { message: JSON.parse($fieldsToSign) },
        });
        results.set({
            ...$results,
            signFields: JSON.stringify(response.result, undefined, "\t"),
        });
    };
    const signTx = async () => {
        const accountsResponse = await $currentProvider?.provider.request({
            method: "mina_accounts",
        });
        const transaction = {
            ...$transactionBody,
            from:
                $transactionBody.from.length > 0
                    ? $transactionBody.from
                    : accountsResponse.result[0],
        };
        const response = await $currentProvider?.provider.request({
            method: "mina_signTransaction",
            params: { transaction },
        });
        results.set({
            ...$results,
            signTransactions: JSON.stringify(response.result, undefined, "\t"),
        });
        return response.result;
    };
    const sendTx = async () => {
        const accountsResponse = await $currentProvider?.provider.request({
            method: "mina_accounts",
        });
        const transaction = {
            ...$transactionBody,
            from:
                $transactionBody.from.length > 0
                    ? $transactionBody.from
                    : accountsResponse.result[0],
        };
        const signedTransaction = await signTx();
        const response = await $currentProvider?.provider.request({
            method: "mina_sendTransaction",
            params: {
                signedTransaction,
                transactionType: "payment",
            },
        });
        results.set({
            ...$results,
            signTransactions: JSON.stringify(response.result, undefined, "\t"),
        });
    };
    const getAccounts = async () => {
        const response = await $currentProvider?.provider.request({
            method: "mina_accounts",
        });
        console.log(response);
        results.set({
            ...$results,
            accounts: JSON.stringify(response.result),
        });
        return response.result;
    };
    const requestAccounts = async () => {
        const response = await $currentProvider?.provider.request({
            method: "mina_requestAccounts",
        });
        console.log(response);
        results.set({
            ...$results,
            accounts: JSON.stringify(response.result),
        });
    };
    const getChainId = async () => {
        const response = await $currentProvider?.provider.request({
            method: "mina_chainId",
        });
        console.log(response);
        results.set({
            ...$results,
            chainId: response.result,
        });
    };
    const getBalance = async () => {
        const response = await $currentProvider?.provider.request({
            method: "mina_getBalance",
        });
        console.log(response);
        results.set({
            ...$results,
            balance: response.result,
        });
    };
    const getCredential = async () => {
        const response = await $currentProvider?.provider.request({
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
        const accounts = await getAccounts();
        const credential = createMockCredential(accounts[0]);
        const response = await $currentProvider?.provider.request({
            method: "mina_setState",
            params: {
                objectName: "Pallad Mock Credential",
                object: credential,
            },
        });
        console.log(response);
    };

    const requestNetwork = async () => {
        const response = await $currentProvider?.provider.request({
            method: "mina_requestNetwork",
        });
        results.set({
            ...$results,
            requestNetworkResponse: JSON.stringify(response.result),
        });
    };
    export const transactionBody = writable({
        from: "",
        to: "B62qkYa1o6Mj6uTTjDQCob7FYZspuhkm4RRQhgJg9j4koEBWiSrTQrS",
        memo: "",
        fee: 100_000_000,
        amount: 3_000_000_000,
        nonce: 0,
    });
    export const results = writable({
        accounts: "",
        chainId: "",
        balance: null,
        signFields: "",
        signMessage: "",
        signTransactions: "",
        credential: "",
        addChainResponse: "",
        switchChainResponse: "",
        requestNetworkResponse: "",
    });
</script>

<main class="container mx-auto space-y-4 p-4 pb-24">
    <div class="grid flex-1 grid-cols-1 items-start gap-8 lg:grid-cols-2">
        <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
                <h1 class="text-3xl font-semibold">Mina Web Connector</h1>
                <p>Web Connector E2E Testing zkApp</p>
                <div class="stats shadow">
                    <div class="stat">
                        <div class="stat-title">Wallet</div>
                        <div class="stat-value">
                            {$currentProvider?.info.name}
                        </div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Icon</div>
                        <div class="stat-value">
                            <img
                                width="28"
                                height="28"
                                src={$currentProvider?.info.icon}
                                alt={$currentProvider?.info.name}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
                <h2 class="text-2xl font-semibold">Available Wallets</h2>
                <div class="flex flex-col gap-2">
                    {#each $providers as provider}
                        <div class="flex justify-between items-center">
                            <div class="flex gap-4 items-center">
                                <img
                                    src={provider.info.icon}
                                    width={32}
                                    height={32}
                                    alt={provider.info.name}
                                />
                                <h3 class="text-lg">{provider.info.name}</h3>
                            </div>
                            <button
                                type="button"
                                class="btn btn-neutral"
                                on:click={() =>
                                    currentProviderSlug.set(provider.info.slug)}
                                >Use {provider.info.name}</button
                            >
                        </div>
                    {/each}
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
                    <div class="flex gap-2">
                        <button
                            class="btn btn-neutral flex-1"
                            on:click={getAccounts}>mina_accounts</button
                        >
                        <button
                            class="btn btn-neutral flex-1"
                            on:click={requestAccounts}
                            >mina_requestAccounts</button
                        >
                    </div>
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
                    <input
                        class="input input-bordered"
                        value={$results.requestNetworkResponse}
                    />
                    <button
                        class="btn btn-neutral flex-1"
                        on:click={requestNetwork}>mina_requestNetwork</button
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
                        class="btn btn-primary flex-1"
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
                <h2 class="text-2xl font-semibold">
                    Sign Fields/Create Nullifier
                </h2>
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
                <div class="flex gap-2">
                    <button class="btn btn-primary flex-1" on:click={signFields}
                        >mina_signFields</button
                    >
                    <button
                        class="btn btn-neutral flex-1"
                        on:click={createNullifier}>mina_createNullifier</button
                    >
                </div>
            </div>
        </div>
        <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
                <h2 class="text-2xl font-semibold">Transaction</h2>
                <p>To</p>
                <input
                    class="input input-bordered"
                    placeholder="To"
                    bind:value={$transactionBody.to}
                />
                <p>Amount</p>
                <input
                    class="input input-bordered"
                    type="number"
                    placeholder="Amount"
                    bind:value={$transactionBody.amount}
                />
                <p>Fee</p>
                <input
                    class="input input-bordered"
                    type="number"
                    placeholder="Fee"
                    bind:value={$transactionBody.fee}
                />
                <p>Memo</p>
                <input
                    class="input input-bordered"
                    placeholder="Memo"
                    bind:value={$transactionBody.memo}
                />
                <p>Memo</p>
                <input
                    class="input input-bordered"
                    placeholder="Nonce"
                    bind:value={$transactionBody.nonce}
                />
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
                    <button class="btn btn-neutral flex-1" on:click={sendTx}
                        >mina_sendTransaction</button
                    >
                </div>
            </div>
        </div>
    </div>
</main>
