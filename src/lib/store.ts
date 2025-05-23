import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "../features/authSlice";
import courseReducer from "../features/courseSlice";
import learnerReducer from "../features/learnerSlice";
import AdminCourseReducer from "../features/CoursesSlice";
import learnerAuthReducer from "@/features/learnerAuthSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["course"], // Only persist the course slice. Adjust as needed.
};

const rootReducer = combineReducers({
  auth: authReducer,
  course: courseReducer,
  learner: learnerReducer,
  adminCourses: AdminCourseReducer,
  learnerAuth: learnerAuthReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
