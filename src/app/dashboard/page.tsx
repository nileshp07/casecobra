import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Progress} from '@/components/ui/progress';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {db} from '@/db';
import {formatPrice} from '@/lib/utils';
import {getKindeServerSession} from '@kinde-oss/kinde-auth-nextjs/server';
import Link from 'next/link';
import StatusDropdown from './StatusDropdown';

export default async function Page() {
	const {getUser} = getKindeServerSession();
	const user = await getUser();
	const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

	const orders = await db.order.findMany({
		where: {
			isPaid: true,
			createdAt: {
				gte: new Date(new Date().setDate(new Date().getDay() - 7)), // from last week
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
		include: {
			// join the user and shippingAddress table with the order table.
			user: true,
			shippingAddress: true,
		},
	});

	const lastWeekSum = await db.order.aggregate({
		where: {
			isPaid: true,
			createdAt: {
				gte: new Date(new Date().setDate(new Date().getDay() - 7)), // from last week
			},
		},
		_sum: {
			amount: true,
		},
	});

	const lastMonthSum = await db.order.aggregate({
		where: {
			isPaid: true,
			createdAt: {
				gte: new Date(new Date().setDate(new Date().getDay() - 30)), // from last week
			},
		},
		_sum: {
			amount: true,
		},
	});

	const WEEKLY_GOAL = 500;
	const MONTHLY_GOAL = 2500;

	if (!user || user.email !== ADMIN_EMAIL) {
		return (
			<div className='flex flex-col justify-center items-center text-center mt-20 px-14'>
				<h3 className='font-medium text-xl text-zinc-900'>Dashboard is only available for the admins of casecobra.</h3>

				<Link href='/' className='text-sm text-zinc-700 text-center mt-6 underline'>
					Back to home page
				</Link>
			</div>
		);
	}
	return (
		<div className='flex min-h-screen w-full bg-muted/40'>
			<div className='max-w-7xl w-full mx-auto flex flex-col sm:gap-4 sm:py-4'>
				<div className='flex flex-col gap-16'>
					<div className='grid gap-4 sm:grid-cols-2'>
						<Card>
							<CardHeader className='pb-2'>
								<CardDescription>Last Week</CardDescription>
								<CardTitle className='text-4xl'>{formatPrice(lastMonthSum._sum.amount ?? 0)}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-sm text-muted-foreground'>Off {formatPrice(WEEKLY_GOAL)} goal</div>
							</CardContent>
							<CardFooter>
								<Progress value={((lastMonthSum._sum.amount ?? 0) * 100) / WEEKLY_GOAL} />
							</CardFooter>
						</Card>
						<Card>
							<CardHeader className='pb-2'>
								<CardDescription>Last Month</CardDescription>
								<CardTitle className='text-4xl'>{formatPrice(lastMonthSum._sum.amount ?? 0)}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-sm text-muted-foreground'>Off {formatPrice(MONTHLY_GOAL)} goal</div>
							</CardContent>
							<CardFooter>
								<Progress value={((lastMonthSum._sum.amount ?? 0) * 100) / MONTHLY_GOAL} />
							</CardFooter>
						</Card>
					</div>

					<h1 className='text-4xl font-bold tracking-tight'>Incoming Orders</h1>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Customer </TableHead>
								<TableHead className='hidden sm:table-cell'>Status </TableHead>
								<TableHead className='hidden sm:table-cell'>Purchase Date </TableHead>
								<TableHead className='text-right'>Amount </TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{orders.map((order) => {
								return (
									<TableRow className='bg-accent' key={order.id}>
										<TableCell>
											<div className='font-medium'>{order.shippingAddress?.name}</div>
											<div className='hidden text-sm text-muted-foreground md:inline'>{order.user.email}</div>
										</TableCell>
										<TableCell className='hidden sm:table-cell'>
											<StatusDropdown id={order.id} orderStatus={order.status} />
										</TableCell>
										<TableCell className='hidden md:table-cell'>{order.createdAt.toLocaleDateString()}</TableCell>
										<TableCell className='text-right'>{formatPrice(order.amount)}</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}
