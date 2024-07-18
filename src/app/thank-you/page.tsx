import {Suspense} from 'react';
import Thankyou from './Thankyou';

export default function Page() {
	return (
		<Suspense>
			<Thankyou />
		</Suspense>
	);
}
