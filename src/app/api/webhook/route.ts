import {db} from '@/db';
import {stripe} from '@/lib/stripe';
import {headers} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';
import {Resend} from 'resend';
import OrderReceivedEmail from '@/components/emails/OrderReceivedEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
	try {
		const body = await req.text(); // raw body that comes from stripe.

		// Getting the 'stripe-signature' from the headers of the request
		const signature = headers().get('stripe-signature');

		if (!signature) return new Response('Invalid Signature', {status: 400});

		// Creating the event for the webhook
		const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);

		if (event.type === 'checkout.session.completed') {
			if (!event.data.object.customer_details?.email) {
				throw new Error('Missing User Email.');
			}

			// getting the session from the event
			const session = event.data.object as Stripe.Checkout.Session;

			const {userId, orderId} = session.metadata || {
				userId: null,
				orderId: null,
			};

			if (!userId || !orderId) {
				throw new Error('Invalid request metadata.');
			}

			const billingAddress = session.customer_details!.address;
			const shippingAddress = session.shipping_details!.address;

			// update the order in the database with the shipping and billing address properties
			const updatedOrder = await db.order.update({
				where: {
					id: orderId,
				},
				data: {
					isPaid: true,
					shippingAddress: {
						create: {
							name: session.customer_details!.name!,
							city: shippingAddress!.city!,
							country: shippingAddress!.country!,
							postalCode: shippingAddress!.postal_code!,
							street: shippingAddress!.line1!,
							state: shippingAddress!.state!,
						},
					},
					billingAddress: {
						create: {
							name: session.customer_details!.name!,
							city: billingAddress!.city!,
							country: billingAddress!.country!,
							postalCode: billingAddress!.postal_code!,
							street: billingAddress!.line1!,
							state: billingAddress!.state!,
						},
					},
				},
			});

			// send the OrderReceivedEmail
			await resend.emails.send({
				from: 'CaseCobra <522nilesh.parmar105@gmail.com>',
				to: [event.data.object.customer_details.email],
				subject: 'Thanx for you order!',
				react: OrderReceivedEmail({
					orderId,
					orderDate: updatedOrder.createdAt.toLocaleDateString(),
					// @ts-ignore
					shippingAddress: {
						name: session.customer_details!.name!,
						city: shippingAddress!.city!,
						country: shippingAddress!.country!,
						postalCode: shippingAddress!.postal_code!,
						street: shippingAddress!.line1!,
						state: shippingAddress!.state!,
					},
				}),
			});
		}

		return NextResponse.json({result: event, ok: true});
	} catch (error) {
		console.log(error);

		return NextResponse.json({message: 'Something went wrong.', ok: false}, {status: 500});
	}
}
