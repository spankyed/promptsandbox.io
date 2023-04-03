import {
	Cog6ToothIcon,
	Bars3CenterLeftIcon,
	ChatBubbleLeftEllipsisIcon,
	DocumentTextIcon,
	ChatBubbleLeftRightIcon,
	ShareIcon,
	BeakerIcon,
	MagnifyingGlassIcon,
	ArrowRightOnRectangleIcon,
	WrenchIcon,
	AcademicCapIcon,
} from '@heroicons/react/20/solid';
import { SupabaseClient } from '@supabase/supabase-js';
import { FC, useState } from 'react';
import { ReactFlowInstance } from 'reactflow';
import { shallow } from 'zustand/shallow';

const rightAngleSvg = new URL('../assets/right-angle.svg', import.meta.url).href;
import Tutorial from './Tutorial';
import UserWorkflows from './UserWorkflows';
import { NodeTypesEnum } from '../nodes/types/NodeTypes';
import { Database } from '../schema';
import { useStore, useStoreSecret, selector, selectorSecret } from '../store';
import { RFStateSecret } from '../store/useStoreSecret';
import { conditionalClassNames } from '../utils/classNames';

export default function LeftSidePanel({
	onAdd,
	reactFlowWrapper,
	reactFlowInstance,
	supabase,
}: {
	onAdd: (
		type: NodeTypesEnum,
		position: {
			x: number;
			y: number;
		},
	) => void;
	reactFlowWrapper: React.MutableRefObject<HTMLDivElement | null>;
	reactFlowInstance: ReactFlowInstance<any, any> | null;
	supabase: SupabaseClient<Database>;
}) {
	const { setUiErrorMessage, setWorkflows, currentWorkflow, setCurrentWorkflow } = useStore(
		selector,
		shallow,
	);
	const { session, openAiKey, setOpenAiKey } = useStoreSecret(selectorSecret, shallow);
	const [dragging, setDragging] = useState(false);

	const [openWorkflows, setOpenWorkflows] = useState(!currentWorkflow);
	const [openTutorials, setOpenTutorials] = useState(false);

	const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setDragging(true);
	};

	const addNodeToCenter = (type: NodeTypesEnum) => {
		if (!(reactFlowWrapper && reactFlowWrapper.current && reactFlowInstance)) {
			return;
		}
		const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

		const position = reactFlowInstance.project({
			x: reactFlowBounds.left + reactFlowBounds.right / 2,
			y: reactFlowBounds.top + reactFlowBounds.bottom / 2,
		});

		onAdd(type, position);
	};

	return (
		<aside className="bg-slate-50 w-full shadow-lg border-r-1 border-slate-400">
			{session && (
				<UserWorkflows
					currentWorkflow={currentWorkflow}
					setCurrentWorkflow={setCurrentWorkflow}
					setWorkflows={setWorkflows}
					open={openWorkflows}
					setOpen={setOpenWorkflows}
					reactFlowInstance={reactFlowInstance}
				/>
			)}
			<Tutorial open={openTutorials} setOpen={setOpenTutorials} />
			<div className="flex flex-col justify-between h-full py-1 border-1">
				<div className="space-y-1 flex flex-col gap-2">
					<div className="flex flex-col justify-between px-2">
						<div className="flex flex-col border-b-1 pb-2 border-slate-300">
							<ul className="list-disc list-inside">
								<a
									className="list-item text-xs text-slate-600 underline hover:font-semibold cursor-pointer"
									href="https://github.com/eg9y/promptsandbox.io"
									target="_blank"
									rel="noreferrer"
								>
									more info
								</a>
							</ul>
						</div>
					</div>

					<div className="flex flex-col justify-between px-1">
						<div className="flex flex-col gap-2">
							<a
								className="group p-2 flex items-center text-sm font-medium text-slate-700 
									bg-slate-300 hover:text-slate-900 hover:font-bold cursor-pointer "
								onClick={async () => {
									if (session) {
										setOpenWorkflows(true);
									} else {
										setUiErrorMessage('Please login to save workflows');
									}
								}}
							>
								<BeakerIcon
									className={
										'text-slate-500 group-hover:text-slate-600 -ml-1 mr-3 h-6 w-6 flex-shrink-0'
									}
									aria-hidden="true"
								/>
								<span className="truncate">My Workflows</span>
							</a>
						</div>
						<div className="mt-1 space-y-1" aria-labelledby="projects-headline">
							<a
								className="group flex items-center px-3 py-2 text-sm font-medium text-slate-700 
								bg-slate-300 hover:text-slate-900 hover:font-bold cursor-pointer "
								onClick={async () => {
									const currentKey = openAiKey || '';
									const newOpenAIKey = window.prompt(
										'Enter your OpenAI Key here',
										currentKey,
									);

									if (newOpenAIKey === null) {
										return;
									}

									if (newOpenAIKey === '') {
										console.log('No key entered');
									} else {
										if (session) {
											await supabase.functions.invoke('insert-api-key', {
												body: {
													api_key: newOpenAIKey,
												},
											});
										}
										setOpenAiKey(newOpenAIKey);
									}
								}}
							>
								<Cog6ToothIcon
									className={
										'text-slate-500  group-hover:text-slate-900 -ml-1 mr-3 h-6 w-6 flex-shrink-0'
									}
									aria-hidden="true"
								/>
								<span className="truncate">OpenAI Key</span>
							</a>
						</div>
						<div className="flex flex-col gap-2 mt-1">
							<a
								className="group p-2 flex items-center text-sm font-medium text-slate-700 
									bg-slate-300 hover:text-slate-900 hover:font-bold cursor-pointer "
								onClick={async () => {
									setOpenTutorials(true);
								}}
							>
								<AcademicCapIcon
									className={
										'text-slate-500 group-hover:text-slate-600 -ml-1 mr-3 h-6 w-6 flex-shrink-0'
									}
									aria-hidden="true"
								/>
								<span className="truncate">Tutorial</span>
							</a>
						</div>
					</div>
					<div>
						<div className="bg-slate-200 flex justify-between">
							<p className="text-start text-slate-900 font-semibold text-md pr-2 pl-4 py-1">
								GPT
							</p>
						</div>
						<div className="flex flex-col gap-1 px-2 py-2">
							{/* TODO: Refactor node blocks */}
							<NodeType
								name="Chat API"
								nodeType={NodeTypesEnum.chatPrompt}
								handleDrag={handleDrag}
								addNodeToCenter={addNodeToCenter}
								Icon={ChatBubbleLeftRightIcon}
							/>
							<div className="flex">
								<img src={rightAngleSvg} alt="SVG as an image" />
								<div className="grow">
									<NodeType
										name="Message"
										nodeType={NodeTypesEnum.chatMessage}
										handleDrag={handleDrag}
										addNodeToCenter={addNodeToCenter}
										Icon={ChatBubbleLeftEllipsisIcon}
									/>
								</div>
							</div>
							<NodeType
								name="Complete API"
								nodeType={NodeTypesEnum.llmPrompt}
								handleDrag={handleDrag}
								addNodeToCenter={addNodeToCenter}
								Icon={ArrowRightOnRectangleIcon}
							/>
						</div>
					</div>
					<div>
						<div className="bg-slate-200 flex justify-between">
							<p className="text-start text-slate-900 font-semibold text-md pr-2 pl-4 py-1">
								Helper
							</p>
						</div>
						<div className="flex flex-col gap-1 px-2 py-2">
							<NodeType
								name="Text"
								nodeType={NodeTypesEnum.textInput}
								handleDrag={handleDrag}
								addNodeToCenter={addNodeToCenter}
								Icon={Bars3CenterLeftIcon}
							/>
							<NodeType
								name="Classify"
								nodeType={NodeTypesEnum.classify}
								handleDrag={handleDrag}
								addNodeToCenter={addNodeToCenter}
								Icon={ShareIcon}
							/>
						</div>
					</div>
					<div>
						<div className="bg-slate-200 flex justify-between">
							<p className="text-start text-slate-900 font-semibold text-md pr-2 pl-4 py-1">
								File
							</p>
						</div>
						<div className="flex flex-col gap-1 px-2 py-2">
							<NodeType
								name="File Text"
								nodeType={NodeTypesEnum.fileText}
								handleDrag={handleDrag}
								addNodeToCenter={addNodeToCenter}
								Icon={DocumentTextIcon}
								session={session}
								needAuth={true}
							/>
							<NodeType
								name="Search"
								nodeType={NodeTypesEnum.search}
								handleDrag={handleDrag}
								addNodeToCenter={addNodeToCenter}
								Icon={MagnifyingGlassIcon}
								session={session}
								needAuth={true}
							/>
							<NodeType
								name="Combine File(s)"
								nodeType={NodeTypesEnum.combine}
								handleDrag={handleDrag}
								addNodeToCenter={addNodeToCenter}
								Icon={WrenchIcon}
							/>
						</div>
					</div>
				</div>
			</div>
		</aside>
	);
}
const NodeType: FC<{
	name: string;
	nodeType: NodeTypesEnum;
	handleDrag: (e: React.DragEvent<HTMLDivElement>) => void;
	addNodeToCenter: (type: NodeTypesEnum) => void;
	session?: RFStateSecret['session'];
	needAuth?: boolean;
	Icon: React.ForwardRefExoticComponent<
		React.SVGProps<SVGSVGElement> & {
			title?: string | undefined;
			titleId?: string | undefined;
		}
	>;
}> = ({ name, handleDrag, addNodeToCenter, nodeType, session, Icon, needAuth = false }) => {
	const colorClassName = conditionalClassNames(
		nodeType === NodeTypesEnum.chatMessage && `ring-indigo-300`,
		nodeType === NodeTypesEnum.chatPrompt && `ring-indigo-300`,
		nodeType === NodeTypesEnum.llmPrompt && `ring-amber-400`,
		nodeType === NodeTypesEnum.classify && `ring-rose-300`,
		nodeType === NodeTypesEnum.textInput && `ring-emerald-400`,
		nodeType === NodeTypesEnum.fileText && `ring-sky-400`,
		nodeType === NodeTypesEnum.search && `ring-sky-400`,
		nodeType === NodeTypesEnum.combine && `ring-sky-400`,
		needAuth && !session && `opacity-50 pointer-events-none`,
		`text-slate-600 hover:bg-slate-100 hover:text-slate-900 group flex items-center rounded-md px-3 py-2 text-sm font-medium cursor-pointer ring-2 ring-inset`,
	);
	return (
		<div
			draggable="true"
			onDrag={handleDrag}
			onDragStart={(e) => {
				e.dataTransfer.setData('application/reactflow', nodeType);
			}}
		>
			<a className={colorClassName} onClick={() => addNodeToCenter(nodeType)}>
				<Icon
					className={
						'text-slate-400 group-hover:text-slate-500 -ml-1 mr-3 h-6 w-6 flex-shrink-0'
					}
					aria-hidden="true"
				/>
				<span className="truncate">{name}</span>
			</a>
		</div>
	);
};
