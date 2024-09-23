import React, {useState, useEffect} from "react";

// import * as React from 'react';

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


import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base';
import DownloadIcon from '@mui/icons-material/Download';

import { styled } from '@mui/system';
import UploadButton from './components/UploadButton';
import ColorPicker from './components/ColorPicker';
import TextInputField from './components/TextInputField';

import { wordList, API_HOST } from './const';
import './App.css';

import Axios from 'axios';
import pptxgen from "pptxgenjs";
const _ = require('lodash');

const CircularLoading = () => (
  <>
    <CircularProgress
      size={50}
      sx={{
        position: "fixed",
        transform: "translate(-50%, -50%)",
        // display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
        zIndex: 2
      }}
      color='secondary'
    />
  </>
);



function App() {

  const [allTexts, setAllTexts] = useState({})
  const [imgDatas, setImgDatas] = useState({})
  const [templateName, setTemplateName] = useState("")
  const [newPresName, setNewPresName] = useState("")
  const [newPresVideoName, setNewPresVideoName] = useState("")

  const [notifyMessage, setNotifyMessage] = useState("")
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);


  

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };







  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('pptFile', file);
    console.log("upload file:", file)
    Axios.post(`${API_HOST}/template/upload`, formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      }    
    })
     .then(response => {
        if(response.status === 200) {
          const responseData = response.data
          console.log("upload response:", responseData)
          setTemplateName(responseData.name)
          setNotifyMessage("File upload successed!")
          setOpen(true)
          // window.confirm(`Uploaded file background color is #${response.data.bgColor}`)
          // setBgColor("#"+response.data.bgColor);
        }
        console.log(response);
      })
      .catch(error => {
        console.error(error);
      });
  };




  const getAllTexts = () => {
    setLoading(true)
    Axios.post(`${API_HOST}/get/texts`, {pptFileName: templateName}, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
     .then(response => {
        setLoading(false)
        if(response.status === 200) {
          const allTextsArrayData = response.data.data
          allTextsArrayData.sort((a, b) => a.type.localeCompare(b.type));

          const allTextsObjData = allTextsArrayData.reduce((acc, item, index) => {
            const textDatakey = item.slideIdx + "_" + item.shapeIdx
            acc[textDatakey] = item; // Use index as key
            return acc;
          }, {});
          // setAllTexts(allTexts => ({ ...allTexts, ...allTextsObjData }));
          setAllTexts(allTexts => ({ ...allTextsObjData }));

          
          let newImgDatas = {}
          for (let key in allTextsObjData) {
            if (allTextsObjData[key].type == "image") {
              newImgDatas[key] = { ...allTextsObjData[key]}
              newImgDatas[key].text = ""
            }
          }

          setImgDatas(newImgDatas)
          console.log("all texts:", allTextsObjData, allTextsArrayData, newImgDatas)
        }
        console.log(response);
      })
      .catch(error => {
        setLoading(false)
        console.error(error);
      });

  }


  const handleTextChange = ({idx, newValue}) => {
    const newTextvalue = {};
    newTextvalue[idx] = newValue;
    console.log("updated text new data:", newTextvalue)
    setAllTexts(allTexts => ({ ...allTexts, ...newTextvalue }));
  }

  const handleImageChange = ({idx, newValue}) => {
    const newTextvalue = {};
    newTextvalue[idx] = newValue;
    setImgDatas(imgDatas => ({ ...imgDatas, ...newTextvalue }));
  }


  const updatePPTText = () => {
    setLoading(true)
    const updatedAllData = {...allTexts, ...imgDatas}
    const allTextsArray = Object.values(updatedAllData);
    const textData = {
      template: templateName,
      data: allTextsArray
    }

    console.log("updated data:", textData)

    Axios.post(`${API_HOST}/update/texts`, textData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
     .then(response => {  
        setLoading(false)
        if(response.status === 200) {
          const responseData = response.data
          console.log("update response:", responseData)
          setNewPresName(responseData.name)
          setNotifyMessage("The PPT was updated successfully!")
          setOpen(true)
        }
        console.log(response);
      })
      .catch(error => {
        setLoading(false)
        console.error(error);
      });
  }



  const exportVideo = () => {
    setLoading(true)
    Axios.post(`${API_HOST}/template/export-video`, {pptFileName: newPresName}, {
      headers: {
          'Content-Type': 'application/json'
      }
    })
     .then(response => {
        setLoading(false)
        if(response.status === 200) {
          const responseData = response.data
          console.log("export response:", responseData)
          setNewPresVideoName(responseData.name)
          setNotifyMessage("The video was created successfully!")
          setOpen(true)
        }
        console.log(response);
      })
      .catch(error => {
        setLoading(false)
        console.error(error);
      });

  }



  const handleDownload = async () => {
    const config = { 
      method: 'get', 
      url: `${API_HOST}/template/download?file_name=${newPresVideoName}`,  
      responseType: 'blob',  
      headers: {  
        'ngrok-skip-browser-warning': true,        
        'Content-Type': 'application/json',  
      },  
    };  

    try {  
      const response = await  Axios.request(config);  
      const blob = response.data;  
      const url = window.URL.createObjectURL(blob);  
      const a = document.createElement('a');  
      a.href = url;  
      a.download = newPresVideoName;  
      document.body.appendChild(a);  
      a.click();  
      document.body.removeChild(a);  
    } catch (err) {  
      console.error('File download failed');
    }  
  }


  return (
    <Box sx={{ width : "100%" }}>
      <Grid spacing={4} container>
        <Grid xs={12} item sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <UploadButton handleUpload={handleFileUpload} />
        </Grid>

        <Grid xs={12} item sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        
          {loading ? <CircularLoading /> : null}
        
          <Grid xs={6} item>
            <Box sx={{ p: 2, border: '1px solid #000', height: '600px',  overflowY: 'auto' }}> 
              {Object.values(allTexts).map((textObj, index) => (
                <TextInputField key={index} Idx={index} shapeIdx={textObj.shapeIdx} slideIdx={textObj.slideIdx} text={textObj.text} 
                  type={textObj.type} handleTextChange={handleTextChange} handleImageChange={handleImageChange} />
              ))}
            </Box>
            <Box sx={{marginTop: '10px', float: 'right'}}>
              <Button variant="contained"  color="primary" sx={{marginLeft: '10px'}} onClick={getAllTexts} disabled={loading}>
                Extract Data
              </Button>
              <Button variant="contained"  color="success" sx={{marginLeft: '10px'}} onClick={updatePPTText} disabled={loading}>
                Update Data
              </Button>
              <Button variant="contained" color="secondary" sx={{marginLeft: '10px'}} onClick={exportVideo} disabled={loading}>
                Create Video
              </Button>
              <Button variant="contained" color="error" sx={{marginLeft: '10px'}} onClick={handleDownload} disabled={loading}>
                Download
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={handleClose}
          // message={notifyMessage}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleClose}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notifyMessage}
          </Alert>
        </Snackbar>
      </Grid>
    </Box>
  );
}

export default App;
