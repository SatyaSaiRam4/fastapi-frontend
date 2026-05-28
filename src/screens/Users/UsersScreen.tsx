import React, { useState, useEffect, useRef } from 'react';

import {
	Table,
	Button,
	Space,
	Modal,
	Form,
	Input,
	message,
	Popconfirm
} from 'antd';

import {
	EditOutlined,
	DeleteOutlined,
	PlusOutlined,
	MailOutlined
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import {
	fetchUsers,
	addUser,
	updateUser,
	deleteUser,
	sendInvitation,
	type User
} from './usersSlice';

import type { RootState, AppDispatch } from '../../store';


const UsersScreen: React.FC = () => {

	const navigate = useNavigate();

	const dispatch = useDispatch<AppDispatch>();

	const {
		users,
		fetchLoading,
		addLoading,
		updateLoading,
		inviteLoading,
		addError,
		updateError,
		deleteError,
		inviteError
	} = useSelector((state: RootState) => state.users);


	const [isModalOpen, setIsModalOpen] = useState(false);

	const [isEdit, setIsEdit] = useState(false);

	const [editingUser, setEditingUser] = useState<User | null>(null);

	const [form] = Form.useForm();

	const prevAddLoadingRef = useRef(true);

	const prevUpdateLoadingRef = useRef(true);


	useEffect(() => {
		dispatch(fetchUsers());
	}, [dispatch]);


	useEffect(() => {
		if (addError) message.error(addError);
	}, [addError]);


	useEffect(() => {
		if (updateError) message.error(updateError);
	}, [updateError]);


	useEffect(() => {
		if (deleteError) message.error(deleteError);
	}, [deleteError]);


	useEffect(() => {
		if (inviteError) {
			message.error(inviteError);
		}
	}, [inviteError]);


	useEffect(() => {

		if (
			prevAddLoadingRef.current &&
			!addLoading &&
			isModalOpen &&
			!addError &&
			!isEdit
		) {
			setIsModalOpen(false);

			form.resetFields();

			message.success('User added successfully!');
		}

		prevAddLoadingRef.current = addLoading;

	}, [addLoading]);


	useEffect(() => {

		if (
			prevUpdateLoadingRef.current &&
			!updateLoading &&
			isModalOpen &&
			!updateError &&
			isEdit
		) {
			setIsModalOpen(false);

			setIsEdit(false);

			setEditingUser(null);

			form.resetFields();

			message.success('User updated successfully!');
		}

		prevUpdateLoadingRef.current = updateLoading;

	}, [updateLoading]);


	const handleSendInvitation = async (user: User) => {

		try {

			await dispatch(
				sendInvitation({
					name: user.name,
					email: user.email,
				})
			).unwrap();

			message.success(
				`Invitation sent to ${user.email}`
			);

		} catch (error) {

			console.error(error);

			message.error('Failed to send invitation');
		}
	};


	const getColumns = () => [

		{
			title: 'ID',
			dataIndex: 'id',
			key: 'id',
		},

		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
		},

		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
		},

		{
			title: 'Actions',
			key: 'actions',

			render: (_: React.ReactNode, record: User) => (

				<Space>

					<Button
						icon={<MailOutlined />}
						type="link"
						onClick={() => handleSendInvitation(record)}
						loading={inviteLoading}
					/>

					<Button
						icon={<EditOutlined />}
						type="link"
						onClick={() => handleEdit(record)}
					/>

					<Popconfirm
						title="Delete user?"
						onConfirm={() => handleDelete(record.id)}
						okText="Yes"
						cancelText="No"
					>
						<Button
							icon={<DeleteOutlined />}
							type="link"
							danger
						/>
					</Popconfirm>

				</Space>
			),
		},
	];


	const showModal = () => {

		setIsEdit(false);

		setEditingUser(null);

		setIsModalOpen(true);

		form.resetFields();
	};


	const handleEdit = (user: User) => {

		setIsEdit(true);

		setEditingUser(user);

		setIsModalOpen(true);

		form.resetFields();

		setTimeout(() => {

			form.setFieldsValue({
				name: user.name,
				email: user.email,
			});

		}, 0);
	};


	const handleDelete = (id: number) => {
		dispatch(deleteUser(id));
	};


	const handleCancel = () => {

		setIsModalOpen(false);

		setIsEdit(false);

		setEditingUser(null);

		form.resetFields();
	};


	const handleOk = () => {

		form.validateFields().then(values => {

			if (isEdit && editingUser) {

				dispatch(
					updateUser({
						id: editingUser.id,
						data: values,
					})
				);

			} else {

				dispatch(addUser(values));
			}
		});
	};


	return (

		<div className="p-4">

			<Table
				columns={getColumns()}
				dataSource={users}
				rowKey="id"
				loading={fetchLoading}
				pagination={false}
			/>

			<div className="flex justify-between mt-4">

				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={showModal}
					loading={addLoading}
				>
					Add User
				</Button>

				<Button
					type="default"
					className="ml-2"
					onClick={() => navigate('/iteams')}
				>
					Iteams
				</Button>

			</div>


			<Modal
				title={isEdit ? 'Edit User' : 'Add User'}
				open={isModalOpen}
				onOk={handleOk}
				onCancel={handleCancel}
				okText={isEdit ? 'Update' : 'Add'}
				confirmLoading={addLoading || updateLoading}
			>

				<Form
					form={form}
					layout="vertical"
				>

					<Form.Item
						name="name"
						label="Name"
						rules={[
							{
								required: true,
								message: 'Please enter name'
							}
						]}
					>
						<Input placeholder="Enter user name" />
					</Form.Item>

					<Form.Item
						name="email"
						label="Email"
						rules={[
							{
								required: true,
								message: 'Please enter email'
							},
							{
								type: 'email',
								message: 'Invalid email format'
							}
						]}
					>
						<Input
							type="email"
							placeholder="Enter user email"
						/>
					</Form.Item>

					{(addError || updateError) && (
						<div
							style={{
								color: 'red',
								marginTop: 8
							}}
						>
							{addError || updateError}
						</div>
					)}

				</Form>

			</Modal>

		</div>
	);
};

export default UsersScreen;