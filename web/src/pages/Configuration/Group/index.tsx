import React, { memo, useRef } from 'react';
import ErrorPage, { ECode } from 'components/ErrorPage';
import { Button, Col, Link, PageInfo, PrimaryTableProps, Row, Space, Table, TableProps, TableRowData, Tooltip } from 'tdesign-react';
import { CreditcardIcon, DeleteIcon, EditIcon, RefreshIcon } from 'tdesign-icons-react';

import Text from 'components/Text';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { useNavigate } from 'react-router-dom';
import ConfigGroupEditor from './ConfigGroupEditor';
import Search from 'components/Search';

import style from './index.module.less';
import { editorConfigGroup, resetConfigGroup, viewConfigGroup } from 'modules/configuration/group';
import { describeConfigFileGroups } from 'services/config_group';
import { openErrNotification } from 'utils/notifition';

interface IConfigGroupTableProps {

}

const ServerError = () => <ErrorPage code={500} />;

const columns = (handleEditConfigGroup: (row: TableRowData) => void, redirect: (service: string, namespace: string, row: TableRowData) => void): PrimaryTableProps['columns'] => [
	{
		colKey: 'id',
		title: 'ID',
		type: 'multiple',
		checkProps: ({ row }) => ({ disabled: row.editable === false || row.deleteable === false }),
	},
	{
		colKey: 'name',
		title: '分组名',
		cell: ({ row }) => <Link
			theme="primary"
			onClick={() => { redirect(row.name, row.namespace, {...row}) }}
		>{row.name}</Link>,
	},
	{
		colKey: 'namespace',
		title: '命名空间',
		cell: ({ row: { namespace } }) => (<Text>{namespace}</Text>),
	},
	{
		colKey: 'department',
		title: '部门',
		cell: ({ row: { department } }) => <Text>{department || '-'}</Text>,
	},
	{
		colKey: 'business',
		title: '业务',
		cell: ({ row: { business } }) => <Text>{business || '-'}</Text>,
	},
	{
		colKey: 'total',
		title: '文件数',
		cell: ({ row: { fileCount } }) => (<Text>{fileCount}</Text>),
	},
	{
		colKey: 'commnet',
		title: '描述',
		ellipsis: true,
		cell: ({ row: { comment } }: TableRowData) => (<Text>{comment || '-'}</Text>),
	},
	{
		colKey: 'time',
		title: '操作时间',
		cell: ({ row: { createTime, modifyTime } }: TableRowData) => <Text>修改: {modifyTime}<br />创建: {createTime}</Text>,
	},
	{
		colKey: 'action',
		title: '操作',
		cell: ({ row }) => {
			return (
				<Space>
					<Tooltip content={row.editable === false ? '无权限操作' : '编辑'}>
						<Button
							shape="square"
							variant="text"
							disabled={row.editable === false}
							onClick={() => handleEditConfigGroup(row)}>
							<EditIcon />
						</Button>
					</Tooltip>
					<Tooltip content={row.editable === false ? '无权限操作' : '授权'}>
						<Button shape="square" variant="text" disabled={row.editable === false}>
							<CreditcardIcon />
						</Button>
					</Tooltip>
					<Tooltip content={row.deleteable === false ? '无权限操作' : '删除'}>
						<Button shape="square" variant="text" disabled={row.deleteable === false}>
							<DeleteIcon />
						</Button>
					</Tooltip>
				</Space>
			)
		},
	},
];


