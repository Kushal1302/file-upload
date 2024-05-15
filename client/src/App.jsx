import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast , {Toaster} from 'react-hot-toast'

function App() {
    const [files, setFiles] = useState([]);
    
    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await axios.get('https://file-upload-6bls.onrender.com/files');
            setFiles(response.data);
            console.log(response.data)
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    }

    const handleFileChange = async (e) => {
        console.log(e.target.files[0]);
        const data = new FormData();
        data.append("photos", e.target.files[0]);
        try {
            const response = await axios.post('https://file-upload-6bls.onrender.com/file', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Image uploaded")
            console.log(response);
            
            fetchFiles(); // Refresh files after upload
        } catch (error) {
            console.error(error);
        }
    }
    const handleDelete = async (id) => {
      const res = await axios.delete(`https://file-upload-6bls.onrender.com/delete?id=${id}`)
      fetchFiles()
    } 

    return (
        <>
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
            <input type="file" id="" name="photos" onChange={handleFileChange} />
            <div>
                {files.map(file => (
                    <div key={file._id} style={{display:'flex' , padding:2 , justifyContent:'space-between'}}>
                        <img src={`https://file-upload-6bls.onrender.com/uploads/${file.filename}`} alt={file.filename} />
                        <p style={{cursor:'pointer'}} onClick={() => handleDelete(file.filename)}>delete</p>
                    </div>
                ))}
            </div>
        </>
    );
}

export default App;
