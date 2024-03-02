import { configureStore } from "@reduxjs/toolkit";
import blogReducer from "./pages/blog/blog.slice";
import { useDispatch } from "react-redux";
import { blogApi } from "pages/blog/blog.service";
import { setupListeners } from "@reduxjs/toolkit/query";
import { rtkQueryErrorLogger } from "middleware";

export const store = configureStore({
	reducer: {
		blog: blogReducer,
		[blogApi.reducerPath]: blogApi.reducer
	},
	// Thêm api middleware để enable các tính năng như caching, invalidation, polling của rtk-query
	middleware: (getDefaultMiddleware) => {
		return getDefaultMiddleware().concat(blogApi.middleware, rtkQueryErrorLogger);
	}
});

// Optional, nhưng bắt buộc nếu dùng tính năng refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
