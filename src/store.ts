import { configureStore } from '@reduxjs/toolkit';

import usersReducer from './screens/Users/usersSlice';
import itemsReducer from './screens/Iteams/itemsSlice';

const store = configureStore({
  reducer: {
    users: usersReducer,
    items: itemsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
