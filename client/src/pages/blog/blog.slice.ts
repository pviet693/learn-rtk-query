import { createAsyncThunk, current, createSlice, PayloadAction, nanoid, AsyncThunk } from "@reduxjs/toolkit";
import { Post } from "types/blog.type";
import http from "utils/http";

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;

type PendingAction = ReturnType<GenericAsyncThunk["pending"]>;
type RejectedAction = ReturnType<GenericAsyncThunk["rejected"]>;
type FulfilledAction = ReturnType<GenericAsyncThunk["fulfilled"]>;

interface BlogState {
	postList: Post[];
	editingPost: Post | null;
	loading: boolean;
	currentRequestId: undefined | string;
	//
	postId: string;
}

const initialState: BlogState = {
	postList: [],
	editingPost: null,
	loading: false,
	currentRequestId: undefined,
	postId: ""
};

export const getPostList = createAsyncThunk("blog/getPostList", async (_, thunkApi) => {
	const response = await http.get<Post[]>("posts", { signal: thunkApi.signal });

	return response.data;
});

export const addPost = createAsyncThunk("blog/addPost", async (payload: Omit<Post, "id">, thunkApi) => {
	try {
		const newPayload = { ...payload, id: nanoid() };
		const response = await http.post<Post>("posts", newPayload, {
			signal: thunkApi.signal
		});

		return response.data;
	} catch (err: any) {
		console.log(err);
		if (err.name === "AxiosError" && err.response.status === 422) {
			return thunkApi.rejectWithValue(err.response.data);
		}
		throw err;
	}
});

export const updatePost = createAsyncThunk("blog/updatePost", async (payload: Post, thunkApi) => {
	try {
		const response = await http.put<Post>(`posts/${payload.id}`, payload, {
			signal: thunkApi.signal
		});

		return response.data;
	} catch (err: any) {
		if (err.name === "AxiosError" && err.response.status === 422) {
			return thunkApi.rejectWithValue(err.response.data);
		}
		throw err;
	}
});

export const deletePost = createAsyncThunk("blog/deletePost", async (id: string, thunkApi) => {
	const response = await http.delete(`posts/${id}`, { signal: thunkApi.signal });

	return response.data;
});

const blogSlice = createSlice({
	name: "blog",
	initialState,
	reducers: {
		startEditingPost: (state, action: PayloadAction<string>) => {
			// const postId = action.payload;
			// const post = state.postList.find((post) => post.id === postId) ?? null;
			// state.editingPost = post;
			state.postId = action.payload;
		},
		cancelEditingPost: (state) => {
			// state.editingPost = null;
			state.postId = "";
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(getPostList.fulfilled, (state, action) => {
				state.postList = action.payload;
			})
			.addCase(addPost.fulfilled, (state, action) => {
				state.postList.push(action.payload);
			})
			.addCase(updatePost.fulfilled, (state, action) => {
				const postId = action.payload.id;
				state.postList.some((post, index) => {
					if (post.id === postId) {
						state.postList[index] = action.payload;
						return true;
					}
					return false;
				});
				state.editingPost = null;
			})
			.addCase(deletePost.fulfilled, (state, action) => {
				const postId = action.meta.arg;
				const postIndex = state.postList.findIndex((post) => post.id === postId);

				if (postIndex >= 0) {
					state.postList.splice(postIndex, 1);
				}
			})
			.addMatcher<PendingAction>(
				(action) => action.type.endsWith("/pending"),
				(state, action) => {
					state.loading = true;
					state.currentRequestId = action.meta.requestId;
				}
			)
			.addMatcher<RejectedAction | FulfilledAction>(
				(action) => action.type.endsWith("/rejected") || action.type.endsWith("/fulfilled"),
				(state, action) => {
					if (state.loading && state.currentRequestId === action.meta.requestId) {
						state.loading = false;
						state.currentRequestId = undefined;
					}
				}
			)
			.addDefaultCase((state, action) => {
				// console.log(`${action.type}`, current(state));
			});
	}
});

export const { startEditingPost, cancelEditingPost } = blogSlice.actions;

const blogReducer = blogSlice.reducer;

export default blogReducer;
