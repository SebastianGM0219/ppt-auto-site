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
  CircularProgress,
  ButtonGroup
} from '@mui/material'

import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import DeleteIcon from '@mui/icons-material/Delete';

import ImageUploadField from "./ImageUploadField";


const TextInputField = ({Idx, shapeIdx, slideIdx, text, type, imgData, handleTextChange, handleImageChange}) => {

  const [value, setValue] = useState(text || '')

  useEffect(() => {
    setValue(text);
  }, [text]);

  const handleChange = (e) => {
    const newTextValue = e.target.value
    const textDataKey = slideIdx + "_" + shapeIdx
    const textData = {shapeIdx, slideIdx, text: newTextValue, type: "text"}
    console.log("updated text data:", textDataKey, textData)
    handleTextChange({ idx: textDataKey, newValue: textData})
  }




  return (
    <Box sx={{ width: '100%', padding: '5px'}}>
      {
        type == "image" ?
          <Box  display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <img style={{ width: '400px', height: '250px', background: 'gray' }} src={`data:image/png;base64,${text}`} alt="Fetched from FastAPI" /> 
              <p style={{ textAlign: 'center', margin: '0px' }}> Original Image </p>
            </Box>

            <KeyboardDoubleArrowRightIcon />
            
            <ImageUploadField Idx={Idx} shapeIdx={shapeIdx} slideIdx={slideIdx} handleImageChange={handleImageChange} />
          </Box>
          :
          <TextField multiline fullWidth value={value} onChange={handleChange} />
      }

    </Box>
  );
};

export default TextInputField;