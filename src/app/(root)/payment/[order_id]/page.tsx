"use client";

import { Button } from "@/components/ui/button";
import { useGetConvertedAmount } from "@/features/currency/hooks/use-currency";
import OrderPaymentDetails from "@/features/payment/components/order-payment-details";
import StripePayment from "@/features/payment/components/stripe-payment-elements";
import SumupPayment from "@/features/payment/components/sumup-payment";
import { useGetCreatedOrderById } from "@/features/payment/hooks/use-payment";
import { useTgBackButton } from "@/hooks/use-telegram";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const OrderPaymentPage = () => {
	const router = useRouter();
	useTgBackButton();
	const { order_id } = useParams<{ order_id: string }>();

	const { data: order, isPending } = useGetCreatedOrderById(order_id);

	const { data: amountInTon } = useGetConvertedAmount({
		currency_code: "ton",
		amount: order?.price?.total,
	});

	return (
		<main className="container flex flex-col bg-background gap-2 p-5">
			<OrderPaymentDetails
				order={order}
				isPending={isPending}
				amountInTon={+(amountInTon?.amount || 0)}
			/>
			<StripePayment paymentIntentId={order?.stripe_id} />
			{/* <SumupPayment order={order} /> */}

			<Button
				onClick={() => {
					router.push(`/payment/success?order_id=` + order.id);
				}}
				size={"lg"}
				className="w-full rounded-xl"
			>
				Test Redirect to success page
			</Button>
		</main>
	);
};

export default OrderPaymentPage;
