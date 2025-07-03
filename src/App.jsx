import { useState, useEffect} from 'react'
import * as React from 'react';
import './App.css'
import TextField from "@mui/material/TextField";
import * as chrono from 'chrono-node'
import InputSlider from './components/slider.jsx'
import BasicSelect from './components/dropdown.jsx'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


function App() {
  
  // const [count, setCount] = useState(0)
  const [imagePages, setImagePages] = React.useState({});
  const [imageUrl, setImageUrl] = React.useState(" ");
  const [category, setCategory] = React.useState("Parades");
  
  const [goodPage, setGoodPage] = React.useState(true);

  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  useEffect(() => {
    fetch(
      "https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:" + category + "&cmnamespace=6&cmlimit=500&format=json&origin=*",
      requestOptions
      )
      .then(response => {
        return response.json()
      })
      .then(data => {
        setImagePages(data);
        //need to get a random one
        // also need to find one that works :9
        // console.log(data.query.categorymembers[0].title);
        let categoryList = data.query.categorymembers;

        let randomNumber = Math.floor(Math.random() * ((categoryList.length-1) - 1 + 1)) + 1;
        let fileTitle = categoryList[randomNumber].title;

        let valid = false;

        do {
          if (categoryList && fileTitle) {
            valid = true;
          } else {
            randomNumber = Math.floor(Math.random() * ((categoryList.length-1) - 1 + 1)) + 1;
            fileTitle = categoryList[randomNumber].title;
          }
        } while (!valid)


        // let number = 0
        // for (let x = 0; x < categoryList.length-1; x++) {
        //   number += performTaskWithPause(x, data);
        // }
        // console.log("This is the numver: " + number);

        getImageUrl(fileTitle);
      })
      .catch(error => {
        console.error("Category does not exists!" + error);
      });
  }, [category, goodPage])

  function getImageUrl(fileTitle) {
    fetch(
      'https://commons.wikimedia.org/w/api.php?action=query&titles=' + fileTitle + '&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*',
      requestOptions
      )
      .then(response => {
        return response.json()
      })
      .then(data => {
        console.log(Object.values(data.query.pages)[0].imageinfo[0].url)

        let currentImage = Object.values(data.query.pages)[0];
        let hasGPSLatitue = currentImage.imageinfo[0].extmetadata.GPSLatitude;
        let hasGPSLongitude = currentImage.imageinfo[0].extmetadata.GPSLongitude;
        let hasDateTaken = currentImage.imageinfo[0].extmetadata.DateTimeOriginal;

        if (hasGPSLatitue && hasGPSLongitude && hasDateTaken) {
            console.log("Valid");
            setImageUrl(Object.values(data.query.pages)[0].imageinfo[0].url);

            console.log("GPSLAT: " + hasGPSLatitue.value);
            console.log("GPSLON: " + hasGPSLongitude.value);
            console.log("GPSDATE: " + hasDateTaken.value);
            console.log(normalizeWithChrono(hasDateTaken.value));

        } else {
            setGoodPage(!goodPage);
            console.log("Invalid");
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  function normalizeWithChrono(dateStr) {
    const parsed = chrono.parseDate(dateStr)
    if (!parsed) return 'Invalid Date'

    return parsed.toISOString().slice(0, 10)
  }

  // function sleep(ms) {
  // return new Promise(resolve => setTimeout(resolve, ms));
  // }

  // async function performTaskWithPause(index, data) {
  //   console.log("Starting task...");

  
    // let categoryList = data.query.categorymembers;
    // let fileTitle = categoryList[index].title;

    // let counter = 0;
    // if (categoryList && fileTitle) {
    //       getImageUrl(fileTitle);
    //       counter++;
    // }

  //   await sleep(5000); // Pause for 2 seconds
  //   console.log("Resuming task after pause.");
  //   return counter;
  // }

  return (
    <>
      <BasicSelect value={category} onChange={setCategory}></BasicSelect>
      
      {imageUrl ? (
        <img src={imageUrl} alt="Fetching an image!" width={'400px'} height={'400px'}/>
      ) : (
        <p>Loading image...</p>
      )}

      <InputSlider></InputSlider>

      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            You are here!
          </Popup>
        </Marker>
      </MapContainer>
    </>
  )
}

export default App
