import React, {useState, useEffect} from "react";
import styled from "styled-components";
import {
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


const TextInputField = ({shapeIdx, slideIdx, text, handleTextChange}) => {

  const [value, setValue] = useState(text)

  const handleChange = (e) => {
    const newTextValue = e.target.value
    const textDataKey = slideIdx + "_" + shapeIdx
    const textData = {shapeIdx, slideIdx, text: newTextValue}
    console.log("updated text data:", textDataKey, textData)

    handleTextChange({ idx: textDataKey, newValue: textData})
  }

  // slideIdx: 269, shapeIdx: 5, text: 'Body Text Goes here '


  return (
    <Box sx={{ width: '100%', padding: '5px'}}>
      <TextField multiline fullWidth defaultValue={value} onChange={handleChange} />
    </Box>
  );
};

export default TextInputField;