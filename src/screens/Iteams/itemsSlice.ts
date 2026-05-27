import { createSlice, createAsyncThunk, type PayloadAction,  } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Item {
  id: number;
  title: string;
  description?: string;
  owner_id: number;
  files?: string;
  images?: string;
}

export interface ItemCreate {
  title: string;
  description?: string;
  owner_id: number;
  files?: File | null;
  images?: File | null;
}

export interface ItemUpdate {
  title?: string;
  description?: string;
  owner_id?: number;
  files?: File | null;
  images?: File | null;
}

interface ItemsState {
  items: Item[];
  fetchLoading: boolean;
  fetchError: string | null;
  addLoading: boolean;
  addError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
}

const initialState: ItemsState = {
  items: [],
  fetchLoading: false,
  fetchError: null,
  addLoading: false,
  addError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
};

const API_URL = 'http://localhost:8000/items';

export const fetchItems = createAsyncThunk('items/fetchItems', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get<Item[]>(API_URL);
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch items');
    }
    return rejectWithValue('Failed to fetch items');
  }
});


export const addItem = createAsyncThunk('items/addItem', async (item: ItemCreate, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('title', item.title);
    if (item.description) formData.append('description', item.description);
    formData.append('owner_id', String(item.owner_id));
    if (item.files instanceof File) formData.append('files', item.files);
    if (item.images instanceof File) formData.append('images', item.images);
    const res = await axios.post<Item>(API_URL + '/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to add item');
    }
    return rejectWithValue('Failed to add item');
  }
});


export const updateItem = createAsyncThunk('items/updateItem', async ({ id, data }: { id: number; data: ItemUpdate }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    if (data.title !== undefined) formData.append("title", data.title);
    if (data.description !== undefined) formData.append("description", data.description);
    if (data.owner_id !== undefined) formData.append('owner_id', String(data.owner_id));
    if (data.files instanceof File) formData.append('files', data.files);
    if (data.images instanceof File) formData.append('images', data.images);
    const res = await axios.put<Item>(`${API_URL}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update item');
    }
    return rejectWithValue('Failed to update item');
  }
});

export const deleteItem = createAsyncThunk('items/deleteItem', async (id: number, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to delete item');
    }
    return rejectWithValue('Failed to delete item');
  }
});

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
      })
      .addCase(fetchItems.fulfilled, (state, action: PayloadAction<Item[]>) => {
        state.fetchLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload as string;
      })
      .addCase(addItem.pending, (state) => {
        state.addLoading = true;
        state.addError = null;
      })
      .addCase(addItem.fulfilled, (state, action: PayloadAction<Item>) => {
        state.addLoading = false;
        state.items.push(action.payload);
      })
      .addCase(addItem.rejected, (state, action) => {
        state.addLoading = false;
        state.addError = action.payload as string;
      })
      .addCase(updateItem.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateItem.fulfilled, (state, action: PayloadAction<Item>) => {
        state.updateLoading = false;
        const idx = state.items.findIndex(i => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })
      .addCase(deleteItem.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteItem.fulfilled, (state, action: PayloadAction<number>) => {
        state.deleteLoading = false;
        state.items = state.items.filter(i => i.id !== action.payload);
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      });
  },
});

export default itemsSlice.reducer;
