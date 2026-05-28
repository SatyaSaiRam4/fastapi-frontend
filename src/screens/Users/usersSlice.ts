import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

import axios from 'axios';

export interface User {
	id: number;
	name: string;
	email: string;
}

export interface UserCreate {
	name: string;
	email: string;
}

export interface UserUpdate {
	name?: string;
	email?: string;
}

interface UsersState {
	users: User[];
	fetchLoading: boolean;
	fetchError: string | null;

	addLoading: boolean;
	addError: string | null;

	updateLoading: boolean;
	updateError: string | null;

	deleteLoading: boolean;
	deleteError: string | null;

	inviteLoading: boolean;
	inviteError: string | null;
}

const initialState: UsersState = {
	users: [],

	fetchLoading: false,
	fetchError: null,

	addLoading: false,
	addError: null,

	updateLoading: false,
	updateError: null,

	deleteLoading: false,
	deleteError: null,

	inviteLoading: false,
	inviteError: null,
};

const API_URL = 'https://fastapi-backend-89xk.onrender.com/users';


// FETCH USERS
export const fetchUsers = createAsyncThunk(
	'users/fetchUsers',
	async (_, { rejectWithValue }) => {
		try {
			const res = await axios.get<User[]>(API_URL);
			return res.data;
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				return rejectWithValue(
					err.response?.data?.detail || 'Failed to fetch users'
				);
			}
			return rejectWithValue('Failed to fetch users');
		}
	}
);


// ADD USER
export const addUser = createAsyncThunk(
	'users/addUser',
	async (user: UserCreate, { rejectWithValue }) => {
		try {
			const res = await axios.post<User>(API_URL + '/', user);
			return res.data;
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				return rejectWithValue(
					err.response?.data?.detail || 'Failed to add user'
				);
			}
			return rejectWithValue('Failed to add user');
		}
	}
);


// UPDATE USER
export const updateUser = createAsyncThunk(
	'users/updateUser',
	async (
		{ id, data }: { id: number; data: UserUpdate },
		{ rejectWithValue }
	) => {
		try {
			const res = await axios.put<User>(
				`${API_URL}/${id}`,
				data
			);

			return res.data;
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				return rejectWithValue(
					err.response?.data?.detail || 'Failed to update user'
				);
			}
			return rejectWithValue('Failed to update user');
		}
	}
);


// DELETE USER
export const deleteUser = createAsyncThunk(
	'users/deleteUser',
	async (id: number, { rejectWithValue }) => {
		try {
			await axios.delete(`${API_URL}/${id}`);
			return id;
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				return rejectWithValue(
					err.response?.data?.detail || 'Failed to delete user'
				);
			}
			return rejectWithValue('Failed to delete user');
		}
	}
);


// SEND INVITATION
export const sendInvitation = createAsyncThunk(
	'users/sendInvitation',
	async (
		{ name, email }: { name: string; email: string },
		{ rejectWithValue }
	) => {
		try {
			const res = await axios.post(
				`${API_URL}/invite`,
				{
					name,
					email,
				}
			);

			return res.data;
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				return rejectWithValue(
					err.response?.data?.detail || 'Failed to send invitation'
				);
			}
			return rejectWithValue('Failed to send invitation');
		}
	}
);


const usersSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {},
	extraReducers: (builder) => {

		builder

			// FETCH
			.addCase(fetchUsers.pending, (state) => {
				state.fetchLoading = true;
				state.fetchError = null;
			})

			.addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
				state.fetchLoading = false;
				state.users = action.payload;
			})

			.addCase(fetchUsers.rejected, (state, action) => {
				state.fetchLoading = false;
				state.fetchError = action.payload as string;
			})


			// ADD
			.addCase(addUser.pending, (state) => {
				state.addLoading = true;
				state.addError = null;
			})

			.addCase(addUser.fulfilled, (state, action: PayloadAction<User>) => {
				state.addLoading = false;
				state.users.push(action.payload);
			})

			.addCase(addUser.rejected, (state, action) => {
				state.addLoading = false;
				state.addError = action.payload as string;
			})


			// UPDATE
			.addCase(updateUser.pending, (state) => {
				state.updateLoading = true;
				state.updateError = null;
			})

			.addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
				state.updateLoading = false;

				const idx = state.users.findIndex(
					u => u.id === action.payload.id
				);

				if (idx !== -1) {
					state.users[idx] = action.payload;
				}
			})

			.addCase(updateUser.rejected, (state, action) => {
				state.updateLoading = false;
				state.updateError = action.payload as string;
			})


			// DELETE
			.addCase(deleteUser.pending, (state) => {
				state.deleteLoading = true;
				state.deleteError = null;
			})

			.addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
				state.deleteLoading = false;

				state.users = state.users.filter(
					u => u.id !== action.payload
				);
			})

			.addCase(deleteUser.rejected, (state, action) => {
				state.deleteLoading = false;
				state.deleteError = action.payload as string;
			})


			// INVITATION
			.addCase(sendInvitation.pending, (state) => {
				state.inviteLoading = true;
				state.inviteError = null;
			})

			.addCase(sendInvitation.fulfilled, (state) => {
				state.inviteLoading = false;
			})

			.addCase(sendInvitation.rejected, (state, action) => {
				state.inviteLoading = false;
				state.inviteError = action.payload as string;
			});
	},
});

export default usersSlice.reducer;