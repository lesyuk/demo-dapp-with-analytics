	import React, {useCallback, useState} from 'react';
	import ReactJson from 'react-json-view';
	import './style.scss';
	import {SendTransactionRequest, useTonConnectUI, useTonWallet} from "@tonconnect/ui-react";
	import { actionAdditionalEvent } from "../../analytics-events/additional-task.events";
	import { generateInvoice } from "../../utils/generateInvoice";
	import {checkPendingPayments, intervalCallback} from "../../utils/checkPendingPayments";

	// In this example, we are using a predefined smart contract state initialization (`stateInit`)
	// to interact with an "EchoContract". This contract is designed to send the value back to the sender,
	// serving as a testing tool to prevent users from accidentally spending money.
	const defaultTx: SendTransactionRequest = {
		// The transaction is valid for 10 minutes from now, in unix epoch seconds.
		validUntil: Math.floor(Date.now() / 1000) + 600,
		messages: [

			{
				// The receiver's address.
				address: '0:8a5a9c7b70d329be670de4e6cce652d464765114aa98038c66c3d8ceaf2d19b0',
				// Amount to send in nanoTON. For example, 0.005 TON is 5000000 nanoTON.
				amount: '5000000',
				// (optional) State initialization in boc base64 format.
				stateInit: 'te6cckEBBAEAOgACATQCAQAAART/APSkE/S88sgLAwBI0wHQ0wMBcbCRW+D6QDBwgBDIywVYzxYh+gLLagHPFsmAQPsAlxCarA==',
				// (optional) Payload in boc base64 format.
				payload: 'te6ccsEBAQEADAAMABQAAAAASGVsbG8hCaTc/g==',
			},

			// Uncomment the following message to send two messages in one transaction.
			/*
		{
		// Note: Funds sent to this address will not be returned back to the sender.
		address: '0:2ecf5e47d591eb67fa6c56b02b6bb1de6a530855e16ad3082eaa59859e8d5fdc',
		amount: toNano('0.01').toString(),
		}
		*/

		],
	};

	export function TxForm() {
		const [tx, setTx] = useState(defaultTx);
		const wallet = useTonWallet();
		const [tonConnectUi] = useTonConnectUI();
		const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

		const onChange = useCallback((value: object) => setTx((value as { updated_src: typeof defaultTx }).updated_src), []);

		return (
			<div className="send-tx-form">
				<h3>Configure and send transaction</h3>
				<ReactJson src={defaultTx} theme="ocean" onEdit={onChange} onAdd={onChange} onDelete={onChange} />
				<>
					{wallet ? (
						<button onClick={() => tonConnectUi.sendTransaction(tx)}>
							Send transaction
						</button>
					) : (
						<button onClick={() => tonConnectUi.openModal()}>Connect wallet to send the transaction</button>
					)}
					{actionAdditionalEvent ? (
						<button onClick={() => window.dispatchEvent(actionAdditionalEvent as Event)}>
							Send action additional task
						</button>
					) : console.error(`Action task ID is undefined`)}
					{window.localStorage.getItem('BOT_TOKEN') ? (
						<button onClick={async () => {
							if (!intervalId) {
								const intervalId = setInterval(intervalCallback, 5000);

								setIntervalId(intervalId);
							}

							window.Telegram.WebApp.openInvoice(await generateInvoice(window.localStorage.getItem('BOT_TOKEN') as string))
						}}>
							Generate and open invoice
						</button>
					) : console.error(`Action task ID is undefined`)}
				</>
			</div>
		);
	}
