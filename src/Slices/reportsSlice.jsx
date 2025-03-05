import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://timemanagementsystemserver.onrender.com/api/reports";

export const fetchReports = createAsyncThunk(
  "reports/fetchReports",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch reports");
    }
  }
);

export const deleteReport = createAsyncThunk(
  "reports/deleteReport",
  async (reportId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${reportId}`);
      return reportId;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete report");
    }
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.list = state.list.filter((report) => report.id !== action.payload);
      });
  },
});

export default reportsSlice.reducer;
