import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Document, Folder } from '../types';
import apiService from '../services/api';

interface DocumentsState {
  documents: Document[];
  currentDocument: Document | null;
  folders: Folder[];
  folderTree: Folder[];
  currentFolder: Folder | null;
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  documents: [],
  currentDocument: null,
  folders: [],
  folderTree: [],
  currentFolder: null,
  loading: false,
  error: null,
};

// Document thunks
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      return await apiService.getDocuments(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch documents');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      return await apiService.uploadDocument(formData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.deleteDocument(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete document');
    }
  }
);

export const updateDocument = createAsyncThunk(
  'documents/updateDocument',
  async ({ id, data }: { id: number; data: Partial<Document> }, { rejectWithValue }) => {
    try {
      return await apiService.updateDocument(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update document');
    }
  }
);

// Folder thunks
export const fetchFolders = createAsyncThunk(
  'documents/fetchFolders',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.getFolders();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch folders');
    }
  }
);

export const fetchFolderTree = createAsyncThunk(
  'documents/fetchFolderTree',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.getFolderTree();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch folder tree');
    }
  }
);

export const createFolder = createAsyncThunk(
  'documents/createFolder',
  async (data: { name: string; parentId?: number }, { rejectWithValue }) => {
    try {
      return await apiService.createFolder(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create folder');
    }
  }
);

export const deleteFolder = createAsyncThunk(
  'documents/deleteFolder',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.deleteFolder(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete folder');
    }
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setCurrentDocument: (state, action) => {
      state.currentDocument = action.payload;
    },
    setCurrentFolder: (state, action) => {
      state.currentFolder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Documents
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Upload Document
    builder
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.unshift(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Document
    builder
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Document
    builder
      .addCase(updateDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.map(doc =>
          doc.id === action.payload.id ? action.payload : doc
        );
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Folders
    builder
      .addCase(fetchFolders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.loading = false;
        state.folders = action.payload;
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Folder Tree
    builder
      .addCase(fetchFolderTree.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFolderTree.fulfilled, (state, action) => {
        state.loading = false;
        state.folderTree = action.payload;
      })
      .addCase(fetchFolderTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Folder
    builder
      .addCase(createFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.loading = false;
        state.folders.push(action.payload);
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Folder
    builder
      .addCase(deleteFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.loading = false;
        state.folders = state.folders.filter(folder => folder.id !== action.payload);
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentDocument, setCurrentFolder, clearError } = documentsSlice.actions;
export default documentsSlice.reducer;
