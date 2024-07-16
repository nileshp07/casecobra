'use client';

import {BASE_PRICE} from '@/app/config/products';
import {COLORS, FINISHES, MATERIALS, MODELS} from '@/app/validators/options-validator';
import HandleComponent from '@/components/HandleComponent';
import {AspectRatio} from '@/components/ui/aspect-ratio';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {Label} from '@/components/ui/label';
import {ScrollArea} from '@/components/ui/scroll-area';
import {useToast} from '@/components/ui/use-toast';
import {useUploadThing} from '@/lib/uploadthing';
import {cn, formatPrice} from '@/lib/utils';
import {Description, Radio, RadioGroup} from '@headlessui/react';
import {useMutation} from '@tanstack/react-query';
import {ArrowRight, Check, ChevronsUpDown} from 'lucide-react';
import NextImage from 'next/image';
import {useRef, useState} from 'react';
import {Rnd} from 'react-rnd';
import {saveConfigAction, saveConfigArgs} from './actions';
import {useRouter} from 'next/navigation';

interface DesignConfiguratorProps {
	configId: string;
	imageUrl: string;
	imageDimensions: {width: number; height: number};
}

export default function DesignConfigurator({configId, imageUrl, imageDimensions}: DesignConfiguratorProps) {
	const {toast} = useToast();
	const router = useRouter();

	const {mutate: saveConfig} = useMutation({
		mutationKey: ['save-config'],
		mutationFn: async (args: saveConfigArgs) => {
			await Promise.all([saveConfiguration(), saveConfigAction(args)]);
		},
		onError: () => {
			toast({
				title: 'Something went wrong.',
				description: 'There was an error on our end. Please try again.',
				variant: 'destructive',
			});
		},
		onSuccess: () => {
			toast({
				title: 'Success',
			});
			router.push(`/configure/preview?id=${configId}`);
		},
	});

	const [options, setOptions] = useState<{
		color: (typeof COLORS)[number];
		model: (typeof MODELS.options)[number];
		material: (typeof MATERIALS.options)[number];
		finish: (typeof FINISHES.options)[number];
	}>({
		color: COLORS[0],
		model: MODELS.options[0],
		material: MATERIALS.options[0],
		finish: FINISHES.options[0],
	});

	const [renderedDimensions, setRenderedDimensions] = useState({
		width: imageDimensions.width / 4,
		height: imageDimensions.height / 4,
	});

	const [renderedPosition, setRenderedPosition] = useState({
		x: 150,
		y: 205,
	});

	const phoneCaseRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const {startUpload} = useUploadThing('imageUploader');

	async function saveConfiguration() {
		try {
			// const {} = phoneCaseRef.current?.getBoundingClientRect(); //unsure if the reference might be null or undefined

			const {left: caseLeft, top: caseTop, height, width} = phoneCaseRef.current!.getBoundingClientRect(); //certain the reference is not null or undefined,
			const {left: containerLeft, top: containerTop} = containerRef.current!.getBoundingClientRect();

			const leftOffset = caseLeft - containerLeft;
			const topOffset = caseTop - containerTop;

			const actualX = renderedPosition.x - leftOffset;
			const actualY = renderedPosition.y - topOffset;

			// canvas that overlays the actual phoneCase
			const canvas = document.createElement('canvas');
			canvas.width = width; //phoneCaseRef width
			canvas.height = height;
			const ctx = canvas.getContext('2d');

			const userImage = new Image();
			userImage.crossOrigin = 'anonymous';
			userImage.src = imageUrl;
			await new Promise((resolve) => (userImage.onload = resolve));

			// drawing the userImage on the canvas
			ctx?.drawImage(userImage, actualX, actualY, renderedDimensions.width, renderedDimensions.height);

			const base64 = canvas.toDataURL();
			const base64Data = base64.split(',')[1];

			const blob = base64ToBlob(base64Data, 'image/png');
			const file = new File([blob], 'filename.png', {type: 'image/png'});

			// upload the file (cropped image) to the uploadThing
			await startUpload([file], {configId});
		} catch (error) {
			toast({
				title: 'Something went wrong.',
				description: 'There was a problem saving your configuration, please try again.',
				variant: 'destructive',
			});
		}
	}

	// converting base64 encoded image string to actual png
	function base64ToBlob(base64: string, mimeType: string) {
		const byteCharacters = atob(base64);
		const byteNumbers = new Array(byteCharacters.length);
		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i);
		}

		const byteArray = new Uint8Array(byteNumbers);
		return new Blob([byteArray], {type: mimeType});
	}
	return (
		<div className='relative mt-20 grid grid-cols-1 lg:grid-cols-3 mb-20 pb-20'>
			{/* Gray container inside which phone template is */}
			<div
				ref={containerRef}
				className='relative h-[37.5rem] overflow-hidden col-span-2 w-full max-w-4xl flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
			>
				<div className='relative w-60 bg-opacity-50 pointer-events-none aspect-[896/1831]'>
					<AspectRatio
						ref={phoneCaseRef}
						ratio={896 / 1831}
						className='pointer-events-none relative z-50 aspect-[896/1831] w-full'
					>
						<NextImage
							fill
							alt='phone-image'
							src='/phone-template.png'
							className='pointer-events-none z-50 select-none'
						/>
					</AspectRatio>
					<div className='absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]'></div>
					<div
						className={cn(
							'absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]',
							`bg-${options.color.tw}`
						)}
					></div>
				</div>

				{/* Movable & resizable image component */}
				<Rnd
					default={{
						x: 150,
						y: 205,
						height: imageDimensions.height / 4,
						width: imageDimensions.width / 4,
					}}
					lockAspectRatio
					resizeHandleComponent={{
						bottomLeft: <HandleComponent />,
						bottomRight: <HandleComponent />,
						topLeft: <HandleComponent />,
						topRight: <HandleComponent />,
					}}
					onResizeStop={(_, __, ref, ___, {x, y}) => {
						setRenderedDimensions({
							height: parseInt(ref.style.height.slice(0, -2)), //e.g 50px
							width: parseInt(ref.style.width.slice(0, -2)),
						});

						setRenderedPosition({x, y});
					}}
					onDragStop={(_, data) => {
						const {x, y} = data;
						setRenderedPosition({x, y});
					}}
					className='absolute z-20 border-[3px] border-primary'
				>
					<div className='relative w-full h-full'>
						<NextImage src={imageUrl} fill alt='your image' className='pointer-events-none' />
					</div>
				</Rnd>
			</div>
			<div className='h-[37.5rem] col-span-full lg:col-span-1 flex flex-col bg-white'>
				<div className='px-8  pt-8'>
					<h2 className='tracking-tight font-bold text-3xl text-center'>Customize your case</h2>
					<div className='w-full h-px bg-zinc-300 my-6' />
				</div>
				<ScrollArea className='relative  flex-1 overflow-auto'>
					<div className='absolute z-10 inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white pointer-events-none' />

					<div className='px-8 pb-12'>
						<div className='relative h-full mt-4 flex flex-col justify-between'>
							<div className='flex flex-col gap-6'>
								<RadioGroup
									value={options.color}
									onChange={(val) => {
										setOptions((prev) => ({
											...prev,
											color: val,
										}));
									}}
								>
									<Label>Color: {options.color.label}</Label>

									<div className='mt-3 flex items-center space-x-3'>
										{COLORS.map((color) => (
											<RadioGroup.Option
												key={color.label}
												value={color}
												className={({active, checked}) =>
													cn(
														'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 active:ring-0 focus:ring-0 active:outline-none focus:outline-none border-2 border-transparent',
														{
															[`border-${color.tw}`]: active || checked,
														}
													)
												}
											>
												<span
													className={cn(`bg-${color.tw}`, 'h-8 w-8 rounded-full border border-black border-opacity-10')}
												/>
											</RadioGroup.Option>
										))}
									</div>
								</RadioGroup>

								<div className='relative flex flex-col gap-3 w-full'>
									<Label>Label</Label>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant='outline' role='combobox' className='w-full justify-between'>
												{options.model.label}
												<ChevronsUpDown className='h-4 w-4 ml-2 shrink-0 opacity-50' />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											{MODELS.options.map((model) => (
												<DropdownMenuItem
													key={model.label}
													className={cn('flex text-sm gap-1 items-center p-1.5 cursor-default hover:bg-zinc-100', {
														'bg-zinc-100': model.label === options.model.label,
													})}
													onClick={() => {
														setOptions((prev) => ({...prev, model}));
													}}
												>
													<Check
														className={cn(
															'mr-2 h-4 w-4',
															model.label === options.model.label ? 'opacity-100' : 'opacity-0'
														)}
													/>
													{model.label}
												</DropdownMenuItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								{[MATERIALS, FINISHES].map(({name, options: selectedOptions}) => {
									return (
										<RadioGroup
											key={name}
											value={options[name]}
											onChange={(val) => {
												setOptions((prev) => ({
													...prev,
													[name]: val, // name is dynamic i.e can be material/finish
												}));
											}}
										>
											<Label>{name.slice(0, 1).toUpperCase() + name.slice(1)}</Label>
											<div className='mt-3 space-y-4'>
												{selectedOptions.map((option) => {
													return (
														<Radio
															key={option.value}
															value={option}
															className={({checked, disabled}) =>
																cn(
																	'relative block cursor-pointer rounded-lg bg-white px-4 py-4 shadow-sm border-2 border-zinc-200 focus:outline-none ring-0 focus:ring-0 outline-none sm:flex sm:justify-between',
																	{
																		'border-primary ': checked,
																	}
																)
															}
														>
															<span className='flex items-center'>
																<span className='flex flex-col text-sm'>
																	<Label className='font-medium text-gray-900'>{option.label}</Label>

																	{option.description ? (
																		<Description as='span' className='text-gray-500 mt-2'>
																			<span className='block sm:inline'>{option.description}</span>
																		</Description>
																	) : null}
																</span>
															</span>

															<Description className='mt-2 flex text-sm sm:ml-4 sm:mt-0 sm:flex-col sm:text-right'>
																<span className='font-medium text-gray-900'>{formatPrice(option.price / 100)}</span>
															</Description>
														</Radio>
													);
												})}
											</div>
										</RadioGroup>
									);
								})}
							</div>
						</div>
					</div>
				</ScrollArea>

				<div className='w-full h-16 px-8 bg-white'>
					<div className='w-full h-px bg-zinc-200' />
					<div className='w-full h-full flex justify-end items-center'>
						<div className='w-full flex gap-6 items-center'>
							<p className='font-medium whitespace-nowrap'>
								{formatPrice((BASE_PRICE + options.finish.price + options.material.price) / 100)}
							</p>
							<Button
								onClick={() =>
									saveConfig({
										configId,
										color: options.color.value,
										finish: options.finish.value,
										material: options.material.value,
										model: options.model.value,
									})
								}
								size='sm'
								className='w-full text-sm'
							>
								Continue
								<ArrowRight className='h-5 w-5 ml-1.5 inline' />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
