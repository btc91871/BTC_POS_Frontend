import { configureStore } from '@reduxjs/toolkit'
import countSlice from './slices/counter/index.ts'


export default configureStore({
    reducer: {
        counter: counterSlice,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch