import React, {useState, useEffect} from "react";
import styled from "styled-components";
import {
  Avatar,
  Box,
  Grid,
  Paper,
  Button,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  LinearProgress,
  CircularProgress
} from '@mui/material'


const ImageUploadField = ({Idx, slideIdx, shapeIdx, handleImageChange}) => {

  const [base64Image, setBase64Image] = useState('');

  useEffect(() => {
    console.log("image base 64:", base64Image)
  }, [base64Image]);


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        const cleanBase64 = base64.split(',')[1]; // Using split
        // setBase64Image(cleanBase64); // Set the Base64 string
        setBase64Image(cleanBase64);
        const imgDataKey = slideIdx + "_" + shapeIdx
        const imgData = {shapeIdx, slideIdx, text: cleanBase64, type: "image"}
        handleImageChange({ idx: imgDataKey, newValue: imgData})

      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  const removeImage = (event) => {
    event.preventDefault();

    const imgDataKey = slideIdx + "_" + shapeIdx
    const imgData = {shapeIdx, slideIdx, text: "", type: "image"}
    setBase64Image("");
    handleImageChange({ idx: imgDataKey, newValue: imgData})
  }
  

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <img style={{ width: '400px', height: '250px', background: 'gray' }} src={`data:image/png;base64,${base64Image}`} alt="please upload image" /> 
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id={"upload-button-"+Idx}
        type="file"
        onChange={handleFileChange}
      />

      <Box display="flex" alignItems="center" justifyContent="flex-end" style={{ width: '100%'}}>
        <label htmlFor={"upload-button-"+Idx} style={{ marginLeft: '10px' }}>
          <Button component="span"  size="small">
            Upload
          </Button>
        </label>

        <label style={{ marginLeft: '10px' }}>
          <Button component="span" color="error"  size="small" onClick={removeImage}>
            Delete
          </Button>
        </label>
      </Box>
    </Box>
  );
};

export default ImageUploadField;