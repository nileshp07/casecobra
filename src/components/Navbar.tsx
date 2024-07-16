import React from 'react';
import MaxWidthWrapper from './MaxWidthWrapper';
import Link from 'next/link';
import {buttonVariants} from './ui/button';
import {ArrowRight} from 'lucide-react';
import {getKindeServerSession} from '@kinde-oss/kinde-auth-nextjs/server';

export default async function Navbar() {
	const {getUser} = getKindeServerSession();
	const user = await getUser();

	const isAdmin = user?.email === process.env.ADMIN_EMAIL;

	return (
		<div className='sticky z-[100] h-14 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all'>
			<MaxWidthWrapper>
				<div className='flex items-center justify-between h-14 border-b border-zinc-200'>
					<Link href='/' className='flex z-40 font-semibold text-xl'>
						case <span className='text-green-600'>cobra</span>
					</Link>

					<div className='h-full flex items-center space-x-4'>
						{user ? (
							<>
								<Link
									href='/api/auth/logout'
									className={buttonVariants({
										size: 'sm',
										variant: 'ghost',
									})}
								>
									Sign out
								</Link>

								{isAdmin ? (
									<Link
										href='/api/auth/logout'
										className={buttonVariants({
											size: 'sm',
											variant: 'ghost',
										})}
									>
										Dashboard
									</Link>
								) : null}

								<Link
									href='/configure/upload'
									className={buttonVariants({
										size: 'sm',
										className: 'hidden sm:flex items-center gap-1',
									})}
								>
									Create case
									<ArrowRight className='ml-1.5 h-5 w-5' />
								</Link>
							</>
						) : (
							<>
								<Link
									href='/api/auth/register'
									className={buttonVariants({
										size: 'sm',
										variant: 'ghost',
									})}
								>
									Sign up
								</Link>
								<Link
									href='/api/auth/login'
									className={buttonVariants({
										size: 'sm',
										variant: 'ghost',
									})}
								>
									Login
								</Link>

								<div className='h-8 w-px bg-zinc-400 hidden sm:block'></div>
								<Link
									href='/configure/upload'
									className={buttonVariants({
										size: 'sm',
										className: 'hidden sm:flex items-center gap-1',
									})}
								>
									Create case
									<ArrowRight className='ml-1.5 h-5 w-5' />
								</Link>
							</>
						)}
					</div>
				</div>
			</MaxWidthWrapper>
		</div>
	);
}
