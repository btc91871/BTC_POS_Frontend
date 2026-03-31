import { createSlice } from "@reduxjs/toolkit";
import { countReset } from "console";
// import { counterSlice } from "console";

export const counterSlice = createSlice({
    InitialState: {
        name: "counter",
        initialState: {
            name: 'counter'
        },
        reducers: {
            increment: (state) => state + 1,
            decrement: (state) => state - 1,

        },
    }
});


export const { increment, decrement } = counterSlice.actions;
export default counterSlice.reducer;