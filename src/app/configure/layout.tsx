import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import Steps from '@/components/Steps';
import React, {ReactNode} from 'react';

export default function layout({children}: {children: ReactNode}) {
	return (
		<MaxWidthWrapper className='flex-1 flex flex-col'>
			<Steps />
			{children}
		</MaxWidthWrapper>
	);
}
