import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Folder as FolderIcon } from '@mui/icons-material';
import { createFolder } from '../store/documentsSlice';
import { AppDispatch, RootState } from '../store';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CreateFolderModal: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { folders, loading, error } = useSelector((state: RootState) => state.documents);
  
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    try {
      await dispatch(createFolder({ 
        name: name.trim(),
        parentId: parentId || undefined 
      })).unwrap();
      handleClose();
    } catch (error) {
      console.error('Create folder failed:', error);
    }
  };

  const handleClose = () => {
    setName('');
    setParentId('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Folder</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Folder Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            sx={{ mt: 2, mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel>Parent Folder (Optional)</InputLabel>
            <Select
              value={parentId}
              label="Parent Folder (Optional)"
              onChange={(e) => setParentId(e.target.value as number | '')}
            >
              <MenuItem value="">
                <em>Root Level</em>
              </MenuItem>
              {folders.map((folder) => (
                <MenuItem key={folder.id} value={folder.id}>
                  {folder.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name.trim() || loading}
          startIcon={<FolderIcon />}
        >
          Create Folder
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateFolderModal;
