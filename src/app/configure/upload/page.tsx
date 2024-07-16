'use client';

import {Progress} from '@/components/ui/progress';
import {useToast} from '@/components/ui/use-toast';
import {useUploadThing} from '@/lib/uploadthing';
import {cn} from '@/lib/utils';
import {Image, Loader, MousePointerSquareDashed} from 'lucide-react';
import {useRouter} from 'next/navigation';
import React, {useState, useTransition} from 'react';
import Dropzone, {FileRejection} from 'react-dropzone';

export default function Page() {
	const {toast} = useToast();
	const [isDargOver, setIsDragOver] = useState<boolean>(false);
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const {startUpload, isUploading} = useUploadThing('imageUploader', {
		onClientUploadComplete: ([data]) => {
			const configId = data.serverData.configId;
			startTransition(() => {
				router.push(`/configure/design?id=${configId}`);
			});
		},
		onUploadProgress(p) {
			setUploadProgress(p);
		},
	});

	const onDropRejected = (rejectedFiles: FileRejection[]) => {
		const [file] = rejectedFiles;

		setIsDragOver(false);

		toast({
			title: `${file.file.type} is not supported.`,
			description: 'Please try to upload PNG, JPG or JPEG image instead.',
			variant: 'destructive',
		});
	};

	const onDropAccepted = (acceptedFiles: File[]) => {
		startUpload(acceptedFiles, {configId: undefined});
		setIsDragOver(false);
	};

	return (
		<div
			className={cn(
				'relative h-full flex-1 my-16 w-full rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl flex justify-center items-center flex-col',
				{
					'ring-blue-900/25 bg-blue-900/10': isDargOver,
				}
			)}
		>
			<div className='relative flex flex-1 flex-col justify-center items-center w-full'>
				<Dropzone
					onDropRejected={onDropRejected}
					onDropAccepted={onDropAccepted}
					accept={{
						'image/png': ['.png'],
						'image/jpeg': ['.jpeg'],
						'image/jpg': ['.jpg'],
					}}
					onDragEnter={() => setIsDragOver(true)}
					onDragLeave={() => setIsDragOver(false)}
				>
					{({getRootProps, getInputProps}) => (
						<div {...getRootProps()}>
							<input {...getInputProps()} />

							{isDargOver ? (
								<MousePointerSquareDashed className='h-6 w-6 text-zinc-500 mb-2' />
							) : isUploading || isPending ? (
								<Loader className='animate-spin h-6 w-6 text-zinc-500 mb-2 mx-auto' />
							) : (
								<Image className='h-6 w-6 text-zinc-500 mb-2 mx-auto' />
							)}

							<div className='flex flex-col justify-center mb-2 text-sm text-zinc-700'>
								{isUploading ? (
									<div className='flex flex-col items-center'>
										<p>Uploading...</p>
										<Progress className='mt-2 h-2 w-40 bg-gray-300' value={uploadProgress} />
									</div>
								) : isPending ? (
									<div className='flex flex-col items-center'>
										<p>Redirecting, please wait...</p>
									</div>
								) : isDargOver ? (
									<p>
										<span className='font-semibold'>Drop file </span>
										to upload
									</p>
								) : (
									<p>
										<span className='font-semibold'>Click to upload </span>
										or drag and drop
									</p>
								)}
							</div>

							{isPending ? null : <p className='text-sm text-zinc-500 text-center'>PNG, JPG, JPEG</p>}
						</div>
					)}
				</Dropzone>
			</div>
		</div>
	);
}
