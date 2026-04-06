import { createSlice } from "@reduxjs/toolkit";

const counterSlice = createSlice({
    name: "counter",
    initialState: 0, // start with a number
    reducers: {
        increment: (state) => state + 1,
        decrement: (state) => state - 1,
    },
});

export const { increment, decrement } = counterSlice.actions;
export default counterSlice.reducer;