const ConfigGroupTable: React.FC<IConfigGroupTableProps> = ({ }) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate()
	const [selectedRowKeys, setSelectedRowKeys] = React.useState<Array<string | number>>([]);

	const [searchState, setSearchState] = React.useState<{
		groups: TableProps['data'];
		current: number;
		limit: number;
		previous: number;
		total: number;
		query: string;
		fetchError: boolean;
		isLoading: boolean;
	}>({ groups: [], current: 1, limit: 10, previous: 0, total: 0, query: '', fetchError: false, isLoading: false });

	// 合并编辑相关状态
	const [editorState, setEditorState] = React.useState<{
		visible: boolean;
		mode: 'create' | 'edit' | 'delete';
		data?: TableRowData;
	}>({ visible: false, mode: 'create', data: undefined });


	// 编辑、新建事件
	const handleEditConfigGroup = (row: TableRowData) => {
		dispatch(editorConfigGroup({
			id: row.id,
			namespace: row.namespace,
			name: row.name,
			comment: row.comment,
			department: row.department,
			business: row.business,
		}));

		setEditorState({
			visible: true,
			mode: 'edit',
			data: { ...row },
		})
	}

	const handleCreateService = () => {
		dispatch(resetConfigGroup());
		setEditorState({
			visible: true,
			mode: 'create',
			data: undefined,
		});
	};

	// 模拟远程请求
	async function fetchData(pageInfo: PageInfo, searchParam?: string) {
		setSearchState(s => ({ ...s, current: pageInfo.current, limit: pageInfo.pageSize, previous: pageInfo.previous, fetchError: false, isLoading: true }));
		try {
			const { current, pageSize } = pageInfo;
			// 请求可能存在跨域问题
			const response = await describeConfigFileGroups({
				limit: pageSize, offset: (current - 1) * pageSize, ...(searchParam && { name: searchParam })
			});
			setSearchState(s => ({ ...s, groups: response.list, total: response.totalCount, isLoading: false }));
		} catch (error: Error | any) {
			setSearchState(s => ({ ...s, fetchError: true, isLoading: false }));
			openErrNotification("获取数据失败", error);
		}
	}

	React.useEffect(() => {
		fetchData({ current: 1, pageSize: searchState.limit, previous: 0 });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const refreshTable = () => {
		setSearchState(s => ({ ...s, fetchError: false, isLoading: true }));
		fetchData({ current: 1, pageSize: searchState.limit, previous: 0 }, searchState.query);
	}

	const table = (
		<>
			<Row justify='space-between' className={style.toolBar}>
				<Col>
					<Row gutter={8} align='middle'>
						<Col>
							<Button onClick={handleCreateService}>新建</Button>
						</Col>
						{selectedRowKeys.length > 0 && (
							<>
								<Col>
									<Button theme='danger'>批量删除</Button>
								</Col>
								<Col>
									<div>已选 {selectedRowKeys?.length || 0} 项</div>
								</Col>
							</>
						)}

					</Row>
				</Col>
				<Col>
					<Space>
						<Search
							onChange={(value: string) => {
								fetchData({ current: 1, pageSize: searchState.limit, previous: 0, }, value);
							}}
						/>
						<Tooltip content="刷新">
							<RefreshIcon onClick={() => fetchData({ current: 1, pageSize: searchState.limit, previous: 0 })} />
						</Tooltip>
					</Space>
				</Col>
			</Row>
			<ConfigGroupEditor
				key={editorState.mode + (editorState.data?.name || 'new') + (editorState.visible ? '1' : '0')}
				modify={editorState.mode === 'edit'}
				visible={editorState.visible}
				refresh={refreshTable}
				closeDrawer={() => {
					// 关闭后重置编辑器状态
					dispatch(resetConfigGroup());
					setEditorState(s => ({ ...s, visible: false }));
				}}
			/>
			<Table
				data={searchState.groups}
				columns={columns(handleEditConfigGroup, (group: string, namespace: string, row: TableRowData) => {
					// 发送行信息给到配置文件列表页面，需要限制某些操作
					dispatch(viewConfigGroup({
						id: row.id,
						namespace: row.namespace,
						name: row.name,
						comment: row.comment,
						department: row.department,
						business: row.business,
						editable: row.editable,
						deleteable: row.deleteable,
					}))
					navigate(`files?namespace=${namespace}&group=${group}`);
				})}
				loading={searchState.isLoading}
				rowKey="id"
				size={"large"}
				tableLayout={'auto'}
				cellEmptyContent={'-'}
				pagination={{
					current: searchState.current,
					pageSize: searchState.limit,
					total: searchState.total,
					showJumper: true,
					onChange(pageInfo) {
						fetchData(pageInfo, searchState.query);
					},
				}}
				onPageChange={(pageInfo) => {
					fetchData(pageInfo, searchState.query);
				}}
				selectOnRowClick={false}
				selectedRowKeys={selectedRowKeys}
				onSelectChange={(selected: Array<string | number>) => {
					setSelectedRowKeys(selected);
				}}
			/>
		</>
	)

	return (
        <>
            {searchState.fetchError ? (
                <ServerError />
            ) : (
                table
            )}
        </>
	);
}

export default React.memo(ConfigGroupTable);
